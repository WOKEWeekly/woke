const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const MembersController = require('../controllers/members.controller');

const authorize = verifyToken(CLEARANCES.ACTIONS.MEMBERS.MODIFY);

/** GET all members */
router.get(
  '/',
  verifyToken(CLEARANCES.ACTIONS.MEMBERS.VIEW),
  MembersController.getAllMembers
);
/** GET single member by ID */
router.get('/:id([0-9]+)', validateReq, MembersController.getSingleMember);

/** GET random member */
router.get('/random', validateReq, MembersController.getRandomMember);

/** GET only authors */
router.get('/authors', validateReq, MembersController.getAuthors);

/** GET only verified members */
router.get('/verified', validateReq, MembersController.getVerifiedMembers);

/** POST new member */
router.post('/', authorize, MembersController.addMember);

/** PUT; update member details */
router.put('/:id', authorize, MembersController.updateMember);

/** DELETE member */
router.delete('/:id', authorize, MembersController.deleteMember);

module.exports = router;
