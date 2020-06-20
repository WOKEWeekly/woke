/* eslint-disable jsdoc/require-param */
const async = require('async');

const { respondToClient } = require('../../response');
const knex = require('../../setKnex').getKnex();
const filer = require('../../filer');
const { DIRECTORY, ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');

/** Retrieve all reviews */
exports.getAllReviews = (req, res) => {
  const query = knex.select().from('reviews');
  query.asCallback(function (err, reviews) {
    respondToClient(res, err, 200, reviews);
  });
};

/** Retrieve individual review */
exports.getSingleReview = (req, res) => {
  const id = req.params.id;
  const query = knex.select().from('reviews').where('id', id);
  query.asCallback(function (err, [review] = []) {
    if (err) return respondToClient(res, err);
    if (!review) err = ERROR.INVALID_ENTITY_ID(ENTITY.REVIEW, id);
    respondToClient(res, err, 200, review);
  });
};

/** Retrieve 3 5-star reviews with images */
exports.getFeaturedReviews = (req, res) => {
  const query = knex
    .select()
    .from('reviews')
    .where('rating', 5)
    .whereNot(knex.raw('CHAR_LENGTH(image)'), 0)
    .limit(3);
  query.asCallback(function (err, reviews) {
    respondToClient(res, err, 200, reviews);
  });
};

/** Add new review to database */
exports.addReview = (req, res) => {
  const review = req.body;

  async.waterfall(
    [
      function (callback) {
        // Upload image to cloud
        filer.uploadImage(review, DIRECTORY.REVIEWS, true, callback);
      },
      function (review, callback) {
        // Add review to database
        const query = knex.insert(review).into('reviews');
        query.asCallback(function (err, [id] = []) {
          callback(err, id);
        });
      }
    ],
    function (err, id) {
      respondToClient(res, err, 201, {
        id
      });
    }
  );
};

/** Update details of existing review in database */
exports.updateReview = (req, res) => {
  const id = req.params.id;
  const { review, changed } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Delete old image if changed.
        const query = knex.select().from('reviews').where('id', id);
        query.asCallback(function (err, [review] = []) {
          if (err) return callback(err);
          if (!review)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.REVIEW, id));
          if (!changed) return callback(null);
          filer.destroyImage(review.image, callback);
        });
      },
      function (callback) {
        // Equally, upload new image if changed
        filer.uploadImage(review, DIRECTORY.REVIEWS, changed, callback);
      },
      function (review, callback) {
        // Update review in database
        const query = knex('reviews').update(review).where('id', id);
        query.asCallback(function (err) {
          callback(err);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 200);
    }
  );
};

/** Delete an existing review from database */
exports.deleteReview = (req, res) => {
  const id = req.params.id;

  async.waterfall(
    [
      function (callback) {
        // Delete image from cloud
        const query = knex.select().from('reviews').where('id', id);
        query.asCallback(function (err, [review] = []) {
          if (err) return callback(err);
          if (!review)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.REVIEW, id));
          filer.destroyImage(review.image, callback);
        });
      },
      function (callback) {
        // Delete review from database
        const query = knex('reviews').where('id', id).del();
        query.asCallback(function (err) {
          callback(err);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 204);
    }
  );
};
