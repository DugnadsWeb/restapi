var express = require('express');
var routes = express.Router();

// api Routes
var user = require('./user/user_routes');
var auth = require('./auth/auth_routes');


routes.use('/user', user);
routes.use('/auth', auth);


module.exports = routes;
