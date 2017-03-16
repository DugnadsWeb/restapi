const user_tests = require('./user.spec');
const assert = require('assert');
//const env_tests = require('./env_gen.spec');
const clear = require('../clear_db');
//const Tester = require('./framework/tester');
const http = require('http');
const TestBase = require('./framework/test_base');
const Environment = require('./environment/env_gen');
var chai = require('chai');
var should = chai.should();
var chaiAsPromised = require('chai-as-promised');
var chai_http = require('chai-http');
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(chai_http);






afterEach((done) => {
  clear(() => {
    done();
  });
})


describe('RestAPI', () => {
  describe('User', () => {
    describe('GET existing user', () => {
      it('Should return a user', (done) => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .get('/api/user/'+env.get_random_user().get_db_fields().email)
            .end((err, res) => {
              expect(err).to.be.null
              expect(res).to.have.status(200)
              done();
            })
        })
      })
    })
    describe('GET nonexisting user', () => {
      it('Should return a 400', (done) => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .get('/api/user/britta@undergang.no')
            .end((err, res) => {
              expect(res).to.have.status(400)
              done();
            })
        })
      })
    })
    describe('POST valid user', () => {
      it('Should return a 200 status', (done) => {
        var test_user = {
          first_name: "Britt Arne",
          last_name: "Bergrud",
          email: "britta@undergang.no",
          password: "morrobritt"
        };
        chai.request('http://localhost:8888')
          .post('/api/user')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(test_user))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status('200');
            done();
          });
        })
      })
    describe('POST duplicate user', () => {
      it('Should return a 400 status', (done) => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
          .post('/api/user')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(env.get_random_user().get_db_fields()))
          .end((err, res) => {
            //console.log(err);
            expect(res).to.have.status('400');
            done();
          })
        })
      })
    })
    describe('PUT valid user', () => {
      it('Should return a 200 status', (done) => {
        Environment().then(env => {
          user = env.get_random_user();
          user.db_fields.first_name.data = "yoloswag";
          user.db_fields.last_name.data = "G-bsen";
          user.db_fields.password.data = "imanewpassword";
          chai.request('http://localhost:8888')
          .put('/api/user')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify({"user":
                                  {"email":user.db_fields.email.data},
                                "edited_user":user.get_db_fields()}))
          .end((err, res) => {
            expect(res).to.have.status('200');
            done();
          });
        })
      })
    })
    describe('DELETE existing user', () => {
      it('Should return a 200 status', (done) => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
          .delete('/api/user')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(env.get_random_user()))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status('200');
            done();
          })
        })
      })
    })
    describe('DELETE unexisting user', () => {
      it('Should return a 400', (done) => {
        Environment().then(env => {
          var test_user = {
            first_name: "Britt Arne",
            last_name: "Bergrud",
            email: "britta@undergang.no",
            password: "morrobritt"
          };

          chai.request('http://localhost:8888')
          .delete('/api/user')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(test_user))
          .end((err, res) => {
            expect(res).to.have.status('400');
            done();
          })
        })
      })
    })
  // user end
  })
  describe('Organization', () => {
    describe('POST valid organization', () => {
      it('Should return a 200 status', (done) => {
        var test_org = {
          org_number: "014857284",
          org_name: "et idrettslag",
          email: "etidrettslag@sport.no",
          phone: "94857357",
          description: "Dette er et idrettslag for sport"
        };
        chai.request('http://localhost:8888')
          .post('/api/org')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(test_org))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status('200');
            done();
        });
      })
    })
    describe('POST existing organization', () => {
      it('Should return a 400 status', (done) => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .post('/api/org')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(env.get_random_org()))
            .end((err, res) => {
              expect(res).to.have.status('400');
              done();
          });
        })
      })
    })
    describe('GET existing organization', () => {
      it('Should return an organization', (done) => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .get('/api/org/'+env.get_random_org().get_db_fields().uuid)
            .end((err, res) => {
              expect(err).to.be.null
              expect(res).to.have.status(200)
              done();
            })
        })
      })
    })
    describe('GET nonexisting organization', () => {
      it('Should return a 400', (done) => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .get('/api/org/6d99419c-9b37-4fd4-b06c-baf859b6a66f')
            .end((err, res) => {
              expect(res).to.have.status(400)
              done();
            })
        })
      })
    })
    describe('POST application to organization', () => {
      it('Should return a 200', done => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .post('/api/org/apply')
            .set('Content-Type', 'application/json')
            .send({
              'user': { 'email': env.get_random_user().get_db_fields().email},
              'org': { 'uuid': env.get_random_org().get_db_fields().uuid}
            })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              done();
            })
        })
      })
    })
    describe('POST application to organization with nonexisting user', () => {
      it('Should return a 400', done => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .post('/api/org/apply')
            .set('Content-Type', 'application/json')
            .send({
              'user': { 'email': 'this_mail@does_not.exist'},
              'org': { 'uuid': env.get_random_org().get_db_fields().uuid}
            })
            .end((err, res) => {
              expect(res).to.have.status(400);
              done();
            })
        })
      })
    })
    describe('POST application to organization with nonexisting organization', () => {
      it('Should return a 400', done => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .post('/api/org/apply')
            .set('Content-Type', 'application/json')
            .send({
              'user': { 'email': env.get_random_user().get_db_fields().email},
              'org': { 'uuid': 'thid is not even a real uuid'}
            })
            .end((err, res) => {
              expect(res).to.have.status(400);
              done();
            })
        })
      })
    })
    describe('GET all application for an organization', () => {
      it('Should return a 200 and list of applications', done => {
        Environment().then(env => {
          let org = env.get_random_org();
          chai.request('http://localhost:8888')
            .get('/api/org/'+org.get_db_fields().uuid+'/applicants')
            .set('Content-Type', 'application/json')
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body).to.have.length(env.get_org_applications(org).length);
              done();
            })
        })
      })
    })
    describe('GET all application for an nonexisting organization', () => {
      it('Should return a 400', done => {
        Environment().then(env => {
          chai.request('http://localhost:8888')
            .get('/api/org/thisisnotanuuid/applicants')
            .set('Content-Type', 'application/json')
            .end((err, res) => {
              expect(res).to.have.status(400);
              done();
            })
        })
      })
    })
    describe('POST accept application', () => {
      it('Should return a 200', done => {
        Environment().then(env => {
          let applic = env.get_random_application();
          chai.request('http://localhost:8888')
            .post('/api/org/applicant')
            .set('Content-Type', 'application/json')
            .send({
              'user': { 'email': applic.user.get_db_fields().email},
              'org': { 'uuid': applic.org.get_db_fields().uuid},
              'accept': true
            })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              done();
            })
        })
      })
    })
    describe('POST reject application', () => {
      it('Should return a 200', done => {
        Environment().then(env => {
          let applic = env.get_random_application();
          chai.request('http://localhost:8888')
            .post('/api/org/applicant')
            .set('Content-Type', 'application/json')
            .send({
              'user': { 'email': applic.user.get_db_fields().email},
              'org': { 'uuid': applic.org.get_db_fields().uuid},
              'accept': false
            })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              done();
            })
        })
      })
    })
    describe('POST accept application with nonexisting user', () => {
      it('Should return a 400', done => {
        Environment().then(env => {
          let applic = env.get_random_application();
          chai.request('http://localhost:8888')
            .post('/api/org/applicant')
            .set('Content-Type', 'application/json')
            .send({
              'user': { 'email': 'thisisnot@real.user'},
              'org': { 'uuid': applic.org.get_db_fields().uuid},
              'accept': false
            })
            .end((err, res) => {
              expect(res).to.have.status(400);
              done();
            })
        })
      })
    })
    // organization end
  })
  // RestAPI describe end
})




/*
// create tester
tester = new Tester();
// define onDone
tester.after = () => {
  console.log(tester.generateReport());
  //tester.writeLogFile('../logs/');
}
tester.afterEach = () => {
  clear();
}


//user_tests.post_valid.test();

//tester.addTest({lable: 'test test', should:'test', test:()=>{console.log('test')}})

//tester.addTest(user_tests.put_valid());


tester.run();


//user_tests.post_valid();


/*
user_tests.put();
user_tests.delete();
*/
