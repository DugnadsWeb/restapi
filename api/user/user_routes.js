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



// GET all
routes.get('/', (req, res) => {
  User.read_all_from_class((status, message) => {
    res.status(status).send(message);
  })
});

// GET unique user
routes.get('/:email', (req, res) => {
  User.get_unique(req.params.email)
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

// GET users active org applications
routes.get('/applications/:email', (req, res) => {
  let user = new User(req.params);
  query = "MATCH " + user.make_query_object('a') +
    "-[:Applied {status: 'true'}]->(b:Organization) " +
    "RETURN b";
  User.custom_query(query)
  .then(ret => {
    res.status(200).send(formatActiveApplications(ret));
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

//GET users profilepicture
routes.get('/picture/:email', (req, res) => {
	let user = new User(req.params);
	query = "MATCH " + user.make_query_object('a') +
	"-[:Has]->(b:ProfileImage) " +
	"RETURN b ORDER BY b.timestamp DESC LIMIT 1";
	User.custom_query(query)
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

function formatActiveApplications(dbRet){
  console.log(dbRet.records[0]);
  let ret = [];
  for (let i=0;i<dbRet.records.length;i++){
    ret.push(dbRet.records[i]._fields[0].properties.uuid);
  }
  return ret;
}



// #######
// POST ##
// #######

/* Create user
*   Request body: {
*     "firstName": "my_firstName",
*     "lastName": "my_lastName",
*     "email": "my_email@domain.tld",
*     "password": "my_super_safe_pw"
*   }
*/
routes.post('/', (req, res) => {
  var user = new User(req.body);
  user.create()
  .then((result) => {
    res.status(200).send({message:"User created"});
  })
  .catch((err) => {
    res.status(400).send(err);
  })
});

//Upload profile picture for user

routes.post('/picture', (req,res) => {
  var user = new User(req.body.user);
  query = "MATCH " + user.make_query_object('a') +
    "CREATE (a)-[:Has]->(b:ProfileImage{timestamp: TIMESTAMP(), base64:'" + req.body.base64 + "'}) " +
    "RETURN b";
  User.custom_query(query)
  .then((ret) => {
  	 res.status(200).send(ret);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

// TODO trenger vi egentlig denne, kan egentlig sende med brukerinfo under innlogging
routes.post('/me', (req,res) => {
	var token = req.body.token;
	var decoded = jwt.decode(token, {complete: true});
	var payload = decoded.payload;
	var payload = JSON.stringify({payload});
	res.status(200).send(payload);
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
  if (!req.body.user || !req.body.edited_user) {
    res.status(400).send({message:"request body is incomplete"});
    return;
  }
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
    res.status(400).send(err);
  });
});


module.exports = routes;
