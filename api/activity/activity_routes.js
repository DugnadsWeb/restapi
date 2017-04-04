const express = require('express');
const Activity = require('../models/activity');
const Dugnad = require('../models/dugnad');

const routes = express.Router();


/* Create new activity
*   request body {
*     activity: {
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
  let activity = new Activity(req.body.activity);
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

/* Allpy to activity
*   Request body {
*     "activity" : { "uuid": "idstring" },  // the activity to apply to
*     "user" : { "email": "email@domain.tld"},  // user to apply
*     "action" : boolean  // true to apply, flase to unapply
*   }
*/
routes.post('/apply', (req, res) => {
  if (!req.body.activity || !req.body.user || !req.body.action){
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
      "CREATE OPTIONAL (b)-[r:Attends]->(a) " +
      "RETURN r";

    Activity.custom_query(query).then(ret => {
      if (ret.records.length == 0) {
        res.status(400).send({message:"User all ready applied"});
      } else if (ret.records.length == 1) {
        res.status(200).send({message: "user applied"});
        // TODO add meta data aka token_user-[assigned {userId, timestamp}]->(activity)
      } else {
        res.status(400).send({message:"something is seriously wrong"});
      }
    }).catch(err => res.status(400).send(err));
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








module.exports = routes;
