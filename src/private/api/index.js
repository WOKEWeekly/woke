const articlesRoutes = require('./endpoints/articles.endpoint');
const candidatesRoutes = require('./endpoints/candidates.endpoint');
const documentsRoutes = require('./endpoints/documents.endpoint');
const membersRoutes = require('./endpoints/members.endpoint');
const pagesRoutes = require('./endpoints/pages.endpoint');
const reviewsRoutes = require('./endpoints/reviews.endpoint');
const sessionsRoutes = require('./endpoints/sessions.endpoint');
const subscribersRoutes = require('./endpoints/subscribers.endpoint');
const topicsRoutes = require('./endpoints/topics.endpoint');
const usersRoutes = require('./endpoints/users.endpoint');

const { logUserActivity } = require('../middleware.js');

module.exports = function (app, knex) {
  /** Log user activity on each request */
  app.use('/api', logUserActivity(knex));

  // Articles routes
  app.use('/api/v1/articles', articlesRoutes);

  // Candidates routes
  app.use('/api/v1/candidates', candidatesRoutes);

  // Documents routes
  app.use('/api/v1/documents', documentsRoutes);

  // Members routes
  app.use('/api/v1/members', membersRoutes);

  // Pages routes
  app.use('/api/v1/pages', pagesRoutes);

  // Reviews routes
  app.use('/api/v1/reviews', reviewsRoutes);

  // Sessions routes
  app.use('/api/v1/sessions', sessionsRoutes);

  // Subscribers routes
  app.use('/api/v1/subscribers', subscribersRoutes);

  // Topics routes
  app.use('/api/v1/topics', topicsRoutes);

  // Users routes
  app.use('/api/v1/users', usersRoutes);
};
