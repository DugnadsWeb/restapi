var express = require('express');
var User = require('../models/user.js');

var routes = express.Router();

// #######################
// path mappings #########
// #######################

// GET
routes.get('/', (req, res) => {
  // TODO super ugly solution!! needs to be fixed
  new User({email: 'fafvs'}).read_all_from_class('User', (status, message) => {
    console.log(message);
    res.status(status).send(message);
  })
});

routes.get('/:email', (req, res) => {
  var user = new User(req.params);
  user.read((status, message) => {
    res.status(status).send(message);
  });
});


// POST
routes.post('/', (req, res) => {
  var user = new User(req.body);
  user.create((status, message) => {
    res.status(status).send(message);
  });
});


// PUT
routes.put('/', (req, res) => {
  var user = new User(req.body);
  user.update((status, message) => {
    res.status(status).send(message);
  });
});

module.exports = routes;
