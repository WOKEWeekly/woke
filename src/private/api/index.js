const articlesEndpoints = require('./endpoints/articles.endpoint');
const candidatesEndpoints = require('./endpoints/candidates.endpoint');
const documentsEndpoints = require('./endpoints/documents.endpoint');
const membersEndpoints = require('./endpoints/members.endpoint');
const pagesEndpoints = require('./endpoints/pages.endpoint');
const reviewsEndpoints = require('./endpoints/reviews.endpoint');
const sessionsEndpoints = require('./endpoints/sessions.endpoint');
const subscribersEndpoints = require('./endpoints/subscribers.endpoint');
const topicsEndpoints = require('./endpoints/topics.endpoint');
const usersEndpoints = require('./endpoints/users.endpoint');

const { logUserActivity } = require('../middleware.js');
const app = require('../singleton/app').getApp();

/** Log user activity on each request */
app.use('/api', logUserActivity);

// Articles routes
app.use('/api/v1/articles', articlesEndpoints);

// Candidates routes
app.use('/api/v1/candidates', candidatesEndpoints);

// Documents routes
app.use('/api/v1/documents', documentsEndpoints);

// Members routes
app.use('/api/v1/members', membersEndpoints);

// Pages routes
app.use('/api/v1/pages', pagesEndpoints);

// Reviews routes
app.use('/api/v1/reviews', reviewsEndpoints);

// Sessions routes
app.use('/api/v1/sessions', sessionsEndpoints);

// Subscribers routes
app.use('/api/v1/subscribers', subscribersEndpoints);

// Topics routes
app.use('/api/v1/topics', topicsEndpoints);

// Users routes
app.use('/api/v1/users', usersEndpoints);
