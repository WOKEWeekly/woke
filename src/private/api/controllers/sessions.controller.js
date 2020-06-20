/* eslint-disable jsdoc/require-param */
const async = require('async');

const { respondToClient } = require('../../response');
const knex = require('../../setKnex').getKnex();
const filer = require('../../filer');
const { DIRECTORY, ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');

exports.getAllSessions = (req, res) => {
  const query = knex.select().from('sessions');
  query.asCallback(function (err, sessions) {
    respondToClient(res, err, 200, sessions);
  });
};

exports.getSingleSession = (req, res) => {
  const id = req.params.id;
  const query = knex.select().from('sessions').where('id', id);
  query.asCallback(function (err, [session] = []) {
    if (err) return respondToClient(res, err);
    if (!session) err = ERROR.INVALID_ENTITY_ID(ENTITY.SESSION, id);
    respondToClient(res, err, 200, session);
  });
};

exports.getFeaturedSessions = (req, res) => {
  async.waterfall(
    [
      function (callback) {
        // Get a random upcoming session
        const query = knex
          .select()
          .from('sessions')
          .where('dateHeld', '>', 'NOW()')
          .orderByRaw('RAND()')
          .limit(1);
        query.asCallback(function (err, [session] = []) {
          if (err) return callback(err);
          if (!session) return callback(null);
          callback(true, {
            session,
            upcoming: true
          });
        });
      },
      function (callback) {
        // If not, get latest session
        const query = knex
          .select()
          .from('sessions')
          .orderBy('dateHeld', 'DESC')
          .limit(1);
        query.asCallback(function (err, [session] = []) {
          if (err) return callback(err);
          if (!session) return callback(null);
          callback(null, {
            session,
            upcoming: false
          });
        });
      }
    ],
    function (err, session) {
      respondToClient(res, err, 200, session);
    }
  );
};

exports.addSession = (req, res) => {
  const session = req.body;

  async.waterfall(
    [
      function (callback) {
        // Upload image to cloud
        filer.uploadImage(session, DIRECTORY.SESSIONS, true, callback);
      },
      function (session, callback) {
        // Add session to database
        const query = knex.insert(session).into('sessions');
        query.asCallback(function (err, [id] = []) {
          callback(err, id);
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

exports.updateSession = (req, res) => {
  const id = req.params.id;
  const { session, changed } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Delete old image if changed.
        const query = knex.select().from('sessions').where('id', id);
        query.asCallback(function (err, [session] = []) {
          if (err) return callback(err);
          if (!session)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.SESSION, id));
          if (!changed) return callback(null);
          filer.destroyImage(session.image, callback);
        });
      },
      function (callback) {
        // Equally, upload new image if changed
        filer.uploadImage(session, DIRECTORY.SESSIONS, changed, callback);
      },
      function (session, callback) {
        // Update session in database
        const query = knex('sessions').update(session).where('id', id);
        query.asCallback(function (err) {
          err ? callback(err) : callback(null, session.slug);
        });
      }
    ],
    function (err, slug) {
      respondToClient(res, err, 200, {
        slug
      });
    }
  );
};

exports.deleteSession = (req, res) => {
  const id = req.params.id;

  async.waterfall(
    [
      function (callback) {
        // Delete image from cloud
        const query = knex.select().from('sessions').where('id', id);
        query.asCallback(function (err, [session] = []) {
          if (err) return callback(err);
          if (!session)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.SESSION, id));
          filer.destroyImage(session.image, callback);
        });
      },
      function (callback) {
        // Delete session from database
        const query = knex('sessions').where('id', id).del();
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
