const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const ArticlesController = require('../controllers/articles.controller');

const authorize = verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES);

router.get('/', authorize, ArticlesController.getAllArticles);
router.get('/:id([0-9]+)', validateReq, ArticlesController.getArticle);
router.get('/published', validateReq, ArticlesController.getPublishedArticles);
router.post('/', authorize, ArticlesController.addArticle);
router.put('/:id', authorize, ArticlesController.updateArticle);
router.put('/:id/clap', validateReq, ArticlesController.clapForArticle);
router.delete('/:id', authorize, ArticlesController.deleteArticle);

module.exports = router;
