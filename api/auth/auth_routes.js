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
  var login_user = new User(req.body);
  User.get_unique(req.body.email)
  .then(actual_user => {
    if (login_user.get_db_fields().password != actual_user.password){
      res.status(400).send({status:'failed', message: "Wrong password"});
    } else {
      buildReturnObject(actual_user).then(returnObj => {
        jwt.sign(returnObj, config.secret, {}, (err, token) => {
          if (!!err) {console.log(err);}
          res.status(200)
            .send({
            success: true,
            message: 'Token to go',
            token: token
          });
        })
      }).catch(err => {
        res.status(400).send({status:'failed', message: err});
      })
    }
  }).catch(err => {
    res.status(400).send({status:'failed', message: err});
  })
})


function buildReturnObject(actual_user){
  return new Promise((res, rej) => {
    delete actual_user.password;
    query = "MATCH (:User {email:'" + actual_user.email +
      "'})-[r:Member]->(b:Organization) RETURN r.is_admin, b.uuid";
    User.custom_query(query).then(result => {
      actual_user.memberships = [];
      result.records.forEach((member) => {
        actual_user.memberships.push({uuid:member._fields[1], is_admin:member._fields[0]})
      })
      console.log(actual_user);
      res(actual_user);
    }).catch(err => {
      rej(err);
    })
  })
}


/*
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
*/



module.exports = routes;
