const accountRoutes = require('./entities/account.routes');
const articlesRoutes = require('./entities/articles.routes');
const candidateRoutes = require('./entities/candidates.routes');
const documentsRoutes = require('./entities/documents.routes');
const membersRoutes = require('./entities/members.routes');
const pagesRoutes = require('./entities/pages.routes');
const reviewsRoutes = require('./entities/reviews.routes');
const sessionsRoutes = require('./entities/sessions.routes');
const topicsRoutes = require('./entities/topics.routes');
const externalForms = require('./misc/forms');
const externalLinks = require('./misc/links');
const seoResources = require('./misc/seo');

const { siteDescription } = require('../../constants/settings.js');
const server = require('../singleton/server').getServer();

module.exports = (app) => {
  app.use('/', [
    accountRoutes,
    articlesRoutes,
    candidateRoutes,
    documentsRoutes,
    membersRoutes,
    pagesRoutes,
    reviewsRoutes,
    sessionsRoutes,
    topicsRoutes,

    externalForms,
    externalLinks,
    seoResources
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
  app.get('/admin/users', function (req, res) {
    return server.render(req, res, '/users', {
      title: 'Registered Users | #WOKEWeekly'
    });
  });
};
