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
*     "sender": {"type": "senderEntity", "id"},  // user, organization
*     "receiver": {"type": "receiverEntity", "unique_id"}, // user, organisation, dugnad
*     "message": "Message body"
*   }
*   senderEntity and receiverEntity are entities that can send and receive messages.
*
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
    + ', (a)-[:Sent]->(c), (c)-[:Received]->(b) RETURN a, b, c';
  Message.custom_query(query).then(result => {
    if (result.records.length == 0) {
      res.status(400).send({"message": "Message was not sent"});
    } else if (result.records[0].length == 3){
      res.status(200).send({"message": "Message sent successfully"});
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


module.exports = routes;
