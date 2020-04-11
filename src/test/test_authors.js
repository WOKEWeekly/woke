
const { assert, request, HEADERS } = require('./configuration/constants.js');
const { TEST_AUTHORS, TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let AUTHOR_ID = 0;

describe("Author Tests", function() {
  this.slow(10000);

  /** Test creating a new author */
  describe("Create", function() {
    it("Add author", function(done) {
      request({
        url: `/api/v1/authors`,
        method: 'POST',
        body: JSON.stringify(TEST_AUTHORS.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 201);
          assert.hasAllKeys(data, ['id']);
          AUTHOR_ID = data.id;
        }
      });
    });
  });

  /** Test retrieval of all authors */
  describe("Read", function() {
    it("Get all authors", function(done) {
      request({
        url: `/api/v1/authors`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
        }
      });
    });

    it("Get single author", function(done) {
      request({
        url: `/api/v1/authors/${AUTHOR_ID}`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it("Attempt get single author with invalid ID", function(done) {
      request({
        url: `/api/v1/authors/0`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });


  /** Test updating the author */
  describe("Update", function() {
    it("Update author without image change", function(done) {
      request({
        url: `/api/v1/authors/${AUTHOR_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          author: TEST_AUTHORS.UPDATED,
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

    it("Update author with image change", function(done) {
      request({
        url: `/api/v1/authors/${AUTHOR_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          author: TEST_AUTHORS.UPDATED,
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

    it("Attempt update author with invalid ID", function(done) {
      request({
        url: `/api/v1/authors/0`,
        method: 'PUT',
        body: JSON.stringify({
          author: TEST_AUTHORS.UPDATED,
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

  /** Test deleting the author */
  describe("Delete", function() {
    it("Delete author", function(done) {
      request({
        url: `/api/v1/authors/${AUTHOR_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 204);
        }
      });
    });

    it("Attempt delete author with invalid ID", function(done) {
      request({
        url: `/api/v1/authors/0`,
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