// Express
const express = require('express');
const router = express.Router();

// Controllers
const ReviewsController = require('../controllers/reviews.controller');
const CLEARANCES = require('../../../constants/clearances');

// Middleware
const { verifyToken, validateReq } = require('../../middleware');

// Routes /reviews

// GET all reviews
router.get('/', validateReq, ReviewsController.getAllReviews);
// GET review by id
router.get('/:id([0-9]+)', validateReq, ReviewsController.getReview);
// GET featured review
router.get('/featured', validateReq, ReviewsController.getFeaturedReviews);
// POST new review
router.post(
  '/',
  verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS),
  ReviewsController.addReview
);
// PUT review update
router.put(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS),
  ReviewsController.updateReview
);
// DELETE review
router.delete(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS),
  ReviewsController.deleteReview
);

module.exports = router;
