/* eslint-disable jsdoc/require-param */
const async = require('async');

const { respondToClient } = require('../../response');
const knex = require('../knex').getKnex();
const { ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');

const { zString } = require('zavid-modules');

/** Retrieve all topics */
exports.getAllTopics = (req, res) => {
  const query = knex.select().from('topics');
  query.asCallback(function (err, topics) {
    respondToClient(res, err, 200, topics);
  });
};

/** Retrieve individual topic */
exports.getSingleTopic = (req, res) => {
  const { id } = req.params;
  const query = knex.select().from('topics').where('id', id);
  query.asCallback(function (err, [topic] = []) {
    if (err) return respondToClient(res, err);
    if (!topic) err = ERROR.INVALID_ENTITY_ID(ENTITY.TOPIC, id);
    respondToClient(res, err, 200, topic);
  });
};

/** Retrieve a random topic */
exports.getRandomTopic = (req, res) => {
  const query = knex
    .select()
    .from('topics')
    .where('polarity', 1)
    .whereNotIn('category', ['Christian', 'Mental Health'])
    .orderByRaw('RAND()')
    .limit(1);
  query.asCallback(function (err, [topic] = []) {
    respondToClient(res, err, 200, topic);
  });
};

/** Generate Topic Bank access token */
exports.generateTopicBankToken = (req, res) => {
  const token = zString.generateRandomString(12);
  const query = knex('tokens')
    .update({
      value: token,
      lastUpdated: new Date()
    })
    .where('name', 'topicBank');
  query.asCallback(function (err) {
    respondToClient(res, err, 200, {
      token
    });
  });
};

/** Add new topic to database */
exports.addTopic = (req, res) => {
  const topic = req.body;
  const query = knex.insert(topic).into('topics');
  query.asCallback(function (err, [id] = []) {
    respondToClient(res, err, 201, {
      id
    });
  });
};

/** Update topic in database */
exports.updateTopic = (req, res) => {
  const id = req.params.id;
  const topic = req.body;

  const query = knex('topics').update(topic).where('id', id);
  query.asCallback(function (err, result) {
    if (err) return respondToClient(res, err);
    if (result === 0)
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
        const query = knex('topics')
          .increment({ [option]: 1 })
          .where('id', id);
        query.asCallback(function (err, result) {
          if (err) return respondToClient(res, err);
          if (result === 0)
            err = ERROR.INVALID_ENTITY_ID(ENTITY.TOPIC, id);
          err ? callback(err) : callback(null);
        });
      },
      function (callback) {
        // Retrieve new topic vote counts
        const query = knex.select('yes', 'no').from('topics').where('id', id);
        query.asCallback(function (err, [votes] = []) {
          callback(err, votes);
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
  const { id } = req.params;
  const query = knex('topics').where('id', id).del();
  query.asCallback(function (err, result) {
    // TODO: Slack notifications for deleted topics
    if (err) return respondToClient(res, err);
    if (result === 0)
      err = ERROR.INVALID_ENTITY_ID(ENTITY.TOPIC, id);
    respondToClient(res, err, 204);
  });
};
