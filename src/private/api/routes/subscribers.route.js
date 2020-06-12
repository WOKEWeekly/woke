const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const SubscribersController = require('../controllers/subscribers.controller');

const authorizeView = verifyToken(CLEARANCES.ACTIONS.SUBSCRIBERS.MODIFY);
const authorizeModify = verifyToken(CLEARANCES.ACTIONS.SUBSCRIBERS.MODIFY);

/** GET all registered subscribers */
router.get('/', authorizeView, SubscribersController.getAllSubscribers);

/** GET single subscriber by ID */
router.get(
  '/:id([0-9]+)',
  authorizeView,
  SubscribersController.getSingleSubscriber
);

/** POST new subscriber */
router.post('/', validateReq, SubscribersController.addSubscriber);

/** PUT; update subscriber details */
router.put('/:id', authorizeModify, SubscribersController.updateSubscriber);

/** DELETE subscriber */
router.delete('/:id', authorizeModify, SubscribersController.deleteSubscriber);

module.exports = router;