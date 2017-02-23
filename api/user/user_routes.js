var express = require('express');
var User = require('../models/user.js');
var Organization = require('../models/organization.js');
var Applied = require('../models/relationships/applied.js');

var routes = express.Router();

// #######################
// path mappings #########
// #######################

// GET
routes.get('/', (req, res) => {
  User.read_all_from_class('User', (status, message) => {
    res.status(status).send(message);
  })
});

routes.get('/:email', (req, res) => {
  var user = new User(req.params);
  user.read((status, message) => {
    res.status(status).send(message);
  });
});

// #######
// POST ##
// #######

// Create user
routes.post('/', (req, res) => {
  var user = new User(req.body);
  user.create((status, message) => {
    res.status(status).send(message);
  });
});

// Apply to organisation
routes.post('/join', (req, res) => {
  var user = new User(req.body.user);
  var org = new Organization(req.body.organisation);
  user.create_relation(org, new Applied())
    .then((message) => {
      console.log(message);
    });
  res.sendStatus(204);
});


// PUT
routes.put('/', (req, res) => {
  var user = new User(req.body);
  user.update((status, message) => {
    res.status(status).send(message);
  });
});


// DELETE
routes.delete('/', (req, res) => {
  var user = new User(req.body);
  user.delete((status, message) => {
    res.status(status).send(message);
  });
});


module.exports = routes;
