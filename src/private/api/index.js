const ERROR = require('../errors.js');
const { verifyToken, logUserActivity } = require('../middleware.js');
const { respondToClient } = require('../response.js');
const SQL = require('../sql.js');

const sessionsRoutes = require('./routes/sessions');
const candidatesRoutes = require('./routes/candidates');
const membersRoutes = require('./routes/members');
const topicsRoutes = require('./routes/topics');
const reviewsRoutes = require('./routes/reviews');
const articlesRoutes = require('./routes/articles');
const usersRoutes = require('./routes/users');
const documentsRoutes = require('./routes/documents');

const CLEARANCES = require('../../constants/clearances.js');

module.exports = function (app, conn) {
  /** Log user activity on each request */
  app.use('/api', logUserActivity(conn));

  // sessions routes
  app.use('/api/v1/sessions', sessionsRoutes);

  // candidates routes
  app.use('/api/v1/candidates', candidatesRoutes);

  // members routes
  app.use('/api/v1/members', membersRoutes);

  // topics routes
  app.use('/api/v1/topics', topicsRoutes);

  // reviews routes
  app.use('/api/v1/reviews', reviewsRoutes);

  // articles routes
  app.use('/api/v1/articles', articlesRoutes);

  // users routes
  app.use('/api/v1/users', usersRoutes);

  // documents routes
  app.use('/api/v1/documents', documentsRoutes);

  /** Update information pages */
  app.put('/api/v1/pages', verifyToken(CLEARANCES.ACTIONS.EDIT_PAGE), function (
    req,
    res
  ) {
    const { page, text } = req.body;
    const { sql, values } = SQL.PAGES.UPDATE(page, text);

    conn.query(sql, values, function (err, result) {
      if (err) return respondToClient(res, err);
      if (result.affectedRows === 0) err = ERROR.INVALID_PAGE_NAME(page);
      respondToClient(res, err, 200);
    });
  });
};
