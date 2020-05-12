// Express
const express = require('express');
const router = express.Router();

// Controllers
const DocumentsController = require('../controllers/documents.controller');
const CLEARANCES = require('../../../constants/clearances');
// Middleware
const { verifyToken } = require('../../middleware');

// GET all documents
router.get(
  '/',
  verifyToken(CLEARANCES.ACTIONS.CRUD_DOCUMENTS),
  DocumentsController.getAllDocuments
);
// GET documents by id
router.get(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_DOCUMENTS),
  DocumentsController.getDocument
);
// POST new documents
router.post(
  '/',
  verifyToken(CLEARANCES.ACTIONS.CRUD_DOCUMENTS),
  DocumentsController.addDocument
);
// PUT documents update
router.put(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_DOCUMENTS),
  DocumentsController.updateDocument
);
// DELETE documents
router.delete(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.CRUD_DOCUMENTS),
  DocumentsController.deleteDocument
);

module.exports = router;
