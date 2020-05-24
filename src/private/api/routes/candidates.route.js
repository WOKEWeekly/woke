const express = require('express');
const router = express.Router();
const CandidatesController = require('../controllers/candidates.controller');
const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');


/** GET all candidates */
router.get('/', validateReq, CandidatesController.getAllCandidates);
/** GET Candidate by id */
router.get('/:id([0-9]+)', validateReq, CandidatesController.getCandidate);
/** GET latest candidate */
router.get('/latest', validateReq, CandidatesController.getLatestCandidate);
/** GET random candidate */
router.get('/random', validateReq, CandidatesController.getRandomCandidate);
/** POST new candidate */
router.post(
  '/',
  verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX),
  CandidatesController.addCandidate
);
/** PUT candidate update */
router.put(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX),
  CandidatesController.updateCandidate
);
/** DELETE candidate */
router.delete(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX),
  CandidatesController.deleteCandidate
);

module.exports = router;
