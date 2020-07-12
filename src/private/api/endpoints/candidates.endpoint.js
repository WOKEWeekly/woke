const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const CandidatesController = require('../controllers/candidates.controller');

const authorize = verifyToken(CLEARANCES.ACTIONS.CANDIDATES.MODIFY);

/** GET all candidates */
router.get('/', validateReq, CandidatesController.getAllCandidates);

/** GET single candidate by ID */
router.get(
  '/:id([0-9]+)',
  validateReq,
  CandidatesController.getSingleCandidate
);

/** GET latest candidate */
router.get('/latest', validateReq, CandidatesController.getLatestCandidate);

/** GET random candidate */
router.get('/random', validateReq, CandidatesController.getRandomCandidate);

/** POST new candidate */
router.post('/', authorize, CandidatesController.addCandidate);

/** PUT; update candidate details */
router.put('/:id', authorize, CandidatesController.updateCandidate);

/** DELETE candidate */
router.delete('/:id', authorize, CandidatesController.deleteCandidate);

module.exports = router;
