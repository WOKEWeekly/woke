const express = require('express');
const router = express.Router();

const { ENTITY, OPERATIONS } = require('../../../constants/strings');
const ERROR = require('../../errors');
const { renderErrorPage } = require('../../response');
const knex = require('../../singleton/knex').getKnex();
const server = require('../../singleton/server').getServer();

/** Page for subscribers */
router.get('/admin/subscribers', (req, res) => {
  return server.render(req, res, '/subscribers/admin', {
    title: 'Subscribers | #WOKEWeekly'
  });
});

/** Add Subscribers page */
router.get('/admin/subscribers/add', (req, res) => {
  return server.render(req, res, '/subscribers/crud', {
    title: 'Add New Subscriber',
    operation: OPERATIONS.CREATE,
  });
});

/** Edit Subscribers page */
router.get('/admin/subscribers/edit/:id', (req, res) => {
  const { id } = req.params;
  const query = knex.select().from('subscribers').where('id', id);
  query.asCallback(function (err, [subscriber] = []) {
    if (err) return renderErrorPage(req, res, err, server);
    if (!subscriber)
      return renderErrorPage(
        req,
        res,
        ERROR.NONEXISTENT_ENTITY(ENTITY.MEMBER),
        server
      );

    return server.render(req, res, '/subscribers/crud', {
      title: 'Edit Subscriber',
      operation: OPERATIONS.UPDATE,
      subscriber
    });
  });
});

module.exports = router;
