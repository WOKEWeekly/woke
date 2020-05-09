const { assert, request, HEADERS } = require('./configuration/constants.js');
const { TEST_DOCUMENTS, TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let DOCUMENT_ID = 0;

describe('Document Tests', function () {
  this.slow(10000);

  /** Test creation of documents */
  describe('Create', function () {
    it('Add new document', function (done) {
      request({
        url: `/api/v1/documents`,
        method: 'POST',
        body: JSON.stringify(TEST_DOCUMENTS.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 201);
          assert.hasAllKeys(data, ['id']);
          DOCUMENT_ID = data.id;
        },
      });
    });

    it('Attempt add duplicate document name', function (done) {
      request({
        url: `/api/v1/documents`,
        method: 'POST',
        body: JSON.stringify(TEST_DOCUMENTS.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 409);
        },
      });
    });
  });

  /** Test retrieval of all documents */
  describe('Read', function () {
    it('Get all documents', function (done) {
      request({
        url: `/api/v1/documents`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isArray(data);
        },
      });
    });

    it('Get single document', function (done) {
      request({
        url: `/api/v1/documents/${DOCUMENT_ID}`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isObject(data);
        },
      });
    });

    it('Attempt get single document with invalid name', function (done) {
      request({
        url: `/api/v1/documents/0`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        },
      });
    });
  });

  /** Test updating the document */
  describe('Update', function () {
    it('Update document without file change', function (done) {
      request({
        url: `/api/v1/documents/${DOCUMENT_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          document: TEST_DOCUMENTS.UPDATED,
          changed: false,
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['name']);
        },
      });
    });

    it('Update document with file change', function (done) {
      request({
        url: `/api/v1/documents/${DOCUMENT_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          document: TEST_DOCUMENTS.UPDATED,
          changed: true,
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['name']);
        },
      });
    });

    it('Attempt update document with invalid ID', function (done) {
      request({
        url: `/api/v1/documents/0`,
        method: 'PUT',
        body: JSON.stringify({
          document: TEST_DOCUMENTS.UPDATED,
          changed: true,
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        },
      });
    });
  });

  /** Test deleting the document */
  describe('Delete', function () {
    it('Delete document', function (done) {
      request({
        url: `/api/v1/documents/${DOCUMENT_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 204);
        },
      });
    });

    it('Attempt delete document with invalid ID', function (done) {
      request({
        url: `/api/v1/documents/0`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        },
      });
    });
  });
});
