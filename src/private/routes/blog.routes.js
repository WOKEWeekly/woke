const express = require('express');
const router = express.Router();

const { ENTITY } = require('../../constants/strings');
const knex = require('../setKnex').getKnex();
const ERROR = require('../errors');
const { renderErrorPage } = require('../response');
const server = require('../setServer').getServer();

/** Blog page */
router.get('/', (req, res) => {
  return server.render(req, res, '/articles', {
    title: 'The #WOKEWeekly Blog',
    description:
      'Explore the expressions of our writers who put pen to paper over the various dimensions within our community.',
    ogUrl: '/blog',
    cardImage: `public/bg/card-blog.jpg`,
    backgroundImage: 'bg-blog.jpg'
  });
});

/** Individual blog post */
router.get('/:slug', (req, res) => {
  const slug = req.params.slug;

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
    .where('articles.slug', slug)
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

    return server.render(req, res, '/articles/single', {
      title: `${article.title} | #WOKEWeekly`,
      description: article.excerpt,
      ogUrl: `/blog/${article.slug}`,
      cardImage: article.image,
      backgroundImage: 'bg-blog.jpg',
      article
    });
  });
});

module.exports = router;
