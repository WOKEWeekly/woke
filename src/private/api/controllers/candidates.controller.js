/* eslint-disable jsdoc/require-param */
const async = require('async');

const { DIRECTORY, ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');
const filer = require('../../filer');
const { respondToClient } = require('../../response');
const knex = require('../db').getKnex();

const columns = [
  'candidates.*',
  {
    authorName: knex.raw("CONCAT(members.firstname, ' ', members.lastname)")
  },
  { authorLevel: 'members.level' },
  { authorSlug: 'members.slug' },
  { authorImage: 'members.image' },
  { authorDescription: 'members.description' },
  { authorSocials: 'members.socials' }
];

/** Retrieve all candidates */
exports.getAllCandidates = (req, res) => {
  const query = knex
    .columns(columns)
    .select()
    .from('candidates')
    .leftJoin('members', 'candidates.authorId', 'members.id');
  query.asCallback(function (err, candidates) {
    respondToClient(res, err, 200, candidates);
  });
};

/** Retrieve individual candidate */
exports.getSingleCandidate = (req, res) => {
  const { id } = req.params;
  const query = knex
    .columns(columns)
    .select()
    .from('candidates')
    .leftJoin('members', 'candidates.authorId', 'members.id')
    .where('candidates.id', id);
  query.asCallback(function (err, [candidate] = []) {
    if (err) return respondToClient(res, err);
    if (!candidate) err = ERROR.INVALID_ENTITY_ID(ENTITY.CANDIDATE, id);
    respondToClient(res, err, 200, candidate);
  });
};

/** Retrieve the details of the latest candidate  */
exports.getLatestCandidate = (req, res) => {
  const query = knex
    .columns(columns)
    .select()
    .from('candidates')
    .leftJoin('members', 'candidates.authorId', 'members.id')
    .orderBy('candidates.id', 'DESC')
    .limit(1);
  query.asCallback(function (err, [candidate] = []) {
    respondToClient(res, err, 200, candidate);
  });
};

/** Get random candidate */
exports.getRandomCandidate = (req, res) => {
  const query = knex
    .columns(columns)
    .select()
    .from('candidates')
    .leftJoin('members', 'candidates.authorId', 'members.id')
    .orderByRaw('RAND()')
    .limit(1);
  query.asCallback(function (err, [candidate] = []) {
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
        const query = knex.insert(candidate).into('candidates');
        query.asCallback(function (err) {
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
        const query = knex.select().from('candidates').where('id', id);
        query.asCallback(function (err, [candidate] = []) {
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
        const query = knex('candidates').update(candidate).where('id', id);
        query.asCallback(function (err) {
          callback(err);
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
        const query = knex.select().from('candidates').where('id', id);
        query.asCallback(function (err, [candidate] = []) {
          if (err) return callback(err);
          if (!candidate)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.CANDIDATE, id));
          filer.destroyImage(candidate.image, callback);
        });
      },
      function (callback) {
        // Delete candidate from database
        const query = knex('candidates').where('id', id).del();
        query.asCallback(function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 204);
    }
  );
};
