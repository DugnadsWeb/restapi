const express = require('express');
const User = require('../models/user');
const SalesActivity = require('../models/activity');


const routes = express.Router();


routes.get('/stats/:uuid', (req, res) => {
  let activity = new SalesActivity(req.params);
  let query = "MATCH " + activity.make_query_object() +  "<-[a:Attends]-" +
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
    let sold = 0;
    let product = 0;
    if (!!dbRet.records[i]._fields[0].properties.sold)
      sold = dbRet.records[i]._fields[0].properties.sold.low;
    if (!!dbRet.records[i]._fields[0].properties.product)
      product = dbRet.records[i]._fields[0].properties.product.low;
    let user = dbRet.records[i]._fields[1].properties;
    ret.push({product: product, sold: sold, user:user});
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
  if (!req.body.user || !req.body.activity || !req.body.ammount){
    res.status(400).send({message: "Malformed request body"});
    return;
  }
  let user = new User(req.body.user);
  let activity = new SalesActivity(req.body.activity);
  let query = "MATCH " + activity.make_query_object() + "<-[a:Attends]-" +
    user.make_query_object() + " SET a.product = " + req.body.ammount +
    " RETURN a";
  SalesActivity.custom_query(query)
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
routes.post('/set-items-sold', (req, res) => {
  if (!req.body.activity || !req.body.ammount){
    res.status(400).send({message: "Malformed request body"});
    return;
  }
  let activity = new SalesActivity(req.body.activity);
  let user = new User(req.auth_token);
  let query = "MATCH " + activity.make_query_object() + "<-[a:Attends]-" +
    user.make_query_object() + " SET a.sold = " + req.body.ammount +
    " RETURN a";
  SalesActivity.custom_query(query)
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
