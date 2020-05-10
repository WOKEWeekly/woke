// Express
const express = require('express');
const router = express.Router();

// Controllers
const SessionsController = require('../controllers/sessions.controller');
const CLEARANCES = require('../../../constants/clearances');

// Middleware
const { verifyToken, validateReq } = require('../../middleware');

// Routes /sessions
router.get('/', validateReq, SessionsController.getAllSessions);
router.get('/:id([0-9]+)', validateReq, SessionsController.getSession);
router.get('/featured', validateReq, SessionsController.getFeaturedSessions);
router.post(
  '/',
  verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS),
  SessionsController.addSession
);
router.put(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS),
  SessionsController.updateSession
);
router.delete(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS),
  SessionsController.deleteSession
);

module.exports = router;
