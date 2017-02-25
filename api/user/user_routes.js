var express = require('express');
var User = require('../models/user.js');
var Organization = require('../models/organization.js');
var Applied = require('../models/relationships/applied.js');
var jwt = require('jsonwebtoken');

var routes = express.Router();

// #######################
// path mappings #########
// #######################

// TODO IMPORTANT: Do not return database errors in production



// GET
routes.get('/', (req, res) => {
  User.read_all_from_class((status, message) => {
    res.status(status).send(message);
  })
});

routes.get('/:email', (req, res) => {
  User.get_unique(req.params.email)
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

// TODO trenger vi egentlig denne, kan egentlig sende med brukerinfo under innlogging
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
  user = new User(req.body.user);
  org = new Organization(req.body.organization);
  application = new Applied();
  user.create_relation(org, application, {unique: true})
  .then(() => {
    res.status(200).send("Application sent");
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

// PUT
/*
* Edit user info
*   Request body {
*     "user": { "eamil": email@interwebs.tls },
*     "edited_user": { user fileds to change }
*   }
*/
routes.put('/', (req, res) => {
  var user = new User(req.body.user);
  var edited_user = new User(req.body.edited_user);
  user.update(edited_user)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(400).send(err);
  })
});


// DELETE
routes.delete('/', (req, res) => {
  var user = new User(req.body);
  user.delete()
  .then((response) => {
      res.status(200).send(response);
  })
  .catch((err) => {
    res.status(200).send(err);
  });
});


module.exports = routes;
