var express = require('express');
var User = require('../../models/user');
var Organization = require('../../models/organization');
var Applied = require('../../models/relationships/applied');
var Member = require('../../models/relationships/member');
var Dugnad = require('../../models/dugnad');

// TODO Add PUT
// TODO Add DELETE  


var routes = express.Router();


// ######
// GET ##
// ######

routes.get('/:uuid', (req, res) => {
  Dugnad.get_unique(req.params.uuid)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.send(400).send(err);
  });
});


// #######
// POST ##
// #######


/* Make dugnad
*   Request body: {
*     "title": "my_dugnads_name",
*     "status": "status_of_dugnad", // pre-planning, planning, ongoing, finished
*     "start_time": "when_my_event_will_start",
*     "end_time": "when_my_event_will_end",
*     "description": "what_is_my_event_all_about",
*     "max_partisipants": "max_number_of_possitions" // 0 for infinite
*/
routes.post('/', (req, res) => {
  dugnad = new Dugnad(req.body);
  dugnad.create()
  .then((result) => {
    res.status(200).send("Object created");
  })
  .catch((err) => {
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
    OR (a)-[:Member]->(b)) CREATE (a)-" +
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