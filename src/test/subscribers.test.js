const { assert, request, HEADERS } = require('./configuration');
const { TEST_SUBSCRIBERS, TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let SUBSCRIBER_ID = 0;

describe('Subscriber Tests', function () {
  this.slow(10000);

  before(function (done) {
    request({
      url: `/api/v1/subscribers`,
      method: 'PURGE',
      headers: HEADERS.TOKEN(superuser),
      done
    });
  });

  /** Test creating a new subscriber */
  describe('Create', function () {
    it('Add subscriber', function (done) {
      request({
        url: `/api/v1/subscribers`,
        method: 'POST',
        body: JSON.stringify(TEST_SUBSCRIBERS.CREATED),
        headers: HEADERS.KEY,
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 201);
          assert.hasAllKeys(data, ['id']);
          SUBSCRIBER_ID = data.id;
        }
      });
    });
  });

  /** Test retrieval of all subscribers */
  describe('Read', function () {
    it('Get all subscribers', function (done) {
      request({
        url: `/api/v1/subscribers`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isArray(data);
        }
      });
    });

    it('Get single subscriber', function (done) {
      request({
        url: `/api/v1/subscribers/${SUBSCRIBER_ID}`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it('Attempt get single subscriber with invalid ID', function (done) {
      request({
        url: `/api/v1/subscribers/0`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        }
      });
    });
  });

  /** Test updating the subscriber */
  describe('Update', function () {
    it('Update subscriber without image change', function (done) {
      request({
        url: `/api/v1/subscribers/${SUBSCRIBER_ID}`,
        method: 'PUT',
        body: JSON.stringify(TEST_SUBSCRIBERS.UPDATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 200);
        }
      });
    });

    it('Attempt update subscriber with invalid ID', function (done) {
      request({
        url: `/api/v1/subscribers/0`,
        method: 'PUT',
        body: JSON.stringify(TEST_SUBSCRIBERS.UPDATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        }
      });
    });
  });

  /** Test deleting the subscriber */
  describe('Delete', function () {
    it('Delete subscriber', function (done) {
      request({
        url: `/api/v1/subscribers/${SUBSCRIBER_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 204);
        }
      });
    });

    it('Attempt delete subscriber with invalid ID', function (done) {
      request({
        url: `/api/v1/subscribers/0`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        }
      });
    });
  });
});
