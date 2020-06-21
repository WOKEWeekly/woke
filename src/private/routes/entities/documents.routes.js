const express = require('express');
const request = require('request');
const router = express.Router();

const { cloudinary } = require('../../../constants/settings.js');
const { ENTITY, OPERATIONS } = require('../../../constants/strings');
const ERROR = require('../../errors');
const { renderErrorPage } = require('../../response');
const knex = require('../../singleton/knex').getKnex();
const server = require('../../singleton/server').getServer();

const env = process.env.NODE_ENV !== 'production' ? 'dev' : 'prod';

router.get('/docs/:name', function (req, res) {
  const { name } = req.params;
  const query = knex.select().from('documents').where('name', name);
  query.asCallback(function (err, [document] = []) {
    if (err) return renderErrorPage(req, res, err, server);
    if (!document)
      return renderErrorPage(
        req,
        res,
        ERROR.NONEXISTENT_ENTITY(ENTITY.DOCUMENT),
        server
      );
    return renderDocument(res, document);
  });
});

/** Document admin page */
router.get('/admin/documents', (req, res) => {
  return server.render(req, res, '/documents', {
    title: 'Document Admin'
  });
});

/** Add new document form */
router.get('/admin/documents/add', (req, res) => {
  return server.render(req, res, '/documents/crud', {
    title: 'Add New Document',
    operation: OPERATIONS.CREATE
  });
});

/** Edit document form */
router.get('/admin/documents/edit/:id', (req, res) => {
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

/**
 * Render a document, particularly a PDF, from Cloudinary.
 * @param {object} res - The response context.
 * @param {object} document - The document object containing
 * the file and version.
 */
const renderDocument = (res, document) => {
  const { file, version } = document;

  const affix = version ? `v${version}/${env}` : env;
  const url = `${cloudinary.url}/${affix}/documents/${file}`;

  request(url).pipe(res);
};
