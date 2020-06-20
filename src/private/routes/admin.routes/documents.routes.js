const express = require('express');
const router = express.Router();

const { ENTITY, OPERATIONS } = require('../../../constants/strings');
const knex = require('../../setKnex').getKnex();
const ERROR = require('../../errors');
const { renderErrorPage } = require('../../response');
const server = require('../../setServer').getServer();

/** Document admin page */
router.get('/', (req, res) => {
  return server.render(req, res, '/documents', {
    title: 'Document Admin'
  });
});

/** Add new document form */
router.get('/add', (req, res) => {
  return server.render(req, res, '/documents/crud', {
    title: 'Add New Document',
    operation: OPERATIONS.CREATE
  });
});

/** Edit document form */
router.get('/edit/:id', (req, res) => {
  const { id } = req.params;

  const query = knex.select().from('documents').where('id', id);
  query.asCallback(function (err, [document] = []) {
    if (err) return renderErrorPage(req, res, err, server);
    if (!document)
      return renderErrorPage(
        req,
        res,
        ERROR.NONEXISTENT_ENTITY(ENTITY.DOCUMENT),
        server
      );

    return server.render(req, res, '/documents/crud', {
      title: 'Edit Document',
      operation: OPERATIONS.UPDATE,
      document
    });
  });
});

module.exports = router;
