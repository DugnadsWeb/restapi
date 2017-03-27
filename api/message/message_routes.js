const express = require('express');
const User = require('../models/user');
const Organization = require('../models/organization');
const Message = require('../models/message');


var routes = express.Router();

routes.get('/', (req, res) => {
  res.status(200).send("route works");
});

/* POST message to entity
*   Request body: {
*     "sender": {"type": "senderEntity", "id"},  // user, org
*     "receiver": {"type": "receiverEntity", "unique_id"}, // user, org, dugnad
*     "message": "Message body"
*   }
*   senderEntity and receiverEntity are entities that can send and receive messages.
*
*   Response body: {
*     message: "Status message"
*   }
*/
routes.post('/', (req, res) => {
  if (!req.body.sender || !req.body.receiver || !req.body.message){
    res.status(400).send({'message':'Malforemd body'});
    return;
  }
  try {
    var sender = getEntity(req.body.sender, true);
    var receiver = getEntity(req.body.receiver, false);
  } catch (err) {
    res.status(400).send({'message': err});
    return
  }
  let message = new Message({body: req.body.message, time_sent: new Date().getTime()});
  console.log(message.get_db_fields());
  let query = 'MATCH ' + sender.make_query_object('a') + ', ' +
    receiver.make_query_object('b') + 'CREATE ' + message.make_query_object('c', {use_all: true})
    + ', (a)-[:Sent]->(c), (c)-[:Received]->(b) RETURN c, a';
  Message.custom_query(query).then(result => {
    if (result.records.length == 0) {
      res.status(400).send({"message": "Message was not sent"});
    } else if (result.records[0].length == 2){
      res.status(200).send(makeReceiverReturnObject(result))
      //res.status(200).send({"message": "Message sent successfully"});
      console.log(result)
    } else {
      res.status(400).send({"message": "Serious fault, report at once! This should not happen"});
    }
  })
  .catch(err => {
    res.status(400).send({"message": err});
  })
})

// returns the desired entity given that it's allowed to send or receive
function getEntity(entity, isSender){
  if (entity.type == 'user'){
    return new User({email: entity.id});
  } else if (entity.type == 'org'){
    return new Organization({uuid: entity.id});
  } else if (entity.type == 'dugnad' && !isSender) {
    return new Dugnad({uuid: entity.id});
  } else if (entity.type == 'msg' && !isSender) {
    return new Message({uuid:entity.id})
  }
  throw new Error("Entity " + entity.type + "is not allowed as messanger");
}

/*  Returns all messages sent to an entity from everyone
*   Return body: {
*     "sender": {
*       "type": "i.e. org, user .etc",
*       "id": "id of sender"
*     },
*     "message": {
*       "time_sent": "time the message was sent in ms from epoc",
*       "body": "the content of the message",
*       "uuid": "the message's uuid"
*     }
*   }
*/
routes.get('/:receiverType/:receiverId', (req, res) => {
  receiver = getEntity({type: req.params.receiverType, id:req.params.receiverId}, false);
  query = "MATCH " + receiver.make_query_object('a') +
    "<-[:Received]-(b:Message)<-[:Sent]-(c) RETURN b, c \
    ORDER BY b.sent_time DESC";
  Message.custom_query(query).then(result => {
    if (result.records.length == 0){
      res.status(404).send({message:"No Messages found"});
    } else {
      res.status(200).send(makeReceiverReturnObject(result));
    }
  })
  .catch(err => {
    console.log(err);
    res.status(400).send(err);
  });
})

// formats dbrespons of an entitys every message to return object
function makeReceiverReturnObject(dbRes){
  rets = []
  for (let i=0;i<dbRes.records.length;i++){
    let record = dbRes.records[i];
    let ret = {sender:{}}
    ret.message = record._fields[0].properties;
    ret.sender.type = lableToType(record._fields[1].labels[0])
    ret.sender.id = record._fields[1].properties[typeIdName(ret.sender.type)];
    rets.push(ret);
  }
  return rets
}

// takes lable returns messager type
function lableToType(lable){
  switch (lable) {
    case 'User':
      return 'user';
    case 'Organization':
      return 'org';
  }
}

// returns the property name of the types unique field
// this is not needed if all objects uses an uuid
function typeIdName(type){
  types = {user: User, org: Organization, msg: Message};
  let dbFields = new types[type].db_blueprint()
  for (let prop in dbFields){
    let meta = dbFields[prop].meta;
    if (meta.includes('unique')){
      return prop
    }
  }
  throw "Could not find objects unique field";
}


module.exports = routes;
