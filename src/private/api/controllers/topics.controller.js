const { respondToClient } = require('../../response');
const async = require('async');
const SQL = require('../../sql');
const conn = require('../db').getDb();
const { ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');

/** Retrieve all topics */
exports.getAllTopics = (req, res) => {
  conn.query(SQL.TOPICS.READ.ALL(), function (err, topics) {
    respondToClient(res, err, 200, topics);
  });
};

/** Retrieve individual topic */
exports.getTopic = (req, res) => {
  const id = req.params.id;
  conn.query(SQL.TOPICS.READ.SINGLE(), id, function (err, [topic] = []) {
    if (err) return respondToClient(res, err);
    if (!topic) err = ERROR.INVALID_ENTITY_ID(ENTITY.TOPIC, id);
    respondToClient(res, err, 200, topic);
  });
};

/** Retrieve a random topic */
exports.getRandomTopic = (req, res) => {
  conn.query(SQL.TOPICS.READ.RANDOM, function (err, [topic] = []) {
    respondToClient(res, err, 200, topic);
  });
};

/** Generate Topic Bank access token */
exports.generateTopicBankToken = (req, res) => {
  const { sql, values, token } = SQL.TOPICS.READ.REGENERATE_TOKEN();
  conn.query(sql, values, function (err) {
    respondToClient(res, err, 200, {
      token
    });
  });
};

/** Add new topic to database */
exports.addTopic = (req, res) => {
  const topic = req.body;
  const { sql, values } = SQL.TOPICS.CREATE(topic);
  conn.query(sql, [values], function (err, result) {
    respondToClient(res, err, 201, {
      id: result.insertId
    });
  });
};

/** Update topic in database */
exports.updateTopic = (req, res) => {
  const id = req.params.id;
  const topic = req.body;

  const { sql, values } = SQL.TOPICS.UPDATE.DETAILS(id, topic);
  conn.query(sql, values, function (err, result) {
    if (err) return respondToClient(res, err);
    if (result.affectedRows === 0)
      err = ERROR.INVALID_ENTITY_ID(ENTITY.TOPIC, id);
    respondToClient(res, err, 200);
  });
};

/** Increment the vote of a topic */
exports.updateTopicVote = (req, res) => {
  const { id, option } = req.params;
  async.waterfall(
    [
      function (callback) {
        // Increment vote
        conn.query(SQL.TOPICS.UPDATE.VOTE(id, option), function (err, result) {
          if (err) return respondToClient(res, err);
          if (result.affectedRows === 0)
            err = ERROR.INVALID_ENTITY_ID(ENTITY.TOPIC, id);
          err ? callback(err) : callback(null);
        });
      },
      function (callback) {
        // Retrieve new topic vote counts
        conn.query(SQL.TOPICS.READ.SINGLE('yes, no'), id, function (
          err,
          [votes] = []
        ) {
          err ? callback(err) : callback(null, votes);
        });
      }
    ],
    function (err, votes) {
      respondToClient(res, err, 200, {
        ...votes
      });
    }
  );
};

/** Delete an existing topic from database */
exports.deleteTopic = (req, res) => {
  const id = req.params.id;
  conn.query(SQL.TOPICS.DELETE, id, function (err, result) {
    // TODO: Slack notifications for deleted topics
    if (err) return respondToClient(res, err);
    if (result.affectedRows === 0)
      err = ERROR.INVALID_ENTITY_ID(ENTITY.TOPIC, id);
    respondToClient(res, err, 204);
  });
};
