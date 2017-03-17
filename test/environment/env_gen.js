const users_data = require('./valid_users.json');
const orgs_data = require('./valid_organizations.json');
const User = require('../../api/models/user');
const Organization = require('../../api//models/organization');
const Applied = require('../../api/models/relationships/applied');

function Environment(){

  // users currently available in environment
  this.users = [];
  this.organizations = [];
  this.applications = [];


  // getters
  this.get_random_user = function(){
    let rand = Math.floor(Math.random() * this.users.length);
    return this.users[rand];
  }

  this.get_random_org = function(){
    let rand = Math.floor(Math.random() * this.organizations.length);
    //console.log(rand + this.organizations[rand].get_db_fields().name);
    return this.organizations[rand];
  }

  this.get_random_application = function(){
    let rand = Math.floor(Math.random() * this.applications.length);
    return this.applications[rand];
  }

  this.get_random_unused_application_pair = function(){
    let user, org;
    while (!user || !org){
      let tmpUsr = this.get_random_user();
      let tmpOrg = this.get_random_org();
      let exists = false
      for (let i=0;i<this.applications.length;i++){
        //console.log(this.applications[i].user.get_db_fields().email + ' : ' + tmpUsr.get_db_fields().email);
        //console.log(this.applications[i].org.get_db_fields().name + ' : ' + tmpOrg.get_db_fields().name);
        if (this.applications[i].user == tmpUsr &&
            this.applications[i].org == tmpOrg){
              exists = true;
              break;
            }
      }
      if (!exists){
        user = tmpUsr;
        org = tmpOrg;
      }
    }
    return {'user':user, 'org':org}
  }


  this.get_org_applications = function(org){
    ret = [];
    for (let i=0;i<this.applications.length;i++){
      if (this.applications[i].org == org){
        ret.push(this.applications[i]);
      }
    }
    return ret;
  }


}


function populateEnvironment(){
  return new Promise((res, rej) => {
    let env = new Environment();
    // add users and organizations
    let promise_pool = [
      addValidUsers(env),
      addValidOrganizations(env)
    ];
    Promise.all(promise_pool)
    .then(ret => {
      // then add applicants
      addMembershipApplications(env)
      .then(ret => {
        res(env);
      })
      .catch(err => {
        rej(err);
      })
    })
    .catch(err => {
      console.log("populateEnvironment is rejected");
      rej(err);
    })
  })
}



// add users to test environment
function addValidUsers(env){
  return new Promise((res,rej) => {
    let promise_pool = [];
    for (var i=0; i < users_data.length; i++){
      user = new User(users_data[i]);
      promise_pool.push(user.create());
      env.users.push(user);
    }
    Promise.all(promise_pool).then(ret => {
      res(ret);
    })
    .catch(err => {
      rej(err);
    })
  });
}

// adds organisations to the test environment
function addValidOrganizations(env){
  return new Promise((res, rej) => {
    let promise_pool = []
    for (var i=0;i<orgs_data.length;i++){
      let org = new Organization(orgs_data[i]);
      env.organizations.push(org);
      promise_pool.push(org.create());
    }
    Promise.all(promise_pool).then(ret => {

      res(ret);
    })
    .catch(err => {
      rej(err);
    })
  })
}

function addMembershipApplications(env){
  return new Promise((res, rej) => {
    var promise_pool = [];
    for (var i=0;i<3;i++){
      let pair = env.get_random_unused_application_pair();
      env.applications.push(pair);
      //console.log(pair.user.get_db_fields().first_name + ' : ' +
      //            pair.org.get_db_fields().name);
      let application = new Applied();

      query = "MATCH " + pair.user.make_query_object('a') + ", " +
        pair.org.make_query_object('b') + " WHERE NOT ((a)-[:Applied {status: 'true'}]->(b) \
        OR (a)-[:Member]->(b)) CREATE (a)-" +
        application.make_query_object('c', {use_all: true}) + "->(b) RETURN a, b, c";
      promise_pool.push(User.custom_query(query))
    }
    Promise.all(promise_pool).then(ret => {
      res(ret);
    })
    .catch(err => {
      rej(err);
    })
  })
}


// will run from console given argument 'make'
for (let i=0;i<process.argv.length;i++){
  switch (process.argv[i]) {
    case 'make':
      populateEnvironment()
      .then(env => {
        process.exit(0);
      })
      break;
  }
}


module.exports = populateEnvironment;
