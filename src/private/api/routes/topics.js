// Express
const express = require('express');
const router = express.Router();

// Controllers
const TopicsController = require('../controllers/topics.controller');
const CLEARANCES = require('../../../constants/clearances');

// Middleware
const {
    verifyToken,
    validateReq
} = require('../../middleware');

// Routes /topics 

// GET all topics
router.get('/', verifyToken(CLEARANCES.ACTIONS.VIEW_TOPICS), TopicsController.getAllTopics);
// GET topic by id
router.get('/:id([0-9]+)', validateReq, TopicsController.getTopic);
// GET random topic
router.get('/random', validateReq, TopicsController.getRandomTopic);
// GET generated topic token
router.get('/token', verifyToken(CLEARANCES.ACTIONS.GENERATE_NEW_TOKEN), TopicsController.getTopicToken);
// POST new top
router.post('/', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), TopicsController.addTopic);
// PUT topic update
router.put('/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), TopicsController.updateTopic);
// PUT topic vote update
router.put('/:id/vote/:option(yes|no)', validateReq, TopicsController.updateVotes);
// DELETE topic
router.delete('/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), TopicsController.deleteTopic);

module.exports = router;