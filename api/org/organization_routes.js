var express = require('express');
var User = require('../models/user');
var Organization = require('../models/organization');
var Applied = require('../models/relationships/applied');
var Member = require('../models/relationships/member')


var routes = express.Router();

// ######
// GET ##
// ######

// returns all organisations
// TODO make promise not callback
routes.get('/all', (req, res) => {
  Organization.read_all_from_class((status, message) => {
    res.status(status).send(message);
  })
});

// get a unique organization
routes.get('/:uuid', (req, res) => {
  Organization.get_unique(req.params.uuid)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    console.log(err);
    res.status(400).send(err);
  });
});

// Returns list of active applicants
routes.get('/:uuid/applicants', (req, res) => {
  let org = new Organization(req.params);
  application = new Applied({status: true});
  org.get_realations_of_type(User.name, application)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});


routes.get('/:uuid/members', (req, res) => {
  let org = new Organization(req.params);
  query = "MATCH ()"
});


// #######
// POST ##
// #######

// Create user
routes.post('/', (req, res) => {
  Organization.get_from_unique_identifier(null);
  var org = new Organization(req.body);
  org.create((status, message) => {
    res.status(status).send(message);
  });
});

/* Process application
* Request body:
*   {
*     "user": { "email": email@internetz.tld },
*     "organization": { uuid: this-is-not-a-real-uuid },
*     "accept:" true/false
*   }
* TODO edit response
*/
routes.post('/applicant', (req, res) => {
  let user = new User(req.body.user);
  let org = new Organization(req.body.organization);
  let query = "MATCH " + user.make_query_object('a') + "-" +
    "[r:Applied {status: 'true'}]->" + org.make_query_object('b') +
    "SET r.status = 'false' ";
  if (req.body.accept) {
    query += "CREATE (a)-" + new Member().make_query_object('v', {use_all: true})
     + "->(b)";
  }
  Organization.custom_query(query)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
})

/* Set admin
*   Request body: {
*     "user" { email: email@interwebs.tld },
*     "organization": { uuid: this-is-not-a-real-uuid },
*     "admin": true/false // true to set admin, false to revoke
* TODO edit response
*/
routes.post('/chadmin', (req, res) => {
  let user = new User(req.body.user);
  let org = new Organization(req.body.organization);
  query = "MATCH " + user.make_query_object('a') +
    "-[c:Member]->" + org.make_query_object('b') +
    "SET c += {is_admin: '" + req.body.admin + "'} RETURN a";
  console.log(query);
  Organization.custom_query(query)
  .then((result) => {
    res.status(200).send("Admin rights " + (req.body.admin? "granted" : "revoked"));
  })
  .catch((err) => {
    res.status(400).send(err);
  })
})


module.exports = routes;
