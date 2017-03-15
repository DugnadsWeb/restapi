const users_data = require('./valid_users.json');
const orgs_data = require('./valid_organizations.json');
const User = require('../../api/models/user');
const Organization = require('../../api//models/organization');


function Environment(){

  // users currently available in environment
  this.users = [];
  this.organizations = [];


  // getters
  this.get_random_user = function(){
    let rand = Math.floor(Math.random()* this.users.length);
    return this.users[rand];
  }

  this.get_random_org = function(){
    let rand = Math.floor(Math.random()* this.organizations.length);
    return this.organizations[rand];
  }

}


function populateEnvironment(){
  return new Promise((res, rej) => {
    let env = new Environment();
    let promise_pool = [
      addValidUsers(env),
      addValidOrganizations(env)
    ];
    Promise.all(promise_pool).then(ret => {
      res(env);
    })
    .catch(err => {
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
        org = new Organization(orgs_data[i]);
        promise_pool.push(org.create());
        env.organizations.push(org);
      }
      Promise.all(promise_pool).then(ret => {
        res(ret);
      })
      .catch(err => {
        rej(err);
      })
    })
  }

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
