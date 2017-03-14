var assert = require('assert');
var valid_users = require('./environment/valid_users');
var valid_organizations = require('./environment/valid_organizations')



function environmentTests(env){ 
  describe('Test environment tests', () => {
    describe('Test if users are added', () => {
      it('Should assert true', () => {
        assert.equal(env.users.length, valid_users.length)
      })
    })
    describe('Test if organizations are added', () => {
      it('Should assert true', () => {
          assert.equal(env.organizations.length, valid_organizations.length)
      })
    })
  });
}


module.exports = environmentTests
