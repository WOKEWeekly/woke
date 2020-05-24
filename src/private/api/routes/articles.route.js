const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const ArticlesController = require('../controllers/articles.controller');

// GET all articles
router.get(
  '/',
  verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES),
  ArticlesController.getAllArticles
);

// GET single article by id
router.get('/:id([0-9]+)', validateReq, ArticlesController.getArticle);

// GET all published articles
router.get('/published', validateReq, ArticlesController.getPublishedArticles);

// POST new article
router.post(
  '/',
  verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES),
  ArticlesController.addArticle
);

// PUT article details
router.put(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES),
  ArticlesController.updateArticle
);

// PUT article claps
router.put('/:id/clap', validateReq, ArticlesController.clapForArticle);

// DELETE article
router.delete(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES),
  ArticlesController.deleteArticle
);

module.exports = router;
