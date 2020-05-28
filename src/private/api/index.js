const articlesRoutes = require('./routes/articles.route');
const candidatesRoutes = require('./routes/candidates.route');
const documentsRoutes = require('./routes/documents.route');
const membersRoutes = require('./routes/members.route');
const pagesRoutes = require('./routes/pages.route');
const reviewsRoutes = require('./routes/reviews.route');
const sessionsRoutes = require('./routes/sessions.route');
const topicsRoutes = require('./routes/topics.route');
const usersRoutes = require('./routes/users.route');

const { logUserActivity } = require('../middleware.js');

module.exports = function (app) {
  /** Log user activity on each request */
  app.use('/api', logUserActivity);

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

  // Topics routes
  app.use('/api/v1/topics', topicsRoutes);

  // Users routes
  app.use('/api/v1/users', usersRoutes);
};
