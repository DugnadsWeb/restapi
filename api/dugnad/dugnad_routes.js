var express = require('express');
var User = require('../models/user');
var Organization = require('../models/organization');
var Applied = require('../models/relationships/applied');
var Member = require('../models/relationships/member');
var Dugnad = require('../models/dugnad');

// TODO Add PUT
// TODO Add DELETE? delete nothing, agregate everything


var routes = express.Router();


// ######
// GET ##
// ######

// get dugnad by id
routes.get('/:uuid', (req, res) => {
  Dugnad.get_unique(req.params.uuid)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

routes.get('/activities/:uuid', (req, res) => {
  let dugnad = new Dugnad(req.params);
  let query = "MATCH " + dugnad.make_query_object('a') +
    "-[:Has]->(b:Activity) RETURN b";
  Dugnad.custom_query(query)
  .then((result) => {
    res.status(200).send(formatGetActivityReturn(result));
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

function formatGetActivityReturn(dbReturn){
  let ret = [];
  for (let i=0;i<dbReturn.records.length;i++){
    ret.push(dbReturn.records[i]._fields[0].properties);
  }
  return ret;
}


routes.get('/organization/:uuid', (req,res) => {
  let org = new Organization(req.params);
  query = "MATCH " + org.make_query_object('a') +
  "-[:Owns]->(b:Dugnad) " +
  "RETURN b";
  Organization.custom_query(query)
      .then(ret => {
        res.status(200).send(formatDugnadReturn(ret));
      })
      .catch((err) => {
        res.status(400).send(err);
      });
});

function formatDugnadReturn(dbDugnad){
  let ret = [];

  for(let i=0; i < dbDugnad.records.length; i++){
    ret.push(dbDugnad.records[i]._fields[0].properties)
  }
  return ret;
}
// #######
// POST ##
// #######


/* Make dugnad
*   Request body: {
      "dugnad": {
*       "title": "my_dugnads_name",
*       "status": "status_of_dugnad", // pre-planning, planning, ongoing, finished
*       "location": "place",
*       "startTime": "when_my_event_will_start",
*       "endTime": "when_my_event_will_end",
*       "description": "what_is_my_event_all_about",
*       "maxPartisipants": "max_number_of_possitions" // 0 for infinite
*     },
*     "user": {"email": "email@domail.tld"},
*     "org":  {"uuid": "someuuid"}
*/
routes.post('/', (req, res) => {
  console.log(req.body.dugnad);
  console.log(req.body.org);
  let dugnad = new Dugnad(req.body.dugnad);
  let org = new Organization(req.body.org);
  dugnad.create()
  .then((result) => {

    dugnad = new Dugnad(result.records[0]._fields[0].properties);
    query = "MATCH " + dugnad.make_query_object('a') +
    ", " + org.make_query_object('b') +
    "CREATE " + "(b)-[:Owns]->(a) RETURN a";
    Dugnad.custom_query(query).then(ret => {
      console.log(ret);
      if (ret.records.length == 1){
        res.status(200).send(ret.records[0]._fields[0].properties);
      } else {
        res.status(400).send({message: "Something is wrong!"});
      }
    })
    .catch(err => {
      console.log('i am thorp');
      res.status(400).send(err);
    })
  })
  .catch((err) => {
    console.log('im callled dave the snake');
    console.log(err);
    res.status(400).send(err);
  })
});


/* Apply to dugnad
*   Request body:
*    "user": {
*      "email": "email@interwebs.tld"
*    },
*    "dugnad": {
*      "uuid": "9a7210e3-395b-43bc-a92d-4fbb24e1aa81"
*    }
*/
routes.post('/apply', (req, res) => {
  user = new User(req.body.user);
  dugnad = new Dugnad(req.body.dugnad);
  application = new Applied();
  query = "MATCH " + user.make_query_object('a') + ", " +
    dugnad.make_query_object('b') + " WHERE NOT ((a)-[:Applied {status: 'true'}]->(b) \
    CREATE (a)-" +
    application.make_query_object('c', {use_all: true}) + "->(b)";
  User.custom_query(query)
  .then((result) => {
    res.status(200).send("Application submitted");
  })
  .catch((err) => {
    res.status(200).send(err);
  });
});



module.exports = routes;
