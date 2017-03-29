var express = require('express');
var User = require('../models/user');
var Organization = require('../models/organization');
var Applied = require('../models/relationships/applied');
var Member = require('../models/relationships/member');
var dugnad_routes = require('./dugnad/dugnad_routes');


// TODO add PUT
// TODO add DELETE

var routes = express.Router();



routes.use('/dugnad', dugnad_routes);

// ######
// GET ##
// ######

// returns all organisations
// TODO make promise not callback
routes.get('/all', (req, res) => {
  Organization.read_all_from_class((status, message) => {
    res.status(status).send(message);
  })
});

// get a unique organization
routes.get('/:uuid', (req, res) => {
  Organization.get_unique(req.params.uuid)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    if (err == "No results found"){
      res.status(404).send(err);
    } else {
      res.status(400).send(err);
    }
  });
});

// Returns list of active applicants
routes.get('/applicants/:uuid', (req, res) => {
  let org = new Organization(req.params);
  application = new Applied({status: true});
  query = "MATCH " + org.make_query_object('a') +
    "<-[r:Applied {status:'true'}]-(b:User) RETURN a, b, r \
    ORDER BY r.applied_date ASC";
  Organization.custom_query(query)
  .then((result) => {
      res.status(200).send(formatApplicationsReturn(result));
  })
  .catch((err) => {
    console.log(err);
    res.status(400).send(err);
  });
});

// formats output
function formatApplicationsReturn(result){
  ret = []
  for (let i=0;i<result.records.length;i++){
    let application = {};
    let record = result.records[i]._fields;
    user = record[1].properties;
    user.password = null;
    let applied = record[2].properties;
    ret.push({user: user, applied: applied});
  }
  return ret;
}


routes.get('/members/:uuid', (req, res) => {
  let org = new Organization(req.params);
  query = "MATCH " + org.make_query_object('a') + "<-[r:Member]-(b:User) " +
  "RETURN r, b";
  Organization.custom_query(query).then(result => {
    res.status(200).send(formatMemberReturn(result));
  })
  .catch(err => {
    res.status(400).send(err);
  })
});

function formatMemberReturn(result){
  let ret = {admins:[], members:[]};
  for (let i=0;i<result.records.length;i++){
    let membership = result.records[i]._fields[0].properties;
    let member = result.records[i]._fields[1].properties;
    delete member.password;
    if (membership.is_admin == 'true'){
      ret.admins.push(member);
    }else{
      ret.members.push(member);
    }
  }
  return ret;
}


// #######
// POST ##
// #######

/* Create user
*   Request body: {
*     "orgNumber": "my_nine_digit_orgNumber",
*     "name": "my_orgs_name",
*     "email": "my_orgs_email@domain.tld",
*     "phone": "my_orgs_phone_number",
*     "description": "a_discription_of_my_organizations"
*/
routes.post('/', (req, res) => {
  console.log(req.auth_token);
  var org = new Organization(req.body);
  var creator = new User({email: req.auth_token.email});
  org.create()
  .then((result => {
    let memb = new Member();
    memb.db_fields.is_admin.data = true;
    query = "MATCH " + creator.make_query_object('a') +
      ", " + org.make_query_object('b') + "CREATE (a)-" +
      memb.make_query_object('r', {use_all: true }) + "->(b)"
    User.custom_query(query)
    .then(result => {
      res.status(200).send({msg: "Organization created"});
    })
    .catch(err => {
      console.log(err);
      res.status(400).send({message: "org was created, but could not set creator as admin"});
    });
  }))

  .catch((err) => {
    res.status(400).send(err);
    console.log(err);
  });
});

/* Process application
* Request body:
*   {
*     "user": { "email": email@internetz.tld },
*     "org": { uuid: this-is-not-a-real-uuid },
*     "accept:" true/false
*   }
* TODO edit response
*/
routes.post('/applicant', (req, res) => {
  let user = new User(req.body.user);
  let org = new Organization(req.body.org);
  let query = "MATCH " + user.make_query_object('a') + "-" +
    "[r:Applied {status: 'true'}]->" + org.make_query_object('b') +
    "SET r.status = 'false' ";
  if (req.body.accept) {
    query += "CREATE (a)-" + new Member().make_query_object('v', {use_all: true})
     + "->(b)";
  }
  query += " RETURN a, b, r";
  Organization.custom_query(query)
  .then((result) => {
    if (result.records.length == 0){
      res.status(400).send({message:'Application does probably not exist'})
    } else if (result.records[0].length == 3){
      res.status(200).send(result);
    } else {
      res.status(400).send({message: 'Something is seriously wong!'});
    }

  })
  .catch((err) => {
    res.status(400).send(err);
  });
})

/* Set admin
*   Request body: {
*     "user" { email: email@interwebs.tld },
*     "org": { uuid: this-is-not-a-real-uuid },
*     "admin": true/false // true to set admin, false to revoke
*  TODO edit query to not remove admin if one admin remains
*/
routes.post('/chadmin', (req, res) => {
  let user = new User(req.body.user);
  let org = new Organization(req.body.org);
  query = "MATCH " + user.make_query_object('a') +
    "-[c:Member]->" + org.make_query_object('b') +
    "SET c += {is_admin: '" + req.body.admin + "'} RETURN a";
  console.log(query);
  Organization.custom_query(query)
  .then((result) => {
    res.status(200).send("Admin rights " + (req.body.admin? "granted" : "revoked"));
  })
  .catch((err) => {
    res.status(400).send(err);
  })
})


/* Remove member
*   Request body: {
*     "user" { email: email@interwebs.tld },
*     "org": { uuid: this-is-not-a-real-uuid }
* TODO edit query to not remove member if member is last admin
*/
routes.post('/rmmember', (req, res) => {
  let user = new User(req.body.user);
  let org = new Organization(req.body.org);
  query = "MATCH " + user.make_query_object('a') +
    "-[c:Member]->" + org.make_query_object('b') +
    "DELETE c";
  console.log(query);
  Organization.custom_query(query)
  .then((result) => {
    res.status(200).send("Memeber removed");
  })
  .catch((err) => {
    res.status(400).send(err);
  })
})

/*
* Apply to organisation
*   Request body:
*    "user": {
*      "email": "email@interwebs.tld"
*    },
*    "org": {
*      "uuid": "9a7210e3-395b-43bc-a92d-4fbb24e1aa81"
*    }
*
* Query : Matches User and Organization with given keys and creates a
*   relationship if a user and organization is found, and the user does not have
*   an active application or is not already a member.
*/
routes.post('/apply', (req, res) => {
  if(!req.body.user || !req.body.org){
    res.status(400).send('Malformed request body');
    return;
  }
  user = new User(req.body.user);
  org = new Organization(req.body.org);
  application = new Applied();
  query = "MATCH " + user.make_query_object('a') + ", " +
    org.make_query_object('b') + " WHERE NOT ((a)-[:Applied {status: 'true'}]->(b) \
    OR (a)-[:Member]->(b)) CREATE (a)-" +
    application.make_query_object('c', {use_all: true}) + "->(b) RETURN a, b, c";
  User.custom_query(query)
  .then((result) => {
    if (result.records.length == 0){
      res.status(400).send({message: 'User and Organization does not exist, ' +
        'or user is already a member or has an active application'});
    } else if (result.records[0].length == 3){
      res.status(200).send({message:"Application sent"});
    } else {
      res.status(400).send({message:"Something is wrong, this should not happen!"});
    }
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});


// #######
// PUT ###
// #######

// PUT
/*
* Edit user info
*   Request body {
*     "org": { user fileds to change }
*   }
*/
routes.put('/', (req, res) => {

  if (!req.body.org) {
    res.status(400).send({message:"request body is incomplete"});
    return;
  }
  var org = new Organization(req.body.org);
  console.log(org);
  // reson for taking itself as an argument: it is intentded for objects that can mutate its own unique id
  org.update(org)
  .then((result) => {
    res.status(200).send({message: "Organization updated"});
  })
  .catch((err) => {
    res.status(400).send(err);
  })
});


module.exports = routes;
