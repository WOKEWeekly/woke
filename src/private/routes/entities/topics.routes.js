const express = require('express');
const router = express.Router();

const { ENTITY, OPERATIONS } = require('../../../constants/strings');
const ERROR = require('../../errors');
const { renderErrorPage } = require('../../response');
const knex = require('../../singleton/knex').getKnex();
const server = require('../../singleton/server').getServer();

/** Topic Bank page */
router.get('/topics', (req, res) => {
  const accessToken = req.query.access;
  knex
    .select()
    .from('tokens')
    .where('name', 'topicBank')
    .asCallback(function (err, [token] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      const hasAccess = token && token.value === accessToken;

      return server.render(req, res, '/topics', {
        title: 'Topic Bank | #WOKEWeekly',
        description: 'The currency of the franchise.',
        ogUrl: '/topics',
        cardImage: `public/bg/card-topics.jpg`,
        backgroundImage: 'bg-topics.jpg',
        hasAccess
      });
    });
});

/** Add Topic page */
router.get('/admin/topics/add', (req, res) => {
  return server.render(req, res, '/topics/crud', {
    title: 'Add New Topic',
    operation: OPERATIONS.CREATE,
    backgroundImage: 'bg-topics.jpg'
  });
});

/** Edit Topic page */
router.get('/admin/topics/edit/:id', (req, res) => {
  const id = req.params.id;
  const query = knex.select().from('topics').where('id', id);
  query.asCallback(function (err, [topic] = []) {
    if (err) return renderErrorPage(req, res, err, server);
    if (!topic)
      return renderErrorPage(
        req,
        res,
        ERROR.NONEXISTENT_ENTITY(ENTITY.TOPIC),
        server
      );

    return server.render(req, res, '/topics/crud', {
      title: 'Edit Topic',
      operation: OPERATIONS.UPDATE,
      backgroundImage: 'bg-topics.jpg',
      topic
    });
  });
});

module.exports = router;
