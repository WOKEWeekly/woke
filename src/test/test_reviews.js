const { assert, request, HEADERS } = require('./configuration/constants.js');
const { TEST_REVIEWS, TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let REVIEW_ID = 0;
let REVIEWS_LENGTH = 0;

describe('Review Tests', function () {
  this.slow(10000);

  /** Test creating a new review */
  describe('Create', function () {
    it('Add review', function (done) {
      request({
        url: `/api/v1/reviews`,
        method: 'POST',
        body: JSON.stringify(TEST_REVIEWS.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 201);
          assert.hasAllKeys(data, ['id']);
          REVIEW_ID = data.id;
        }
      });
    });
  });

  /** Test retrieval of all reviews */
  describe('Read', function () {
    it('Get all reviews', function (done) {
      request({
        url: `/api/v1/reviews`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isArray(data);
          REVIEWS_LENGTH = data.length;
        }
      });
    });

    it('Get single review', function (done) {
      request({
        url: `/api/v1/reviews/${REVIEW_ID}`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it('Get featured reviews', function (done) {
      request({
        url: `/api/v1/reviews/featured`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({ status, data }) => {
          assert.equal(status, 200);
          assert.isAtMost(data.length, 3);
          data.forEach((review) => {
            assert.include(review, { rating: 5 });
            assert.exists(review.image);
            assert.isNotEmpty(review.image);
          });
        }
      });
    });

    it('Attempt get single review with invalid ID', function (done) {
      request({
        url: `/api/v1/reviews/0`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        }
      });
    });
  });

  /** Test updating the review */
  describe('Update', function () {
    it('Update review without image change', function (done) {
      request({
        url: `/api/v1/reviews/${REVIEW_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          review: TEST_REVIEWS.UPDATED,
          changed: false
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 200);
        }
      });
    });

    it('Update review with image change', function (done) {
      request({
        url: `/api/v1/reviews/${REVIEW_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          review: TEST_REVIEWS.UPDATED,
          changed: true
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 200);
        }
      });
    });

    it('Attempt update review with invalid ID', function (done) {
      request({
        url: `/api/v1/reviews/0`,
        method: 'PUT',
        body: JSON.stringify({
          review: TEST_REVIEWS.UPDATED,
          changed: true
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({ status }) => {
          assert.equal(status, 404);
        }
      });
    });
  });

  /** Test deleting the review */
  describe('Delete', function () {
    it('Delete review', function (done) {
      request({
        url: `/api/v1/reviews/${REVIEW_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 204);
        }
      });
    });

    it('Attempt delete review with invalid ID', function (done) {
      request({
        url: `/api/v1/reviews/0`,
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
