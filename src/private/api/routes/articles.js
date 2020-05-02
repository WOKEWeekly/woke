// Express
const express = require('express');
const router = express.Router();

// Controllers
const ArticlesController = require('../controllers/articles.controller');
const CLEARANCES = require('../../../constants/clearances');

// Middleware
const {
    verifyToken,
    validateReq
} = require('../../middleware');

// Routes /articles 

// GET all articles
router.get('/', verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES), ArticlesController.getAllArticles);
// GET article by id
router.get('/:id([0-9]+)', validateReq, ArticlesController.getArticle);
// GET published article
router.get('/published', validateReq, ArticlesController.getPublishedArticles);
// POST new article
router.post('/', verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES), ArticlesController.addArticle);
// PUT article update
router.put('/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES), ArticlesController.updateArticle);
// DELETE article
router.delete('/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES), ArticlesController.deleteArticle);

module.exports = router;