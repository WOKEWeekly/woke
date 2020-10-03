const express = require('express');
const router = express.Router();

const { verifyToken } = require('../../middleware');
const TokenController = require('../controllers/tokens.controller');

/** PUT; update Zoom link */
router.put('/zoom', verifyToken(7), TokenController.updateZoomLink);

module.exports = router;
