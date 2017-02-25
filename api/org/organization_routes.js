var express = require('express');
var User = require('../models/user');
var Organization = require('../models/organization');
var Applied = require('../models/relationships/applied');


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

//
routes.get('/applicants/:uuid', (req, res) => {
  org = new Organization(req.params);
  application = new Applied({status: true});
  org.get_realations_of_type(User.name, application)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
  /*Organization.get_unique(req.params.uuid)
  .then((org) => {
    org = new Organization(org);
    org.get_realations_of_type(User.name, Applied.name)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(200).send(err);
    })
  })
  .catch((err) => {
    res.status(400).send(err);
  });*/
})



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




module.exports = routes;
