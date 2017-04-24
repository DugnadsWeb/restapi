const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const routes = express.Router();
var driver = require('../neo4j_db')();


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

// open apis
routes.use('/auth', auth);

// api lockdown middleware
routes.use((req, res, next) => {
    if (req.url == '/user/' && req.method == 'POST'){
        next();
        return
    }
    if ('authorization' in req.headers){
      let token = req.headers.authorization.substring(7);
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          res.status(401).send({message: "Token is invalid, log in and out"});
          return;
        }
        console.log('valid token :D');
        req.auth_token = decoded;
        next();
      })
    } else {
      next();
      //res.status(401).send({message: "Invalid auth token. Please log in again"});
    }
})
// token locked apis
routes.use('/user', user);
routes.use('/org', organization);
routes.use('/msg', message);
routes.use('/dugnad', dugnad);
routes.use('/activity', activity);


routes.use((req, res, next) => {
  driver.close();
});

module.exports = routes;
