const express = require('express');
const Activity = require('../models/activity');
const Dugnad = require('../models/dugnad');
const SalesActivity = require('../models/sales_activity');
const User = require('../models/user');
const sales = require('./sales');

const routes = express.Router();



// ######
// GET ##
// ######


routes.get('/:uuid', (req, res) => {
  Activity.get_unique(req.params.uuid)
  .then((activity) => {
    console.log(activity);
    activity.type = activity.labels[activity.labels.length-1];
    res.status(200).send(activity);
  })
  .catch(err => {
    console.log("GET activity error!");
    console.log(err);
    res.status(400).send(err);
  })
})

routes.get('/attendants/:uuid', (req, res) => {
  let activity = new Activity(req.params);
  let query = "MATCH " + activity.make_query_object('a') +
    "<-[:Attends]-(b:User) RETURN b";
  Activity.custom_query(query).then(ret => {
    res.status(200).send(formatGetAttendants(ret));
  }).catch(err => res.status(400).send(err));
})

function formatGetAttendants(dbRet){
  let ret = [];
  for (let i=0;i<dbRet.records.length;i++){
    ret.push(dbRet.records[i]._fields[0].properties);
    delete ret[ret.length-1].password;
  }
  return ret;
}

// #######
// POST ##
// #######

/* Create new activity
*   request body {
*     activity: {
*       type: "Activity"/"SalesActivity",
*       startTime: time in ms,
*       endTIme: time in ms,
*       description: description of activity,
*       maxPartisipants: max number of partisipants allowed
*     },
*     dugnad: {
*       uuid: uuid of parent dugnad
*     }
*   }
*/
routes.post('/', (req, res) =>{
  if(!req.body.activity || !req.body.dugnad){
    res.status(400).send({message: "Malformed request body"});
    return;
  }
  let activity;
  console.log(req.body.activity.type);
  switch (req.body.activity.type) {
    case "Activity":
      activity = new Activity(req.body.activity);
      break;
    case "SalesActivity":
      activity = new SalesActivity(req.body.activity);
      break;
    default:
      console.log(req.body.activity);
      res.status(400).send("Wrong activity type");
      return;
  }

  let dugnad = new Dugnad(req.body.dugnad);
  activity.create()
  .then(result => {
    console.log(result.records[0]._fields[0].properties);
    activity = new Activity(result.records[0]._fields[0].properties);
    let query = "MATCH " + activity.make_query_object('a') + ", " +
      dugnad.make_query_object('b') + " CREATE (a)<-[:Has]-(b) RETURN a";
    console.log(query);
    Activity.custom_query(query).
    then(result => {
      console.log(result);
      if (result.records.length == 1){
        res.status(200).send(result.records[0]._fields[0].properties);
      }else {
        res.status(400).send({message: "Something is wrong"});
      }
    }).catch(err => res.status(400).send(err))
  }).catch(err => res.status(400).send(err))
})

/* Allpy/unapply to activity
*   Request body {
*     "activity" : { "uuid": "idstring" },  // the activity to apply to
*     "user" : { "email": "email@domain.tld"},  // user to apply
*     "action" : boolean  // true to apply, flase to unapply
*   }
*/
routes.post('/apply', (req, res) => {
  if (!req.body.activity || !req.body.user || !(typeof req.body.action == 'boolean')){
    res.status(400).send({message:"Malformed request"});
    return;
  }
  let activity = new Activity(req.body.activity);
  let user = new User(req.body.user);
  let action = req.body.action;
  if (action) {
    apply(activity, user, res);
  } else {
    unapply(activity, user, res);
  }

  function apply(activity, user, res){
    let query = "MATCH " + activity.make_query_object('a') + ", " +
      user.make_query_object('b') +
      " CREATE UNIQUE (b)-[r:Attends]->(a) " +
      "RETURN r";
    console.log(query);
    Activity.custom_query(query).then(ret => {
      if (ret.records.length == 0) {
        res.status(400).send({message:"User already applied"});
      } else if (ret.records.length == 1) {
        res.status(200).send({message: "user applied"});
        // TODO add meta data aka token_user-[assigned {userId, timestamp}]->(activity)
      } else {
        res.status(400).send({message:"something is seriously wrong"});
      }
    }).catch(err => {
      console.log(err);
      res.status(400).send(err)
    });
  }

  function unapply(action, user, res){
    let query = "MATCH " + activity.make_query_object('a') +
      "<-[r:Attends]-" + user.make_query_object('b') +
      "DELETE r RETURN id(r)";

    Activity.custom_query(query).then(ret => {
      if (ret.records.length == 0) {
        res.status(400).send({message:"User not applied"});
      } else if (ret.records.length == 1) {
        res.status(200).send({message: "User unapplied"});
        // TODO add meta data aka token_user-[unassigned {userId, timestamp}]->(activity)
      } else {
        res.status(400).send({message:"something is seriously wrong"});
      }
    }).catch(err => res.status(400).send(err));
  }

})




// #######
// PUT ###
// #######

// PUT
/*
* Edit activity info
*   Request body {
*     "activity": { uuid and activity fileds to change }
*   }
*/
routes.put('/', (req, res) => {
  console.log(req.body);
  if (!req.body.activity) {
    res.status(400).send({message:"request body is incomplete"});
    return;
  }
  console.log(req.body.activity);
  var activity = new Activity(req.body.activity);
  // reson for taking itself as an argument: it is intentded for objects that can mutate its own unique id
  activity.update(activity)
  .then((result) => {
    res.status(200).send({message: "Activity updated"});
  })
  .catch((err) => {
    res.status(400).send(err);
  })
});


routes.use('/sales', sales);




module.exports = routes;
