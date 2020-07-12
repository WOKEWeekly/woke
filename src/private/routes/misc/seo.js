const async = require('async');
const express = require('express');
const router = express.Router();
const sm = require('sitemap');

const path = require('path');

const { domain } = require('../../../constants/settings.js');
const knex = require('../../singleton/knex').getKnex();

/** Robots.txt page */
router.get('/robots.txt', (req, res) =>
  res.status(200).sendFile(path.resolve('./robots.txt'), {
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8'
    }
  })
);

/** Sitemap generated page */
router.get('/sitemap.xml', (req, res) => {
  const routes = [
    '/',
    '/home',
    '/sessions',
    '/blog',
    '/blackexcellence',
    '/team',
    '/reviews',
    '/signup'
  ];

  async.parallel(
    [
      // Add session pages to sitemap.
      function (callback) {
        const query = knex.select('slug').from('sessions');
        query.asCallback(function (err, result) {
          if (err) return callback(err);
          result.forEach((session) => routes.push(`/sessions/${session.slug}`));
          callback(null);
        });
      },
      // Add all candidate pages to sitemap.
      function (callback) {
        const query = knex.select('id').from('candidates');
        query.asCallback(function (err, result) {
          if (err) return callback(err);
          result.forEach((candidate) =>
            routes.push(`/blackexcellence/${candidate.id}`)
          );
          callback(null);
        });
      },
      // Add verified team member pages to sitemap.
      function (callback) {
        const query = knex.select('slug').from('members').where('verified', 1);
        query.asCallback(function (err, result) {
          if (err) return callback(err);
          result.forEach((member) => routes.push(`/team/${member.slug}`));
          callback(null);
        });
      },
      // Add blog articles to sitemap.
      function (callback) {
        const query = knex
          .select('slug')
          .from('articles')
          .where('articles.status', 'PUBLISHED');
        query.asCallback(function (err, result) {
          if (err) return callback(err);
          result.forEach((article) => routes.push(`/blog/${article.slug}`));
          callback(null);
        });
      },
      // Add all pages to sitemap.
      function (callback) {
        const query = knex.select('name').from('pages');
        query.asCallback(function (err, result) {
          if (err) return callback(err);
          result.forEach((page) => routes.push(`/${page.name}`));
          callback(null);
        });
      }
    ],
    function () {
      const sitemap = sm.createSitemap({
        hostname: domain,
        cacheTime: 10 * 60 * 1000 // 10 minutes,
      });

      routes.forEach((route) => {
        sitemap.add({
          url: route,
          changefreq: 'weekly'
        });
      });

      sitemap.toXML(function (err, xml) {
        if (err) return res.status(500).end();
        res.header('Content-Type', 'text/xml');
        res.send(xml);
      });
    }
  );
});

module.exports = router;
