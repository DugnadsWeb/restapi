var express = require('express');
var User = require('../models/user');
var Organization = require('../models/organization');

var routes = express.Router();

// #######################
// path mappings #########
// #######################

// GET
routes.get('/all', (req, res) => {
  Organization.read_all_from_class((status, message) => {
    res.status(status).send(message);
  })
});

// get a unique organisation
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
