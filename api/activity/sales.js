const express = require('express');
const User = require('../models/user');
const SalesActivity = require('../models/activity');


const routes = express.Router();


routes.get('./get-sales-stats/:uuid', (req, res) => {
  let activity = new SalesActivity(req.params);
  let query = "MATCH " + activity.make_query_object() +  "<-[a:Seller]-" +
    "(b:User) RETURN a, b";
  SalesActivity.custom_query(query)
  .then(dbRet => {
    res.status(200).send(formatgetSalesStateRet(dbRet));
  }).catch(err => {
    console.log(err);
    res.status(400).send(err);
  })
})

function formatgetSalesStateRet(dbRet){
  let ret = [];
  for (let i=0;i<dbRet.records.length;i++){
    let sales = dbRet.records[i]._fields[0].properties;
    let users = dbRet.dbRet.records[i]._fields[1].properties;
    ret.push({sales: sales, users:users});
  }
  return ret;
}

/* Set number of product member is in possession of
 * Request body: {
 *  "user": {"email": "eamil@domain.tld"},
 *  "activity": {"uuid": "someuuid"},
 *  "ammount": int
 * }
*/
routes.post('/set-member-supply', (req, res) => {
  if (!req.user || !req.activity || !req.ammount){
    res.status(400).send({message: "Malformed request body"});
    return;
  }
  let user = new User(req.user);
  let activity = new SalesActivity(req.activity);
  let query = "MATCH " + activity.make_query_object() + "<-[a:Attends]-" +
    user.make_query_object() + " SET a :Seller " + " a.product = " + req.ammount +
    "RETURN a";
  Activity.custom_query(query)
    .then(dbRet => {
      if(dbRet.records.length == 1){
        res.status(200).send({message: "Product set"});
      } else {
        res.status(400).send({message: "Something is wrong"});
      }
    }).catch(err => {
      console.log(err);
      res.status(400).send(err);
    })
  })


/* Assign product to member
 * Request body: {
 *  "activity": {"uuid": "someuuid"},
 *  "ammount": int
 * }
*/
routes.post('/set-items.sold', (req, res) => {
  if (!req.activity || !req.ammount){
    res.status(400).send({message: "Malformed request body"});
    return;
  }
  let activity = new Activity(req.activity);
  let query = "MATCH " + activity.make_query_object() + "<-[a:Attends]-" +
    user.make_query_object() + " SET a :Seller " + " a.sold = " + req.ammount +
    "RETURN a";
  Activity.custom_query(query)
    .then(dbRet => {
      if(dbRet.records.length == 1){
        res.status(200).send({message: "Sales set"});
      } else {
        res.status(400).send({message: "Something is wrong"});
      }
  }).catch(err => {
    console.log(err);
    res.status(400).send(err);
  })
})


module.exports = routes;
