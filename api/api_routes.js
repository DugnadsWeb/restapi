const express = require('express');
const routes = express.Router();
const driver = require('../neo4j_db')();
const authMiddleware = require('./middleware/auth_middleware');
const resEndMiddleware = require('./middleware/res_end_middleware');


// api Routes
var user = require('./user/user_routes');
var auth = require('./auth/auth_routes');
var organization = require('./org/organization_routes');
var message = require('./message/message_routes');
var dugnad = require('./dugnad/dugnad_routes');
var activity = require('./activity/activity_routes');

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

// inputsanitizer
var sanitizer = require('./middleware/quote_escaper_middleware');
routes.use(sanitizer);

// open apis
routes.use('/auth', auth);

// api lockdown middleware
routes.use(authMiddleware);

// token locked apis
routes.use('/user', user);
routes.use('/org', organization);
routes.use('/msg', message);
routes.use('/dugnad', dugnad);
routes.use('/activity', activity);

// on en middleware
routes.use(resEndMiddleware);


module.exports = routes;
