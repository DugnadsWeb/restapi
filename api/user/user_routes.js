var express = require('express');
var User = require('../models/user.js');
var Organization = require('../models/organization.js');
var Applied = require('../models/relationships/applied.js');
var jwt = require('jsonwebtoken');

var routes = express.Router();

// #######################
// path mappings #########
// #######################

// GET
routes.get('/', (req, res) => {
  User.read_all_from_class((status, message) => {
    res.status(status).send(message);
  })
});

routes.get('/:email', (req, res) => {
  var user = new User(req.params);
  user.read((status, message) => {
    res.status(status).send(message);
  });
});

// TODO trenger vi egentlig denne, kan egentlig sende med brukerinfo under innlogging
routes.post('/me', (req,res) => {
	var token = req.body.token;
	//console.log(token);
	var decoded = jwt.decode(token, {complete: true});
	//console.log(decoded);
	//console.log(decoded.payload);
	var payload = decoded.payload;
	var payload = JSON.stringify({payload});
	res.status(200).send(payload);

	//res.send(decoded);
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

/*
* Apply to organisation
*   Request body:
*    "user": {
*      "email": "email@interwebs.tld"
*    },
*    "organisation": {
*      "uuid": "9a7210e3-395b-43bc-a92d-4fbb24e1aa81"
*    }
*/

routes.post('/join', (req, res) => {
  User.get_unique(req.body.user.email)
  .then((user_res) => {
    Organization.get_unique(req.body.organization.uuid)
    .then((org_res) => {
      user = new User(user_res);
      org = new Organization(org_res);
      user.create_relation(org, new Applied)
      .then(() => {
        res.status(200).send("Application sent")
      })
      .catch((err) =>{
        res.status(400).send(err)
      })
    })
    .catch((err) => {
      res.status(400).send(err)
    });
  })
  .catch((err) => {
    res.status(400).send(err)
  })
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
