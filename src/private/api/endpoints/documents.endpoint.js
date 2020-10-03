const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken } = require('../../middleware');
const DocumentsController = require('../controllers/documents.controller');

const viewAuthorize = verifyToken(CLEARANCES.ACTIONS.DOCUMENTS.VIEW);
const modifyAuthorize = verifyToken(CLEARANCES.ACTIONS.DOCUMENTS.MODIFY);

/** GET all documents */
router.get('/', viewAuthorize, DocumentsController.getAllDocuments);

/** GET single document by ID */
router.get('/:id', viewAuthorize, DocumentsController.getSingleDocument);

/** POST new document */
router.post('/', modifyAuthorize, DocumentsController.addDocument);

/** PUT; update documents details */
router.put('/:id', modifyAuthorize, DocumentsController.updateDocument);

/** DELETE document */
router.delete('/:id', modifyAuthorize, DocumentsController.deleteDocument);

module.exports = router;
