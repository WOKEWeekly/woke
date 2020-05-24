const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const MembersController = require('../controllers/members.controller');

const authorize = verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM);

/** GET all members */
router.get(
  '/',
  verifyToken(CLEARANCES.ACTIONS.VIEW_TEAM),
  MembersController.getAllMembers
);
/** GET single member by ID */
router.get('/:id([0-9]+)', validateReq, MembersController.getSingleMember);

/** GET random member */
router.get('/random', validateReq, MembersController.getRandomMember);

/** GET only authors */
router.get('/authors', validateReq, MembersController.getAuthors);

/** GET only executive members */
router.get('/executives', validateReq, MembersController.getExecutives);

/** POST new member */
router.post('/', authorize, MembersController.addMember);

/** PUT; update member details */
router.put('/:id', authorize, MembersController.updateMember);

/** DELETE member */
router.delete('/:id', authorize, MembersController.deleteMember);

module.exports = router;
