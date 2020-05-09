const { assert, request, HEADERS } = require('./configuration/constants.js');
const { TEST_TOPICS, TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let TOPIC_ID = 0;

describe('Topic Tests', function () {
  this.slow(10000);

  /** Test creating a new topic */
  describe('Create', function () {
    it('Add topic', function (done) {
      request({
        url: `/api/v1/topics`,
        method: 'POST',
        body: JSON.stringify(TEST_TOPICS.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 201);
          assert.hasAllKeys(data, ['id']);
          TOPIC_ID = data.id;
        },
      });
    });
  });

  /** Test retrieval of all topics */
  describe('Read', function () {
    it('Get all topics', function (done) {
      request({
        url: `/api/v1/topics`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isArray(data);
        },
      });
    });

    it('Get random topic', function (done) {
      request({
        url: `/api/v1/topics/random`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isObject(data);
        },
      });
    });

    it('Get single topic', function (done) {
      request({
        url: `/api/v1/topics/${TOPIC_ID}`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isObject(data);
        },
      });
    });

    it('Attempt get single topic with invalid ID', function (done) {
      request({
        url: `/api/v1/topics/0`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        },
      });
    });

    it('Regenerate Topic Bank access token', function (done) {
      request({
        url: `/api/v1/topics/token`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['token']);
        },
      });
    });
  });

  /** Test updating the topic */
  describe('Update', function () {
    it('Update topic', function (done) {
      request({
        url: `/api/v1/topics/${TOPIC_ID}`,
        method: 'PUT',
        body: JSON.stringify(TEST_TOPICS.UPDATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 200);
        },
      });
    });

    it('Vote on topic', function (done) {
      request({
        url: `/api/v1/topics/${TOPIC_ID}/vote/yes`,
        method: 'PUT',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['yes', 'no']);
        },
      });
    });

    it('Attempt update topic with invalid ID', function (done) {
      request({
        url: `/api/v1/topics/0`,
        method: 'PUT',
        body: JSON.stringify(TEST_TOPICS.UPDATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        },
      });
    });
  });

  /** Test deleting the topic */
  describe('Delete', function () {
    it('Delete topic', function (done) {
      request({
        url: `/api/v1/topics/${TOPIC_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 204);
        },
      });
    });

    it('Attempt delete topic with invalid ID', function (done) {
      request({
        url: `/api/v1/topics/0`,
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
