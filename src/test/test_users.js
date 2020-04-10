const { assert, jwt, request, HEADERS } = require('./configuration/constants.js');
const { TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let USER_ID = 0;
let USER_EMAIL = '';
let EMAIL_VERIFICATION_TOKEN = '';
let ACCOUNT_VERIFICATION_TOKEN = '';

describe("User Tests", function() {
  this.slow(10000);
  
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;

      // Clear data in table
      request({
        url: `/api/v1/users`,
        method: 'PURGE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: () => {}
      });
    });
  });

  /** Test POST methods against users */
  describe("Create", function() {
    it("Register new user", function(done) {
      request({
        url: `/api/v1/users`,
        method: 'POST',
        body: JSON.stringify(TEST_USERS.CREATED),
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 201);
          assert.isObject(data);
          USER_ID = data.id;
          USER_EMAIL = data.email;
        }
      });
    });

    it("Authenticate user", function(done) {
      const { username, password1: password } = TEST_USERS.CREATED;
      request({
        url: `/api/v1/users/login`,
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          remember: true
        }),
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.hasAnyKeys(data, ['token']);
        }
      });
    });
  });

  /** Test retrieval of users */
  describe("Read", function() {
    it("Get all users", function(done) {
      request({
        url: `/api/v1/users`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
        }
      });
    });

    it("Get single user", function(done) {
      request({
        url: `/api/v1/users/${USER_ID}`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it("Attempt get single user with invalid ID", function(done) {
      request({
        url: `/api/v1/users/0`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });

  /** Test other methods against users */
  describe("Miscellaneous", function() {
    it("Resend user verification email", function(done) {
      request({
        url: `/api/v1/users/${USER_ID}/email/verify`,
        method: 'NOTIFY',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['token']);
          EMAIL_VERIFICATION_TOKEN = data.token;
        }
      });
    });

    it("Verify user's account", function(done) {
      request({
        url: `/api/v1/users/${EMAIL_VERIFICATION_TOKEN}/verify`,
        method: 'PATCH',
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.include(data, { clearance: 2});
        }
      });
    });

    it("Send account recovery email", function(done) {
      request({
        url: `/api/v1/users/recovery`,
        method: 'NOTIFY',
        body: JSON.stringify({ email: USER_EMAIL }),
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['token']);
          ACCOUNT_VERIFICATION_TOKEN = data.token;
        }
      });
    });

    it("Reset password", function(done) {
      request({
        url: `/api/v1/users/password/reset`,
        method: 'PATCH',
        body: JSON.stringify({
          password: TEST_USERS.CREATED.password1,
          token: ACCOUNT_VERIFICATION_TOKEN
        }),
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 200);
        }
      });
    });
  });

  /** Test PUT methods against users */
  describe("Update", function() {
    it("Change username", function(done) {
      request({
        url: `/api/v1/users/${USER_ID}/username`,
        method: 'PUT',
        body: JSON.stringify({ username: "servtests" }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 200);
        }
      });
    });

    it("Change password", function(done) {
      request({
        url: `/api/v1/users/${USER_ID}/password`,
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: TEST_USERS.CREATED.password1,
          newPassword: 'servtests'
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 200);
        }
      });
    });

    it("Change clearance", function(done) {
      const clearance = 5;
      request({
        url: `/api/v1/users/${USER_ID}/clearance/${clearance}`,
        method: 'PUT',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 200);
        }
      });
    });
  });

  /** Test DELETE methods against users */
  describe("Delete", function() {
    it("Delete user", function(done) {
      request({
        url: `/api/v1/users/${USER_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 204);
        }
      });
    });

    it("Attempt delete user with invalid ID", function(done) {
      request({
        url: `/api/v1/users/0`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });
});