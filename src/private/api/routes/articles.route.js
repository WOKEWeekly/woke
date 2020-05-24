const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const ArticlesController = require('../controllers/articles.controller');

const authorize = verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES);

/** GET all articles */
router.get('/', authorize, ArticlesController.getAllArticles);

/** GET single article by ID */
router.get('/:id([0-9]+)', validateReq, ArticlesController.getArticle);

/** GET all articles */
router.get('/published', validateReq, ArticlesController.getPublishedArticles);

/** POST new article */
router.post('/', authorize, ArticlesController.addArticle);

/** PUT; update article details */
router.put('/:id', authorize, ArticlesController.updateArticle);

/** PUT; increment article claps */
router.put('/:id/clap', validateReq, ArticlesController.clapForArticle);

/** DELETE article */
router.delete('/:id', authorize, ArticlesController.deleteArticle);

module.exports = router;
