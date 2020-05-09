const {
  respondToClient
} = require("../../response");
const async = require("async");
const SQL = require("../../sql");
const conn = require("../db").getDb();
const filer = require('../../filer');
const {
  DIRECTORY,
  ENTITY
} = require('../../../constants/strings');
const ERROR = require('../../errors');


exports.getAllSessions = (req, res) => {
  conn.query(SQL.SESSIONS.READ.ALL, function (err, sessions) {
    respondToClient(res, err, 200, sessions);
  });
};

exports.getSession = (req, res) => {
  const id = req.params.id;
  conn.query(SQL.SESSIONS.READ.SINGLE("id"), id, function (
    err,
    [session] = []
  ) {
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
        conn.query(SQL.SESSIONS.READ.UPCOMING, function (err, [session] = []) {
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
        conn.query(SQL.SESSIONS.READ.LATEST, function (err, [session] = []) {
          if (err) return callback(err);
          if (!session) return callback(null);
          callback(null, {
            session,
            upcoming: false
          });
        });
      },
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
        const {
          sql,
          values
        } = SQL.SESSIONS.CREATE(session);
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      },
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
  const {
    session,
    changed
  } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Delete old image if changed.
        conn.query(SQL.SESSIONS.READ.SINGLE("id", "image"), id, function (
          err,
          [session] = []
        ) {
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
        const {
          sql,
          values
        } = SQL.SESSIONS.UPDATE(id, session, changed);
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null, session.slug);
        });
      },
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

  async.waterfall([
    function (callback) { // Delete image from cloud
      conn.query(SQL.SESSIONS.READ.SINGLE('id', 'image'), id, function (err, [session] = []) {
        if (err) return callback(err);
        if (!session) return callback(ERROR.INVALID_ENTITY_ID(ENTITY.SESSION, id));
        filer.destroyImage(session.image, callback);
      });
    },
    function (callback) { // Delete session from database
      conn.query(SQL.SESSIONS.DELETE, id, function (err) {
        err ? callback(err) : callback(null);
      });
    }
  ], function (err) {
    respondToClient(res, err, 204);
  });
};