var express = require('express');
var routes = express.Router();

// api Routes
var user = require('./user/user_routes');
var auth = require('./auth/auth_routes');
var organization = require('./org/organization_routes');
var message = require('./message/message_routes');


routes.all("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, \
    Content-Length, X-Requested-With, application/json');
  next();
});

routes.options("/*", function(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, \
    Content-Length, X-Requested-With, application/json');
  res.sendStatus(200);
});


routes.use('/user', user);
routes.use('/auth', auth);
routes.use('/org', organization);
routes.use('/msg', message);

module.exports = routes;
