const { assert, jwt, request, HEADERS } = require('./configuration/constants.js');
const { TEST_MEMBERS, TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let MEMBER_ID = 0;

describe("Members Tests", function() {
  this.slow(10000);
  
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });

  /** Test creating a new member */
  describe("Create", function() {
    it("Add member", function(done) {
      request({
        url: `/api/v1/members`,
        method: 'POST',
        body: JSON.stringify(TEST_MEMBERS.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 201);
          assert.hasAllKeys(data, ['id']);
          MEMBER_ID = data.id;
        }
      });
    });
  });

  /** Test retrieval of all members */
  describe("Read", function() {
    it("Get all members", function(done) {
      request({
        url: `/api/v1/members`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
        }
      });
    });

    it("Get random member", function(done) {
      request({
        url: `/api/v1/members/random`,
        method: 'GET',
        headers: { 'Authorization': process.env.AUTH_KEY },
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it("Get only member names", function(done) {
      request({
        url: `/api/v1/members/names`,
        method: 'GET',
        headers: { 'Authorization': process.env.AUTH_KEY },
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
          const [candidate] = data;
          assert.hasAllKeys(candidate, ['id', 'firstname', 'lastname']);
        }
      });
    });

    it("Get only executive members", function(done) {
      request({
        url: `/api/v1/members/executives`,
        method: 'GET',
        headers: { 'Authorization': process.env.AUTH_KEY },
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
          data.forEach(candidate => {
            assert.equal(candidate.level, 'Executive');
          });
        }
      });
    });

    it("Get single member", function(done) {
      request({
        url: `/api/v1/members/${MEMBER_ID}`,
        method: 'GET',
        headers: { 'Authorization': process.env.AUTH_KEY },
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it("Attempt get single member with invalid ID", function(done) {
      request({
        url: `/api/v1/members/0`,
        method: 'GET',
        headers: { 'Authorization': process.env.AUTH_KEY },
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });


  /** Test updating the member */
  describe("Update", function() {
    it("Update member without image change", function(done) {
      request({
        url: `/api/v1/members/${MEMBER_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          member: TEST_MEMBERS.UPDATED,
          changed: false
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['slug']);
        }
      });
    });

    it("Update member with image change", function(done) {
      request({
        url: `/api/v1/members/${MEMBER_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          member: TEST_MEMBERS.UPDATED,
          changed: true
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['slug']);
        }
      });
    });

    it("Attempt update member with invalid ID", function(done) {
      request({
        url: `/api/v1/members/0`,
        method: 'PUT',
        body: JSON.stringify({
          member: TEST_MEMBERS.UPDATED,
          changed: true
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });

  /** Test deleting the member */
  describe("Delete", function() {
    it("Delete member", function(done) {
      request({
        url: `/api/v1/members/${MEMBER_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 204);
        }
      });
    });

    it("Attempt delete member with invalid ID", function(done) {
      request({
        url: `/api/v1/members/0`,
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