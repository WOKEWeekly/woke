// Express
const express = require('express');
const router = express.Router();

// Controllers
const SessionsController = require('../controllers/sessions.controller');
const CLEARANCES = require('../../../constants/clearances');

// Middleware
const { verifyToken, validateReq, logUserActivity } = require('../../middleware');

// Routes /users/friends/
router.get('/', validateReq, SessionsController.getAllSessions);
router.get('/:id([0-9]+)', validateReq, SessionsController.getSession);
router.get('/featured',    validateReq,      SessionsController.getFeaturedSessions);
router.post('/',    verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS),      SessionsController.addSession);
router.put('/:id',     verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS),       SessionsController.updateSessionDetails);
router.delete('/:id',     verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS),     SessionsController.deleteSession);

module.exports = router;