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

routes.post('/me', (req,res) => {
	var token = req.body.token;
	//console.log(token);
	var decoded = jwt.decode(token, {complete: true});
	//console.log(decoded);
	var decoded = JSON.stringify({decoded});
	res.status(200).send(decoded);

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

// Apply to organisation
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
  /*
  var org = Organization.get_unique(req.body.organization.uuid);
  Promise.all([user, org])
    .then(values => {
      user = new User(values[0]);
      org = new Organization(values[1]);
      user.create_relation(org, new Applied())
      .then(() => {
        res.status(200).send("Application sent");
      })
      .catch((err) => {
        res.status(400).send(err);
      })
    })
    .catch((err) => {
      console.log(err);
    })

  user.create_relation(org, new Applied(), (status, message) => {
    res.status(status).send(message);
  });
  */
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
