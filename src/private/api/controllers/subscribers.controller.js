/* eslint-disable jsdoc/require-param */
const { respondToClient } = require('../../response');
const knex = require('../knex').getKnex();
const { ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');

/** Retrieve all subscribers */
exports.getAllSubscribers = (req, res) => {
  const query = knex.select().from('subscribers');
  query.asCallback(function (err, subscribers) {
    respondToClient(res, err, 200, subscribers);
  });
};

/** Retrieve individual subscriber */
exports.getSingleSubscriber = (req, res) => {
  const { id } = req.params;
  const query = knex.select().from('subscribers').where('id', id);
  query.asCallback(function (err, [subscriber] = []) {
    if (err) return respondToClient(res, err);
    if (!subscriber) err = ERROR.INVALID_ENTITY_ID(ENTITY.SUBSCRIBER, id);
    respondToClient(res, err, 200, subscriber);
  });
};

/** Add new subscriber to database */
exports.addSubscriber = (req, res) => {
  const subscriber = req.body;
  const query = knex.insert(subscriber).into('subscribers');
  query.asCallback(function (err, [id] = []) {
    if (err && err.code === ERROR.SQL_DUP_CODE) {
      err = ERROR.DUPLICATE_EMAIL_ADDRESS();
    }
    respondToClient(res, err, 201, {
      id
    });
  });
};

/** Update subscriber in database */
exports.updateSubscriber = (req, res) => {
  const id = req.params.id;
  const subscriber = req.body;

  const query = knex('subscribers').update(subscriber).where('id', id);
  query.asCallback(function (err, result) {
    if (err) {
      if (err.code === ERROR.SQL_DUP_CODE) {
        err = ERROR.DUPLICATE_EMAIL_ADDRESS();
      }
      return respondToClient(res, err);
    }
    if (result === 0) {
      err = ERROR.INVALID_ENTITY_ID(ENTITY.SUBSCRIBER, id);
    }
    respondToClient(res, err, 200);
  });
};

/** Delete an existing subscriber from database */
exports.deleteSubscriber = (req, res) => {
  const { id } = req.params;
  const query = knex('subscribers').where('id', id).del();
  query.asCallback(function (err, result) {
    if (err) return respondToClient(res, err);
    if (result === 0)
      err = ERROR.INVALID_ENTITY_ID(ENTITY.SUBSCRIBER, id);
    respondToClient(res, err, 204);
  });
};

/** Delete an existing subscriber from database */
exports.deleteSubscriberByEmail = (req, res) => {
  const { email } = req.body;
  const query = knex('subscribers').where('email', email).del();
  query.asCallback(function (err, result) {
    if (err) return respondToClient(res, err);
    if (result === 0) err = ERROR.NONEXISTENT_EMAIL_ADDRESS();
    respondToClient(res, err, 204);
  });
};
