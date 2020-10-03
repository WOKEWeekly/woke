const accountRoutes = require('./entities/account.routes');
const articlesRoutes = require('./entities/articles.routes');
const candidateRoutes = require('./entities/candidates.routes');
const documentsRoutes = require('./entities/documents.routes');
const membersRoutes = require('./entities/members.routes');
const pagesRoutes = require('./entities/pages.routes');
const reviewsRoutes = require('./entities/reviews.routes');
const sessionsRoutes = require('./entities/sessions.routes');
const subscribersRoutes = require('./entities/subscribers.routes');
const topicsRoutes = require('./entities/topics.routes');
const externalForms = require('./misc/forms');
const externalLinks = require('./misc/links');
const seoResources = require('./misc/seo');

const { siteDescription } = require('../../constants/settings.js');
const knex = require('../singleton/knex').getKnex();
const server = require('../singleton/server').getServer();
const app = require('../singleton/app').getApp();

app.use('/', [
  accountRoutes,
  articlesRoutes,
  candidateRoutes,
  documentsRoutes,
  membersRoutes,
  pagesRoutes,
  reviewsRoutes,
  sessionsRoutes,
  subscribersRoutes,
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
  Promise.resolve()
    .then(() => {
      return knex.select().from('tokens').where('name', 'zoomLink');
    })
    .then(([zoomLink]) => {
      server.render(req, res, '/_auth/admin', {
        title: 'Admin Console | #WOKEWeekly',
        zoomLink: zoomLink.value
      });
    });
});

/** Registered users page */
app.get('/admin/users', function (req, res) {
  return server.render(req, res, '/users', {
    title: 'Registered Users | #WOKEWeekly'
  });
});
