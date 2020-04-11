const { assert, request, HEADERS } = require('./configuration/constants.js');
const { TEST_CANDIDATES, TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let CANDIDATE_ID = 0;

describe("Candidate Tests", function() {
  this.slow(10000);
  
  before(function(done){
    request({
      url: `/api/v1/candidates/latest`,
      method: 'GET',
      headers: HEADERS.KEY,
      done,
      onSuccess: ({data}) => {
        const id = data ? data.id + 1 : 1;
        CANDIDATE_ID = id;
        TEST_CANDIDATES.CREATED.id = id;
        TEST_CANDIDATES.UPDATED.id = id;
      }
    });
  });

  /** Test creating a new candidate */
  describe("Create", function() {
    it("Add candidate", function(done) {
      request({
        url: `/api/v1/candidates`,
        method: 'POST',
        body: JSON.stringify(TEST_CANDIDATES.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 201);
        }
      });
    });

    it("Attempt add duplicate candidate", function(done) {
      request({
        url: `/api/v1/candidates`,
        method: 'POST',
        body: JSON.stringify(TEST_CANDIDATES.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({status}) => {
          assert.equal(status, 409);
        }
      });
    });
  });

  /** Test retrieval of all candidates */
  describe("Read", function() {
    it("Get all candidates", function(done) {
      request({
        url: `/api/v1/candidates`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
        }
      });
    });

    it("Get single candidate", function(done) {
      request({
        url: `/api/v1/candidates/${CANDIDATE_ID}`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it("Get random candidate", function(done) {
      request({
        url: `/api/v1/candidates/random`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it("Attempt get single candidate with invalid ID", function(done) {
      request({
        url: `/api/v1/candidates/0`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });


  /** Test updating the candidate */
  describe("Update", function() {
    it("Update candidate without image change", function(done) {
      request({
        url: `/api/v1/candidates/${CANDIDATE_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          candidate: TEST_CANDIDATES.UPDATED,
          changed: false
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 200);
        }
      });
    });

    it("Update candidate with image change", function(done) {
      request({
        url: `/api/v1/candidates/${CANDIDATE_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          candidate: TEST_CANDIDATES.UPDATED,
          changed: true
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
        }
      });
    });

    it("Attempt update candidate with invalid ID", function(done) {
      request({
        url: `/api/v1/candidates/0`,
        method: 'PUT',
        body: JSON.stringify({
          candidate: TEST_CANDIDATES.UPDATED,
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

  /** Test deleting the candidate */
  describe("Delete", function() {
    it("Delete candidate", function(done) {
      request({
        url: `/api/v1/candidates/${CANDIDATE_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 204);
        }
      });
    });

    it("Attempt delete candidate with invalid ID", function(done) {
      request({
        url: `/api/v1/candidates/0`,
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