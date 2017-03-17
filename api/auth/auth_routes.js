var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var User = require('../models/user.js');

var routes = express.Router();

/*
* Authenticates user by email address and password.
* TODO write unit tests!!! not sure what happens if wrong cridentials are passed
*/
routes.post('/', (req, res) => {
  var user_in = new User(req.body);
  User.get_unique(req.body.email)
  .then((result) => {
    if (user_in.db_fields.password.data == result.password){
      result.password = null;
      user = new User(result)
      jwt.sign(user, config.secret, {}, (err, token) => {
        console.log(err);
        res.status(200)
          .send({
          success: true,
          message: 'Token to go',
          token: token
        });
      })
    } else{
      res.status(400).send({
        success: false,
        message: 'authentication failed'
      });
    }
  })

  .catch((err) => {
    res.status(400).send({
      success: false,
      message: 'authentication failed'
    });
  });
});
  /*
  user.db_fields.password.meta.push('use');
  user.read((status, response) => {
    if (status == 200){
      user = new User(response);;
      jwt.sign(user, config.secret, {}, (err, token) => {
        res.status(status)
          .send({
          success: true,
          message: 'Token to go',
          token: token
        });
      });
    }else{
      res.status(400).send({
        success: false,
        message: 'authentication failed'
      });
    }
  });
  */




module.exports = routes;
