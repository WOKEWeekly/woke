// Express
const express = require('express');
const router = express.Router();

// Controllers
const MembersController = require('../controllers/members.controller');
const CLEARANCES = require('../../../constants/clearances');

// Middleware
const {
    verifyToken,
    validateReq
} = require('../../middleware');

// Routes /members 

// GET all members
router.get('/', verifyToken(CLEARANCES.ACTIONS.VIEW_TEAM), MembersController.getAllMembers);
// GET member by id
router.get('/:id([0-9]+)', validateReq, MembersController.getMember);
// GET random member
router.get('/random', validateReq, MembersController.getRandomMember);
// GET authors
router.get('/authors', validateReq, MembersController.getAuthors);
// GET executive members
router.get('/executives', validateReq, MembersController.getExecutives);
// POST new member
router.post('/', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), MembersController.addMember);
// PUT member update
router.put('/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), MembersController.updateMember);
// DELETE member
router.delete('/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), MembersController.deleteMember);

module.exports = router;