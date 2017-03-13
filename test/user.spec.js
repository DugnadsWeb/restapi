const http = require('http');
const TestBase = require('./framework/test_base');
const assert = require('assert');
const Environment = require('./environment/env_gen');
var chai = require('chai');
var should = chai.should();
var chaiAsPromised = require('chai-as-promised');
var chai_http = require('chai-http');
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(chai_http);





var user_tests = {

  post_valid: () => {

  }

}



/*
var user_tests  = {

  // User POST
  post_valid:  {
    lable: 'POST valid user',
    should:'Should return status 200',
    test: function() {
      var test_user = {
        first_name: "Britt Arne",
        last_name: "Bergrud",
        email: "britta@undergang.no",
        password: "morrobritt"
      };

      return chai.request('http://localhost:8888')
        .post('/api/user')
        .set('Content-Type', 'application/json')
        .set('Connection', 'keep-alive')
        .send(JSON.stringify(test_user))
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status('200');
        })
      }


  }


}
*/

// User put
// TODO add test for every user property
user_tests.put_valid = function() {
  TestBase.call(this);

  this.test = test;
  this.lable = 'PUT all valid user fields, except email';
  this.should = "return a 200, user changed";

  function test() {
    env = new Environment();
    user = env.get_random_user();
    user.db_fields.first_name.data = "yoloswag";
    user.db_fields.last_name.data = "G-bsen";
    user.db_fields.password.data = "imanewpassword";
    return chai.request('http://localhost:8888')
    .put('/api/user')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(user.get_db_fields()))
    .end((err, res) => {
      expect(JSON.parse(res)).to.have.status('200');
    });
  }

  return this;
};

user_tests.delete = () => describe('/api/user DELETE', () => {
  it('Should return a 200 user deleted', () => {
    return chai.request('http://localhost:8888')
    .delete('/api/user')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(test_user))
    .end((err, res) => {
      expect(res).to.have.status('200');
    })
    .catch((err) => {
      expect(err).to.be.null;
    }).should.be.fulfilled;
  });
  it('Should return a 400 user does not exist', () => {
    return chai.request('http://localhost:8888')
    .delete('/api/user')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(test_user))
    .end((err, res) => {
      expect(res).to.have.status('400');
    })
    .catch((err) => {
      expect(err).to.be.null;
    }).should.be.fulfilled;
  })
})

/*
// User POST
user_tests.post_valid = () => {
  TestBase.call(this);

  this.test = test;
  this.lable = 'POST valid user';
  this.should = 'Should return status 200';

  var test_user = {
    first_name: "Britt Arne",
    last_name: "Bergrud",
    email: "britta@undergang.no",
    password: "morrobritt"
  };

  function test(){
    chai.request('http://localhost:8888')
      .post('/api/user')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(test_user))
      .end((err, res) => {
        expect(res).to.have.status('200');
      })
      .catch((err) => {
        expect(err).to.be.null;
      }).should.be.fulfilled;
    }

    return this;
}

*/

user_tests.post_duplicate = () => {
  TestBase.call(this);

  this.test = test;
  this.lable = 'POST duplicate user';
  this.should = 'return status 400';

  function test(){
    let env = new Environment();
    return chai.request('http://localhost:8888')
    .post('/api/user')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(env.get_random_user().get_db_fields()))
    .end((err, res) => {
      //console.log(err);
      expect(res).to.have.status('400');
    }).should.be.fulfilled;
  }
  return this
}



module.exports = user_tests;
