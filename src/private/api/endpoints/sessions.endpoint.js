const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const SessionsController = require('../controllers/sessions.controller');

const authorize = verifyToken(CLEARANCES.ACTIONS.SESSIONS.MODIFY);

/** GET all sessions */
router.get('/', validateReq, SessionsController.getAllSessions);

/** GET single session by ID */
router.get('/:id([0-9]+)', validateReq, SessionsController.getSingleSession);

/** GET featured session */
router.get('/featured', validateReq, SessionsController.getFeaturedSessions);

/** POST new session */
router.post('/', authorize, SessionsController.addSession);

/** PUT; update session details */
router.put('/:id', authorize, SessionsController.updateSession);

/** DELETE session */
router.delete('/:id', authorize, SessionsController.deleteSession);

module.exports = router;
