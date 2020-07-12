const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const ReviewsController = require('../controllers/reviews.controller');

const authorize = verifyToken(CLEARANCES.ACTIONS.REVIEWS.MODIFY);

/** GET all reviews */
router.get('/', validateReq, ReviewsController.getAllReviews);

/** GET single review by ID */
router.get('/:id([0-9]+)', validateReq, ReviewsController.getSingleReview);

/** GET featured review */
router.get('/featured', validateReq, ReviewsController.getFeaturedReviews);

/** POST new review */
router.post('/', authorize, ReviewsController.addReview);

/** PUT; update review details */
router.put('/:id', authorize, ReviewsController.updateReview);

/** DELETE review */
router.delete('/:id', authorize, ReviewsController.deleteReview);

module.exports = router;
