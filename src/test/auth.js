
const { assert, jwt, host, options, request, users } = require('./_config.js');

const superuser = users.nine;
const registrar = users.one;

describe("Authentication", function() {
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });
  
  describe("Log In", function() {
    let response = {};
    
    const attemptLogin = (credentials, assertion, done) => {
      request({
        url: `${host}/login`,
        method: 'POST',
        body: JSON.stringify(credentials),
        ...options.standard,
      }, function(err, res){
        response = ({statusCode, body} = res);
        assertion();
        done();
      });
    }

    it("Valid Credentials", function(done) {
      const credentials = { username: 'admin', password: 'admin' };
      attemptLogin(credentials, () => assert.equal(response.statusCode, 200, JSON.parse(response.body).message), done);
    });

    it("Incorrect Username", function(done) {
      const credentials = { username: 'wrongusername', password: 'fredf' };
      attemptLogin(credentials, () => assert.notEqual(response.statusCode, 200, JSON.parse(response.body).message), done);
    });

    it("Incorrect Password", function(done) {
      const credentials = { username: 'notfred', password: 'wrongpassword' };
      attemptLogin(credentials, () => {
        assert.notEqual(response.statusCode, 200, JSON.parse(response.body).message);
      }, done);
    });
  });

  describe("Sign Up", function() {
    let response = {};

    const attemptSignup = (registrar, assertion, done) => {
      request({
        url: `${host}/signup`,
        method: 'POST',
        body: JSON.stringify(registrar),
        ...options.weak,
      }, function(err, res){
        response = ({statusCode, body} = res);
        registrar.id = JSON.parse(response.body).id;
        registrar.token = JSON.parse(response.body).token;
        assertion();
        done();
      });
    }

    it("Valid Registration", function(done) {
      attemptSignup(registrar, () => {
        assert.equal(response.statusCode, 200, JSON.parse(response.body).message);
      }, done);
    });

    it("Invalid Email Address", function(done) {
      const user = { firstname: 'David', lastname: 'Egbue', email: 'dgmail.com', username: 'david', password1: 'davido607', password2: 'davido607', subscribe: false }
      attemptSignup(user, () => {
        assert.notEqual(response.statusCode, 200, JSON.parse(response.body).message);
      }, done);
    });

    it("Non-Matching Passwords", function(done) {
      const user = { firstname: 'David', lastname: 'Egbue', email: 'dgmail.com', username: 'david', password1: 'different', password2: 'passwords', subscribe: false }
      attemptSignup(user, () => {
        assert.notEqual(response.statusCode, 200, JSON.parse(response.body).message);
      }, done);
    });

    it("Change Username", function(done) {
      const data = { id: superuser.id, username: 'admin'};
      request({
        url: `${host}/changeUsername`,
        method: 'PUT',
        body: JSON.stringify({data}),
        ...options.strong(superuser),
      }, function(err, res){
        assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
        done();
      });
    });

    it("Delete Account", function(done) {
      request({
        url: `${host}/deleteAccount`,
        method: 'DELETE',
        body: JSON.stringify({id: registrar.id}),
        ...options.strong(registrar),
      }, function(err, res){
        assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
        done();
      });
    });
  });
});