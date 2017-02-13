var express = require('express');

// api Routes
var user = require('./user/user_routes');


var routes = express.Router();


routes.use('/user', user);


module.exports = routes;
