const { assert, request, HEADERS } = require('./configuration/constants.js');
const { TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

const DOCUMENT_NAME = 'constitutionv2';

describe("Document Tests", function() {
  this.slow(10000);

  /** Test retrieval of all documents */
  describe("Read", function() {
    it("Get all documents", function(done) {
      request({
        url: `/api/v1/documents`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
        }
      });
    });

    it("Get single document", function(done) {
      request({
        url: `/api/v1/documents/${DOCUMENT_NAME}`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it("Attempt get single document with invalid ID", function(done) {
      request({
        url: `/api/v1/documents/2`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });
});