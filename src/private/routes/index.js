const async = require('async');
const sm = require('sitemap');

const path = require('path');

const accountRoutes = require('./entities/account.routes');
const articlesRoutes = require('./entities/articles.routes');
const candidateRoutes = require('./entities/candidates.routes');
const documentsRoutes = require('./entities/documents.routes');
const membersRoutes = require('./entities/members.routes');
const pagesRoutes = require('./entities/pages.routes');
const reviewsRoutes = require('./entities/reviews.routes');
const sessionsRoutes = require('./entities/sessions.routes');
const topicsRoutes = require('./entities/topics.routes');

const {
  accounts,
  domain,
  forms,
  siteDescription
} = require('../../constants/settings.js');
const knex = require('../singleton/knex').getKnex();
const server = require('../singleton/server').getServer();

module.exports = function (app) {
  
  app.use('/', [
    accountRoutes,
    articlesRoutes,
    candidateRoutes,
    documentsRoutes,
    membersRoutes,
    pagesRoutes,
    reviewsRoutes,
    sessionsRoutes,
    topicsRoutes
  ]);

  /** Home page */
  app.get(['/', '/home'], function (req, res) {
    return server.render(req, res, '/home', {
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: siteDescription,
      ogUrl: '/',
      backgroundImage: 'bg-app.jpg'
    });
  });

  app.get('/admin', (req, res) => {
    server.render(req, res, '/_auth/admin', {
      title: 'Admin Tools | #WOKEWeekly'
    });
  });

  /** Registered users page */
  app.get('/users', function (req, res) {
    return server.render(req, res, '/users', {
      title: 'Registered Users | #WOKEWeekly'
    });
  });

  /** Registration page */
  app.get('/signup', function (req, res) {
    return server.render(req, res, '/_auth/signup', {
      title: 'Sign Up | #WOKEWeekly',
      backgroundImage: 'bg-signup.jpg',
      ogUrl: '/signup'
    });
  });

  /** Unsubscribe page */
  app.get('/unsubscribe', function (req, res) {
    server.render(req, res, '/_auth/unsubscribe', {
      title: 'Unsubscribe | #WOKEWeekly'
    });
  });

  /***************************************************************
   * OTHER MEDIA
   **************************************************************/

  /** Link to Spotify */
  app.get('/podcast', function (req, res) {
    res.writeHead(301, {
      Location: accounts.spotify
    });
    res.end();
  });

  /** Subscribe to YouTube */
  app.get('/subscribe', function (req, res) {
    res.writeHead(301, {
      Location: accounts.youtube
    });
    res.end();
  });

  /** Current zoom link */
  app.get('/zoom', function (req, res) {
    res.writeHead(301, {
      Location: accounts.zoom,
      'Cache-Control': 'no-cache'
    });
    res.end();
  });

  /** Join Slack workspace link */
  app.get('/slack', function (req, res) {
    res.writeHead(301, {
      Location: accounts.slack,
      'Cache-Control': 'no-cache'
    });
    res.end();
  });

  /** Join Trello team link */
  app.get('/trello', function (req, res) {
    res.writeHead(301, {
      Location: accounts.trello,
      'Cache-Control': 'no-cache'
    });
    res.end();
  });

  /***************************************************************
   * FORMS
   **************************************************************/

  /** Recruitment Form */
  app.get('/recruitment-form', function (req, res) {
    res.writeHead(301, {
      Location: forms.recruitment
    });
    res.end();
  });

  /** Audience Review Form */
  app.get('/feedback', function (req, res) {
    res.writeHead(301, {
      Location: forms.audienceFeedback
    });
    res.end();
  });

  /** Client Review Form */
  app.get('/feedback/client', function (req, res) {
    res.writeHead(301, {
      Location: forms.clientFeedback
    });
    res.end();
  });

  /** Membership Form */
  app.get('/membership-form', function (req, res) {
    res.writeHead(301, {
      Location: forms.membership
    });
    res.end();
  });

  /***************************************************************
   * OTHER
   **************************************************************/

  /** Robots.txt page */
  app.get('/robots.txt', (req, res) =>
    res.status(200).sendFile(path.resolve('./robots.txt'), {
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      }
    })
  );

  /** Sitemap generated page */
  app.get('/sitemap.xml', (req, res) => {
    const routes = [
      '/',
      '/home',
      '/sessions',
      '/blackexcellence',
      '/team',
      '/reviews',
      '/signup'
    ];

    async.parallel(
      [
        function (callback) {
          const query = knex.select('slug').from('sessions');
          query.asCallback(function (err, result) {
            if (err) return callback(err);
            result.forEach((session) =>
              routes.push(`/sessions/${session.slug}`)
            );
            callback(null);
          });
        },
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
        function (callback) {
          const query = knex
            .select('slug')
            .from('members')
            .where('verified', 1);
          query.asCallback(function (err, result) {
            if (err) return callback(err);
            result.forEach((member) => routes.push(`/team/${member.slug}`));
            callback(null);
          });
        },
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
          res.header('Content-Type', 'application/xml');
          res.send(xml);
        });
      }
    );
  });
};
