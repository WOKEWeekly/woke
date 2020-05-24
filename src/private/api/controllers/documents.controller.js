/* eslint-disable jsdoc/require-param */
const async = require('async');

const { ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');
const filer = require('../../filer');
const { respondToClient } = require('../../response');
const knex = require('../db').getKnex();

/** Retrieve all documents */
exports.getAllDocuments = (req, res) => {
  const query = knex.select().from('documents');
  query.asCallback(function (err, documents) {
    respondToClient(res, err, 200, documents);
  });
};

/** Retrieve individual document */
exports.getSingleDocument = (req, res) => {
  const { id } = req.params;
  const query = knex.select().from('documents').where('id', id);
  query.asCallback(function (err, [document] = []) {
    if (err) return respondToClient(res, err);
    if (!document) err = ERROR.INVALID_ENTITY_ID(ENTITY.DOCUMENT, id);
    respondToClient(res, err, 200, document);
  });
};

/** Add new document to database */
exports.addDocument = (req, res) => {
  const document = req.body;

  async.waterfall(
    [
      function (callback) {
        // Upload document to cloud
        filer.uploadDocument(document, true, callback);
      },
      function (document, callback) {
        // Add document to database
        const query = knex.insert(document).into('documents');
        query.asCallback(function (err, [id] = []) {
          if (!err) return callback(null, id);
          if (err.errno === 1062)
            err = ERROR.DUPLICATE_ENTITY_NAME(ENTITY.DOCUMENT, document.name);
          callback(err);
        });
      }
    ],
    function (err, id) {
      respondToClient(res, err, 201, {
        id
      });
    }
  );
};

/** Update document */
exports.updateDocument = (req, res) => {
  const { id } = req.params;
  const { document, changed } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Delete original document from cloud
        const query = knex.select().from('documents').where('id', id);
        query.asCallback(function (err, [document] = []) {
          if (err) return callback(err);
          if (!document)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.DOCUMENT, id));
          if (!changed) return callback(null);
          filer.destroyDocument(document.name, callback);
        });
      },
      function (callback) {
        // Upload new document
        filer.uploadDocument(document, changed, callback);
      },
      function (document, callback) {
        // Update session in database
        const query = knex('documents').update(document).where('id', id);
        query.asCallback(function (err) {
          callback(err, document.name);
        });
      }
    ],
    function (err, name) {
      respondToClient(res, err, 200, {
        name
      });
    }
  );
};

/** Delete document */
exports.deleteDocument = (req, res) => {
  const { id } = req.params;

  async.waterfall(
    [
      function (callback) {
        // Delete file from cloud
        const query = knex.select().from('documents').where('id', id);
        query.asCallback(function (err, [document] = []) {
          if (err) return callback(err);
          if (!document)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.DOCUMENT, id));
          filer.destroyDocument(document.name, callback);
        });
      },
      function (callback) {
        // Delete document from database
        const query = knex('documents').where('id', id).del();
        query.asCallback(function (err) {
          callback(err);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 204);
    }
  );
};
