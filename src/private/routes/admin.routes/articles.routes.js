const express = require('express');
const router = express.Router();

const { ENTITY, OPERATIONS } = require('../../../constants/strings');
const knex = require('../../singleton/knex').getKnex();
const ERROR = require('../../errors');
const { renderErrorPage } = require('../../response');
const server = require('../../singleton/server').getServer();

/** Blog admin page */
router.get('/', function (req, res) {
  return server.render(req, res, '/articles/admin', {
    title: 'Blog Admin',
    backgroundImage: 'bg-blog.jpg'
  });
});

/** Add article */
router.get('/add', function (req, res) {
  return server.render(req, res, '/articles/crud', {
    title: 'Add New Article',
    operation: OPERATIONS.CREATE,
    backgroundImage: 'bg-blog.jpg'
  });
});

/** Edit article */
router.get('/edit/:id', function (req, res) {
  const { id } = req.params;

  const query = knex
    .columns([
      'articles.*',
      {
        authorName: knex.raw("CONCAT(members.firstname, ' ', members.lastname)")
      },
      {
        authorLevel: 'members.level'
      },
      {
        authorSlug: 'members.slug'
      },
      {
        authorImage: 'members.image'
      },
      {
        authorDescription: 'members.description'
      },
      {
        authorSocials: 'members.socials'
      }
    ])
    .select()
    .from('articles')
    .where('articles.id', id)
    .leftJoin('members', 'articles.authorId', 'members.id');
  query.asCallback(function (err, [article] = []) {
    if (err) return renderErrorPage(req, res, err, server);
    if (!article)
      return renderErrorPage(
        req,
        res,
        ERROR.NONEXISTENT_ENTITY(ENTITY.ARTICLE),
        server
      );

    return server.render(req, res, '/articles/crud', {
      title: 'Edit Article',
      backgroundImage: 'bg-blog.jpg',
      operation: OPERATIONS.UPDATE,
      article
    });
  });
});

module.exports = router;
