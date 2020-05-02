const {
    respondToClient
} = require("../../response");
const async = require("async");
const SQL = require("../../sql");
const conn = require("../db").getDb();
const filer = require('../../filer');
const {
    DIRECTORY,
    ENTITY
} = require('../../../constants/strings');
const ERROR = require('../../errors');

/** Retrieve all reviews */
exports.getAllReviews = (req, res) => {
    conn.query(SQL.REVIEWS.READ.ALL(), function (err, reviews) {
        respondToClient(res, err, 200, reviews);
    });
};

/** Retrieve individual review */
exports.getReview = (req, res) => {
    const id = req.params.id;
    conn.query(SQL.REVIEWS.READ.SINGLE(), id, function (err, [review] = []) {
        if (err) return respondToClient(res, err);
        if (!review) err = ERROR.INVALID_ENTITY_ID(ENTITY.REVIEW, id);
        respondToClient(res, err, 200, review);
    });
};

/** Retrieve 3 5-star reviews with images */
exports.getFeaturedReviews = (req, res) => {
    conn.query(SQL.REVIEWS.READ.FEATURED, function (err, reviews) {
        respondToClient(res, err, 200, reviews);
    });
};

/** Add new review to database */
exports.addReview = (req, res) => {
    const review = req.body;

    async.waterfall([
        function (callback) { // Upload image to cloud
            filer.uploadImage(review, DIRECTORY.REVIEWS, true, callback);
        },
        function (review, callback) { // Add review to database
            const {
                sql,
                values
            } = SQL.REVIEWS.CREATE(review);
            conn.query(sql, [values], function (err, result) {
                err ? callback(err) : callback(null, result.insertId);
            });
        }
    ], function (err, id) {
        respondToClient(res, err, 201, {
            id
        });
    });
};

/** Update details of existing review in database */
exports.updateReview = (req, res) => {
    const id = req.params.id;
    const {
        review,
        changed
    } = req.body;

    async.waterfall([
        function (callback) { // Delete old image if changed.
            conn.query(SQL.REVIEWS.READ.SINGLE('image'), id, function (err, [review] = []) {
                if (err) return callback(err);
                if (!review) return callback(ERROR.INVALID_ENTITY_ID(ENTITY.REVIEW, id));
                if (!changed) return callback(null);
                filer.destroyImage(review.image, callback);
            });
        },
        function (callback) { // Equally, upload new image if changed
            filer.uploadImage(review, DIRECTORY.REVIEWS, changed, callback);
        },
        function (review, callback) { // Update review in database
            const {
                sql,
                values
            } = SQL.REVIEWS.UPDATE(id, review, changed);
            conn.query(sql, values, function (err) {
                err ? callback(err) : callback(null);
            });
        }
    ], function (err) {
        respondToClient(res, err, 200);
    });
};

/** Delete an existing review from database */
exports.deleteReview = (req, res) => {
    const id = req.params.id;

    async.waterfall([
        function (callback) { // Delete image from cloud
            conn.query(SQL.REVIEWS.READ.SINGLE('image'), id, function (err, [review] = []) {
                if (err) return callback(err);
                if (!review) return callback(ERROR.INVALID_ENTITY_ID(ENTITY.REVIEW, id));
                filer.destroyImage(review.image, callback);
            });
        },
        function (callback) { // Delete review from database
            conn.query(SQL.REVIEWS.DELETE, id, function (err) {
                err ? callback(err) : callback(null);
            });
        }
    ], function (err) {
        respondToClient(res, err, 204);
    });
};