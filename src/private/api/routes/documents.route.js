const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken } = require('../../middleware');
const DocumentsController = require('../controllers/documents.controller');

const authorize = verifyToken(CLEARANCES.ACTIONS.CRUD_DOCUMENTS);

/** GET all documents */
router.get('/', authorize, DocumentsController.getAllDocuments);

/** GET single document by ID */
router.get('/:id', authorize, DocumentsController.getDocument);

/** POST new document */
router.post('/', authorize, DocumentsController.addDocument);

/** PUT; update documents details */
router.put('/:id', authorize, DocumentsController.updateDocument);

/** DELETE document */
router.delete('/:id', authorize, DocumentsController.deleteDocument);

module.exports = router;
