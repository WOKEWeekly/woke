const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken } = require('../../middleware');
const PagesController = require('../controllers/pages.controller');

/** PUT; update review details */
router.put('/', verifyToken(CLEARANCES.ACTIONS.EDIT_PAGE), PagesController.updatePage);

module.exports = router;
