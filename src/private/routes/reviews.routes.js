const express = require('express');
const router = express.Router();

const { ENTITY, OPERATIONS } = require('../../constants/strings');
const ERROR = require('../errors');
const { renderErrorPage } = require('../response');
const knex = require('../singleton/knex').getKnex();
const server = require('../singleton/server').getServer();

/** Reviews Page */
router.get('/reviews', (req, res) => {
  return server.render(req, res, '/reviews', {
    title: 'Reviews | #WOKEWeekly',
    description: 'Read what the people have to say about us.',
    ogUrl: '/reviews',
    cardImage: `public/bg/card-reviews.jpg`
  });
});

/** Add Review page */
router.get('/admin/reviews/add', (req, res) => {
  return server.render(req, res, '/reviews/crud', {
    title: 'Add New Review',
    operation: OPERATIONS.CREATE
  });
});

/** Edit Review page */
router.get('/admin/reviews/edit/:id', (req, res) => {
  const id = req.params.id;

  const query = knex.select().from('reviews').where('id', id);
  query.asCallback(function (err, [review] = []) {
    if (err) return renderErrorPage(req, res, err, server);
    if (!review)
      return renderErrorPage(
        req,
        res,
        ERROR.NONEXISTENT_ENTITY(ENTITY.REVIEW),
        server
      );

    server.render(req, res, '/reviews/crud', {
      title: 'Edit Review',
      operation: OPERATIONS.UPDATE,
      review
    });
  });
});

module.exports = router;
