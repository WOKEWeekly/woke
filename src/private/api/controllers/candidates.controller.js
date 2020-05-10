const { respondToClient } = require('../../response');
const async = require('async');
const SQL = require('../../sql');
const conn = require('../db').getDb();
const filer = require('../../filer');
const { DIRECTORY, ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');

/** Retrieve all candidates */
exports.getAllCandidates = (req, res) => {
  conn.query(SQL.CANDIDATES.READ.ALL, function (err, candidates) {
    respondToClient(res, err, 200, candidates);
  });
};

/** Retrieve individual candidate */
exports.getCandidate = (req, res) => {
  const id = req.params.id;
  conn.query(SQL.CANDIDATES.READ.SINGLE(), id, function (
    err,
    [candidate] = []
  ) {
    if (err) return respondToClient(res, err);
    if (!candidate) err = ERROR.INVALID_ENTITY_ID(ENTITY.CANDIDATE, id);
    respondToClient(res, err, 200, candidate);
  });
};

/** Retrieve the details of the latest candidate  */
exports.getLatestCandidate = (req, res) => {
  conn.query(SQL.CANDIDATES.READ.LATEST, function (err, [candidate] = []) {
    respondToClient(res, err, 200, candidate);
  });
};

/** Get random candidate */
exports.getRandomCandidate = (req, res) => {
  conn.query(SQL.CANDIDATES.READ.RANDOM, function (err, [candidate] = []) {
    respondToClient(res, err, 200, candidate);
  });
};

/** Add new candidate to database */
exports.addCandidate = (req, res) => {
  const candidate = req.body;

  async.waterfall(
    [
      function (callback) {
        // Upload image to cloud
        filer.uploadImage(candidate, DIRECTORY.CANDIDATES, true, callback);
      },
      function (candidate, callback) {
        // Add candidate to database
        const { sql, values } = SQL.CANDIDATES.CREATE(candidate);
        conn.query(sql, [values], function (err) {
          if (err) {
            if (err.errno === 1062)
              err = ERROR.DUPLICATE_CANDIDATE_ID(candidate.id);
            callback(err);
          } else {
            callback(null);
          }
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 201);
    }
  );
};

/** Update details of existing candidate in database */
exports.updateCandidate = (req, res) => {
  const id = req.params.id;
  const { candidate, changed } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Delete original image from cloud
        conn.query(SQL.CANDIDATES.READ.SINGLE('image'), id, function (
          err,
          [candidate] = []
        ) {
          if (err) return callback(err);
          if (!candidate)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.CANDIDATE, id));
          if (!changed) return callback(null);
          filer.destroyImage(candidate.image, callback);
        });
      },
      function (callback) {
        // Equally, upload new image if changed
        filer.uploadImage(candidate, DIRECTORY.CANDIDATES, changed, callback);
      },
      function (candidate, callback) {
        // Update candidate in database
        const { sql, values } = SQL.CANDIDATES.UPDATE(id, candidate, changed);
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 200);
    }
  );
};

/** Delete an existing candidate from database */
exports.deleteCandidate = (req, res) => {
  const id = req.params.id;

  async.waterfall(
    [
      function (callback) {
        // Delete image from cloud
        conn.query(SQL.CANDIDATES.READ.SINGLE('image'), id, function (
          err,
          [candidate] = []
        ) {
          if (err) return callback(err);
          if (!candidate)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.CANDIDATE, id));
          filer.destroyImage(candidate.image, callback);
        });
      },
      function (callback) {
        // Delete candidate from database
        conn.query(SQL.CANDIDATES.DELETE, id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 204);
    }
  );
};
