const async = require('async');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require("email-validator");

const Mailchimp = require('mailchimp-api-v3');
const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);

const emails = require('./emails.js');
const ERROR = require('./errors.js');
const filer = require('./filer.js');
const { verifyToken, validateReq, logUserActivity } = require('./middleware.js');
const { respondToClient } = require('./response.js');
const SQL = require('./sql.js');

const CLEARANCES = require('../constants/clearances.js');
const { DIRECTORY } = require('../constants/strings.js');

const noEmails = false;
if (noEmails) console.warn("Emails are turned off.");

module.exports = function(app, conn){

  /** Log user activity on each request */
  app.use('/api', logUserActivity(conn));

  /** Retrieve all sessions */
  app.get('/api/v1/sessions', validateReq, function(req, res){
    conn.query(SQL.SESSIONS.READ.ALL, function (err, sessions) {
      respondToClient(res, err, 200, sessions);
    });
  });

  /** Retrieve individual session */
  app.get('/api/v1/sessions/:id([0-9]+)', validateReq, function(req, res){
    const id = req.params.id;
    conn.query(SQL.SESSIONS.READ.SINGLE('id'), id, function (err, [session] = []) {
      if (err) return respondToClient(res, err);
      if (!session) err = ERROR.INVALID_SESSION_ID(id);
      respondToClient(res, err, 200, session);
    });
  });

  /** Get upcoming session */
  app.get('/api/v1/sessions/featured', validateReq, function(req, res){
    async.waterfall([
      function(callback){ // Get a random upcoming session
        conn.query(SQL.SESSIONS.READ.UPCOMING, function (err, [session] = []) {
          if (err) return callback(err);
          if (!session) return callback(null);
          callback(true, { session, upcoming: true });
        });
      },
      function(callback){ // If not, get latest session
        conn.query(SQL.SESSIONS.READ.LATEST, function (err, [session] = []) {
          if (err) return callback(err);
          if (!session) return callback(null);
          callback(null, { session, upcoming: false });
        });
      }
    ], function(err, session){
      respondToClient(res, err, 200, session);
    });
  });

  /** Add new session to database */
  app.post('/api/v1/sessions', verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS), function(req, res){
    const session = req.body;

    async.waterfall([
      function(callback){ // Upload image to cloud
        filer.uploadImage(session, DIRECTORY.SESSIONS, true, callback);
      },
      function(session, callback){ // Add session to database
        const { sql, values } = SQL.SESSIONS.CREATE(session);
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ], function(err, id){
      respondToClient(res, err, 201, { id });
    });
  });

  /** Update details of existing session in database */
  app.put('/api/v1/sessions/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS), function(req, res){
    const id = req.params.id;
    const { session, changed } = req.body;

    async.waterfall([
      function(callback){ // Delete old image if changed.
        conn.query(SQL.SESSIONS.READ.SINGLE('id', 'image'), id, function (err, [session] = []) {
          if (err) return callback(err);
          if (!session) return callback(ERROR.INVALID_SESSION_ID(id));
          if (!changed) return callback(null);
          filer.destroyImage(session.image, callback);
        });
      },
      function(callback){ // Equally, upload new image if changed
        filer.uploadImage(session, DIRECTORY.SESSIONS, changed, callback);
      },
      function(session, callback){ // Update session in database
        const { sql, values } = SQL.SESSIONS.UPDATE(id, session, changed);
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null, session.slug);
        });
      }
    ], function(err, slug){
      respondToClient(res, err, 200, { slug });
    });
  });

  /** Delete an existing session from database */
  app.delete('/api/v1/sessions/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS), function(req, res){
    const id = req.params.id;

    async.waterfall([
      function(callback){ // Delete image from cloud
        conn.query(SQL.SESSIONS.READ.SINGLE('id', 'image'), id, function (err, [session] = []) {
          if (err) return callback(err);
          if (!session) return callback(ERROR.INVALID_SESSION_ID(id));
          filer.destroyImage(session.image, callback);
        });
      },
      function(callback){ // Delete session from database
        conn.query(SQL.SESSIONS.DELETE, id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 204);
    });
  });

  /** Retrieve all candidates */
  app.get('/api/v1/candidates', validateReq, function(req, res){
    conn.query(SQL.CANDIDATES.READ.ALL, function (err, candidates) {
      respondToClient(res, err, 200, candidates);
    });
  });

  /** Retrieve individual candidate */
  app.get('/api/v1/candidates/:id([0-9]+)', validateReq, function(req, res){
    const id = req.params.id;
    conn.query(SQL.CANDIDATES.READ.SINGLE(), id, function (err, [candidate] = []) {
      if (err) return respondToClient(res, err);
      if (!candidate) err = ERROR.INVALID_CANDIDATE_ID(id);
      respondToClient(res, err, 200, candidate);
    });
  });

  /** Retrieve the details of the latest candidate  */
  app.get('/api/v1/candidates/latest', validateReq, function(req, res){
    conn.query(SQL.CANDIDATES.READ.LATEST, function (err, [candidate] = []) {
      respondToClient(res, err, 200, candidate);
    });
  });

  /** Get random candidate */
  app.get('/api/v1/candidates/random', validateReq, function(req, res){
    conn.query(SQL.CANDIDATES.READ.RANDOM, function (err, [candidate] = []) {
      respondToClient(res, err, 200, candidate);
    });
  });

  /** Add new candidate to database */
  app.post('/api/v1/candidates', verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX), function(req, res){
    const candidate = req.body;

    async.waterfall([
      function(callback){ // Upload image to cloud
        filer.uploadImage(candidate, DIRECTORY.BLACKEXCELLENCE, true, callback);
      },
      function(candidate, callback){ // Add candidate to database
        const { sql, values } = SQL.CANDIDATES.CREATE(candidate);
        conn.query(sql, [values], function (err) {
          if (err){
            if (err.errno === 1062) err = ERROR.DUPLICATE_CANDIDATE_ID(candidate.id);
            callback(err);
          } else {
            callback(null);
          }
        });
      }
    ], function(err){
      respondToClient(res, err, 201);
    });
  });

  /** Update details of existing candidate in database */
  app.put('/api/v1/candidates/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX), function(req, res){
    const id = req.params.id;
    const { candidate, changed } = req.body;

    async.waterfall([
      function(callback){ // Delete original image from cloud
        conn.query(SQL.CANDIDATES.READ.SINGLE('image'), id, function (err, [candidate] = []) {
          if (err) return callback(err);
          if (!candidate) return callback(ERROR.INVALID_CANDIDATE_ID(id));
          if (!changed) return callback(null);
          filer.destroyImage(candidate.image, callback);
        });
      },
      function(callback){ // Equally, upload new image if changed
        filer.uploadImage(candidate, DIRECTORY.BLACKEXCELLENCE, changed, callback);
      },
      function(candidate, callback){ // Update candidate in database
        const { sql, values } = SQL.CANDIDATES.UPDATE(id, candidate, changed);
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 200);
    });
  });

  /** Delete an existing candidate from database */
  app.delete('/api/v1/candidates/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX), function(req, res){
    const id = req.params.id;

    async.waterfall([
      function(callback){ // Delete image from cloud
        conn.query(SQL.CANDIDATES.READ.SINGLE('image'), id, function (err, [candidate] = []) {
          if (err) return callback(err);
          if (!candidate) return callback(ERROR.INVALID_CANDIDATE_ID(id));
          filer.destroyImage(candidate.image, callback);
        });
      },
      function(callback){ // Delete candidate from database
        conn.query(SQL.CANDIDATES.DELETE, id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 204);
    });
  });

  /** Retrieve all team members */
  app.get('/api/v1/members', verifyToken(CLEARANCES.ACTIONS.VIEW_TEAM), function(req, res){
    conn.query(SQL.MEMBERS.READ.ALL(), function (err, members) {
      respondToClient(res, err, 200, members);
    });
  });

  /** Retrieve individual member */
  app.get('/api/v1/members/:id([0-9]+)', validateReq, function(req, res){
    const id = req.params.id;
    conn.query(SQL.MEMBERS.READ.SINGLE(), id, function (err, [member] = []) {
      if (err) return respondToClient(res, err);
      if (!member) err = ERROR.INVALID_MEMBER_ID(id);
      respondToClient(res, err, 200, member);
    });
  });

  /** Retrieve a random verified member */
  app.get('/api/v1/members/random', validateReq, function(req, res){
    conn.query(SQL.MEMBERS.READ.RANDOM, function (err, [member] = []) {
      respondToClient(res, err, 200, member);
    });
  });

  /** Retrieve the IDs, first names and surnames of team members */
  app.get('/api/v1/members/names', validateReq, function(req, res){
    const sql = SQL.MEMBERS.READ.ALL('id, firstname, lastname');
    conn.query(sql, function (err, members) {
      respondToClient(res, err, 200, members);
    });
  });

  /** Retrieve only executive team members */
  app.get('/api/v1/members/executives', validateReq, function(req, res){
    conn.query(SQL.MEMBERS.READ.EXECUTIVES, function (err, executives) {
      respondToClient(res, err, 200, executives);
    });
  });

  /** Add new team member to database */
  app.post('/api/v1/members', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    const member = req.body;

    async.waterfall([
      function(callback){ // Upload image to cloud
        filer.uploadImage(member, DIRECTORY.TEAM, true, callback);
      },
      function(member, callback){ // Add member to database
        const { sql, values } = SQL.MEMBERS.CREATE(member);
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ], function(err, id){
      respondToClient(res, err, 201, { id });
    });
  });

  /** Update details of existing team member in database */
  app.put('/api/v1/members/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    const id = req.params.id;
    const { member, changed } = req.body;

    async.waterfall([
      function(callback){ // Delete old image if changed.
        conn.query(SQL.MEMBERS.READ.SINGLE('image'), id, function (err, [member] = []) {
          if (err) return callback(err);
          if (!member) return callback(ERROR.INVALID_MEMBER_ID(id));
          if (!changed) return callback(null);
          filer.destroyImage(member.image, callback);
        });
      },
      function(callback){ // Equally, upload new image if changed
        filer.uploadImage(member, DIRECTORY.TEAM, changed, callback);
      },
      function(member, callback){ // Update member in database
        const { sql, values } = SQL.MEMBERS.UPDATE(id, member, changed);
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null, member.slug);
        });
      }
    ], function(err, slug){
      respondToClient(res, err, 200, { slug });
    });
  });

  /** Delete an existing team member from database */
  app.delete('/api/v1/members/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    const id = req.params.id;

    async.waterfall([
      function(callback){ // Delete image from cloud
        conn.query(SQL.MEMBERS.READ.SINGLE('image'), id, function (err, [member] = []) {
          if (err) return callback(err);
          if (!member) return callback(ERROR.INVALID_MEMBER_ID(id));
          filer.destroyImage(member.image, callback);
        });
      },
      function(callback){ // Delete member from database
        conn.query(SQL.MEMBERS.DELETE, id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 204);
    });
  });

  /** Retrieve all topics */
  app.get('/api/v1/topics', verifyToken(CLEARANCES.ACTIONS.VIEW_TOPICS), function(req, res){
    conn.query(SQL.TOPICS.READ.ALL(), function (err, topics) {
      respondToClient(res, err, 200, topics)
    });
  });

  /** Retrieve individual topic */
  app.get('/api/v1/topics/:id([0-9]+)', validateReq, function(req, res){
    const id = req.params.id;
    conn.query(SQL.TOPICS.READ.SINGLE(), id, function (err, [topic] = []) {
      if (err) return respondToClient(res, err);
      if (!topic) err = ERROR.INVALID_TOPIC_ID(id);
      respondToClient(res, err, 200, topic);
    });
  });

  /** Retrieve a random topic */
  app.get('/api/v1/topics/random', validateReq, function(req, res){
    conn.query(SQL.TOPICS.READ.RANDOM, function (err, [topic] = []) {
      respondToClient(res, err, 200, topic);
    });
  });

  /** Generate Topic Bank access token */
  app.get('/api/v1/topics/token', verifyToken(CLEARANCES.ACTIONS.GENERATE_NEW_TOKEN), function(req, res){
    const { sql, values, token } = SQL.TOPICS.READ.REGENERATE_TOKEN();
    conn.query(sql, values, function(err){	
      respondToClient(res, err, 200, { token });
    });
  });

  /** Add new topic to database */
  app.post('/api/v1/topics', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const topic = req.body;
    const { sql, values } = SQL.TOPICS.CREATE(topic);
    conn.query(sql, [values], function (err, result) {
      respondToClient(res, err, 201, { id: result.insertId});
    });
  });

  /** Update topic in database */
  app.put('/api/v1/topics/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const id = req.params.id;
    const topic = req.body;

    const { sql, values } = SQL.TOPICS.UPDATE.DETAILS(id, topic);
    conn.query(sql, values, function (err, result) {
      if (err) return respondToClient(res, err);
      if (result.affectedRows === 0) err = ERROR.INVALID_TOPIC_ID(id);
      respondToClient(res, err, 200);
    });
  });

  /** Increment the vote of a topic */
  app.put('/api/v1/topics/:id/vote/:option(yes|no)', validateReq, function(req, res){
    const { id, option } = req.params;
    async.waterfall([
      function(callback){ // Increment vote
        conn.query(SQL.TOPICS.UPDATE.VOTE(id, option), function (err, result) {
          if (err) return respondToClient(res, err);
          if (result.affectedRows === 0) err = ERROR.INVALID_TOPIC_ID(id);
          err ? callback(err) : callback(null);
        });
      },
      function(callback){ // Retrieve new topic vote counts
        conn.query(SQL.TOPICS.READ.SINGLE('yes, no'), id, function (err, [votes] = []) {
          err ? callback(err) : callback(null, votes);
        });
      },
    ], function(err, votes){
      respondToClient(res, err, 200, { ...votes });
    });
  });

  /** Delete an existing topic from database */
  app.delete('/api/v1/topics/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const id = req.params.id;
    conn.query(SQL.TOPICS.DELETE, id, function (err, result) {
      // TODO: Slack notifications for deleted topics
      if (err) return respondToClient(res, err);
      if (result.affectedRows === 0) err = ERROR.INVALID_TOPIC_ID(id);
      respondToClient(res, err, 204);
    });
  });

  /** Retrieve all reviews */
  app.get('/api/v1/reviews', validateReq, function(req, res){
    const sql = SQL.REVIEWS.READ.ALL();
    conn.query(sql, function (err, reviews) {
      respondToClient(res, err, 200, reviews);
    });
  });

  /** Retrieve individual review */
  app.get('/api/v1/reviews/:id([0-9]+)', validateReq, function(req, res){
    const id = req.params.id;
    conn.query(SQL.REVIEWS.READ.SINGLE(), id, function (err, [review] = []) {
      if (err) return respondToClient(res, err);
      if (!review) err = ERROR.INVALID_REVIEW_ID(id);
      respondToClient(res, err, 200, review);
    });
  });

  /** Retrieve 3 5-star reviews with images */
  app.get('/api/v1/reviews/featured', validateReq, function(req, res){
    conn.query(SQL.REVIEWS.READ.FEATURED, function (err, reviews) {
      respondToClient(res, err, 200, reviews);
    });
  });

  /** Add new review to database */
  app.post('/api/v1/reviews', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    const review = req.body;

    async.waterfall([
      function(callback){ // Upload image to cloud
        filer.uploadImage(review, DIRECTORY.REVIEWS, true, callback);
      },
      function(review, callback){ // Add review to database
        const { sql, values } = SQL.REVIEWS.CREATE(review);
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ], function(err, id){
      respondToClient(res, err, 201, { id });
    });
  });

  /** Update details of existing review in database */
  app.put('/api/v1/reviews/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    const id = req.params.id;
    const { review, changed } = req.body;

    async.waterfall([
      function(callback){ // Delete old image if changed.
        conn.query(SQL.REVIEWS.READ.SINGLE('image'), id, function (err, [review] = []) {
          if (err) return callback(err);
          if (!review) return callback(ERROR.INVALID_REVIEW_ID(id));
          if (!changed) return callback(null);
          filer.destroyImage(review.image, callback);
        });
      },
      function(callback){ // Equally, upload new image if changed
        filer.uploadImage(review, DIRECTORY.REVIEWS, changed, callback);
      },
      function(review, callback){ // Update review in database
        const { sql, values } = SQL.REVIEWS.UPDATE(id, review, changed);
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 200);
    });
  });

  /** Delete an existing review from database */
  app.delete('/api/v1/reviews/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    const id = req.params.id;

    async.waterfall([
      function(callback){ // Delete image from cloud
        conn.query(SQL.REVIEWS.READ.SINGLE('image'), id, function (err, [review] = []) {
          if (err) return callback(err);
          if (!review) return callback(ERROR.INVALID_REVIEW_ID(id));
          filer.destroyImage(review.image, callback);
        });
      },
      function(callback){ // Delete review from database
        conn.query(SQL.REVIEWS.DELETE, id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 204);
    });
  });

  /** Retrieve all articles */
  app.get('/api/v1/articles', verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES), function(req, res){
    const sql = SQL.ARTICLES.READ.ALL();
    conn.query(sql, function (err, articles) {
      respondToClient(res, err, 200, articles);
    });
  });

  /** Retrieve only published articles */
  app.get('/api/v1/articles/published', validateReq, function(req, res){
    const sql = SQL.ARTICLES.READ.PUBLISHED();
    conn.query(sql, function (err, articles) {
      respondToClient(res, err, 200, articles);
    });
  });

  /** Retrieve individual article */
  app.get('/api/v1/articles/:id([0-9]+)', validateReq, function(req, res){
    const id = req.params.id;
    conn.query(SQL.ARTICLES.READ.SINGLE('id'), id, function (err, [article] = []) {
      if (err) return respondToClient(res, err);
      if (!article) err = ERROR.INVALID_ARTICLE_ID(id);
      respondToClient(res, err, 200, article);
    });
  });

  /** Add new article to database */
  app.post('/api/v1/articles', verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES), function(req, res){
    const article = req.body;

    async.waterfall([
      function(callback){ // Upload image to cloud
        filer.uploadImage(article, DIRECTORY.ARTICLES, true, callback);
      },
      function(article, callback){ // Add article to database
        const { sql, values } = SQL.ARTICLES.CREATE(article);
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ], function(err, id){
      respondToClient(res, err, 201, { id });
    });
  });

  /** Update details of existing articles in database */
  app.put('/api/v1/articles/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES), function(req, res){
    const id = req.params.id;
    const { article, changed } = req.body;

    async.waterfall([
      function(callback){ // Delete old image if changed.
        conn.query(SQL.ARTICLES.READ.SINGLE('id', 'image'), id, function (err, [article] = []) {
          if (err) return callback(err);
          if (!article) return callback(ERROR.INVALID_ARTICLE_ID(id));
          if (!changed) return callback(null);
          filer.destroyImage(article.image, callback);
        });
      },
      function(callback){ // Equally, upload new image if changed
        filer.uploadImage(article, DIRECTORY.ARTICLES, changed, callback);
      },
      function(article, callback){ // Update review in database
        const { sql, values } = SQL.ARTICLES.UPDATE(id, article, changed);
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null, article.slug);
        });
      }
    ], function(err, slug){
      respondToClient(res, err, 200, { slug });
    });
  });

  /** Delete an existing article from database */
  app.delete('/api/v1/articles/:id', verifyToken(CLEARANCES.ACTIONS.CRUD_ARTICLES), function(req, res){
    const id = req.params.id;

    async.waterfall([
      function(callback){ // Delete image from cloud
        conn.query(SQL.ARTICLES.READ.SINGLE('id', 'image'), id, function (err, [article] = []) {
          if (err) return callback(err);
          if (!article) return callback(ERROR.INVALID_ARTICLE_ID(id));
          filer.destroyImage(article.image, callback);
        });
      },
      function(callback){ // Delete article from database
        conn.query(SQL.ARTICLES.DELETE, id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 204);
    });
  });

  /** Retrieve all users */
  app.get('/api/v1/users', verifyToken(CLEARANCES.ACTIONS.VIEW_USERS), function(req, res){
    const sql = SQL.USERS.READ.ALL("id, firstname, lastname, clearance, username, email, create_time, last_active");
    conn.query(sql, function (err, users) {
      respondToClient(res, err, 200, users);
    });
  });

  /** Retrieve individual user */
  app.get('/api/v1/users/:id', validateReq, function(req, res){
    // TODO: Differentiate between self-reading and admin-reading.
    const id = req.params.id;
    const sql = SQL.USERS.READ.SINGLE("id, firstname, lastname, clearance, username, email, create_time, last_active");

    conn.query(sql, id, function (err, [user] = []) {
      if (err) return respondToClient(res, err);
      if (!user) err = ERROR.INVALID_USER_ID(id);
      respondToClient(res, err, 200, user);
    });
  });

  /** Add or register a new user */
  app.post('/api/v1/users', validateReq, function(req, res){
    const { firstname, lastname, email, username, password1, password2, subscribe} = req.body;
    
    if (!validator.validate(email)) return respondToClient(res, ERROR.INVALID_EMAIL_ADDRESS());
    if (password1 !== password2) return respondToClient(res, ERROR.PASSWORD_MISMATCH());
    
    async.waterfall([
      function(callback){  /** Hash entered password */
        bcrypt.hash(password1, 8, function(err, hash) {
          err ? callback(err) : callback(null, hash);
        });
      },
      function(hash, callback){ /** Insert new user into database */
        const { sql, values } = SQL.USERS.CREATE(req.body, hash);
        conn.query(sql, [values], function(err, result){	
          if (err) return callback(err);
          
          const user = {
            id: result.insertId,
            firstname, lastname, username, email,
            clearance: 1
          };
          
          // Subscribe user to mailing list if allowed
          if (subscribe) subscribeUserToMailingList(user);
          callback(null, user);
        });
      },
      function(user, callback){ // Generate verification token to be sent via email
        jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
          if (err) return callback(err);
          if (!noEmails) emails().sendWelcomeEmail(user, token);
          callback(null, user)
        });
      },
      function(user, callback){ // Pass authenticated user information to client with access token
        jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
          if (err) return callback(err);
          callback(null, {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            clearance: user.clearance,
            username: user.username,
            email: user.email,
            token
          });
        });
      }
    ], function(err, user){
      if (err && err.code === ERROR.SQL_DUP_CODE){
        if (err.sqlMessage.includes("email")){
          err = ERROR.DUPLICATE_EMAIL_ADDRESS();
        } else if (err.sqlMessage.includes("username")){
          err = ERROR.DUPLICATE_USERNAME();
        }
      }
      respondToClient(res, err, 201, user);
    });
  });

  /* Log in / authenticate user */
  app.post('/api/v1/users/login', validateReq, function(req, res){
    const { username, password, remember } = req.body;

    async.waterfall([
      function(callback){ // Attempt to retrieve user
        const { sql, values } = SQL.USERS.READ.LOGIN(username);
        conn.query(sql, values, function(err, [user] = []){
          if (err) return callback(err);
          if (!user) return callback(ERROR.NONEXISTENT_CREDENTIALS());

          const passwordIsIncorrect = !bcrypt.compareSync(password, user.password) && !(user.password == password);
          if(passwordIsIncorrect) return callback(ERROR.NONEXISTENT_CREDENTIALS());
          
          callback(null, user);
        });
      },
      function(user, callback){ // Assign access token to user
        jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: remember ? '30d' : '2h' }, (err, token) => {
          if (err) return callback(err);
          user.token = token;
          callback(null, user);
        });
      }
    ], function(err, user){
      respondToClient(res, err, 200, user);
    });
  });

  /** Change user's username in database */
  app.put('/api/v1/users/:id/username', verifyToken(CLEARANCES.ACTIONS.CHANGE_ACCOUNT), function(req, res){
    const { id } = req.params;
    const { username } = req.body;

    const { sql, values } = SQL.USERS.UPDATE('username', id, username);
    conn.query(sql, values, function(err, result){
      if (err){
        const duplicateUsername = err.code === ERROR.SQL_DUP_CODE && err.sqlMessage.includes("username");
        if (duplicateUsername) return respondToClient(res, ERROR.DUPLICATE_USERNAME());
        return respondToClient(res, err);
      }
      if (result.affectedRows === 0) return respondToClient(res, ERROR.INVALID_USER_ID(id));

      respondToClient(res, err, 200);
    });
  });

  /** Change user's password in database */
  app.put('/api/v1/users/:id/password', verifyToken(CLEARANCES.ACTIONS.CHANGE_ACCOUNT), function(req, res){
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    async.waterfall([
      function(callback){ // Get current password of user
        conn.query(SQL.USERS.READ.SINGLE(), id, function(err, [user] = []){
          if (err) return callback(err);
          if (!user) return callback(ERROR.INVALID_USER_ID(id));
          callback(null, user.password);
        });
      },
      function(password, callback){ // Verify that current password is valid
        if (!(bcrypt.compareSync(oldPassword, password) || oldPassword === password)) {
          callback(ERROR.INCORRECT_PASSWORD());
        } else {
          callback(null);
        } 
      },
      function(callback){ // Hash new password
        bcrypt.hash(newPassword, 8, function(err, hash) {
          err ? callback(err) : callback(null, hash);
        });
      },
      function(hash, callback){ // Store new hashed password
        const { sql, values } = SQL.USERS.UPDATE('password', id, hash);
        conn.query(sql, values, function(err){
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 200);
    });
  });

  /** Change user's clearance */
  app.put('/api/v1/users/:id/clearance/:value', verifyToken(CLEARANCES.ACTIONS.CRUD_USERS), function(req, res){
    const { id, value } = req.params;
    const { sql, values } = SQL.USERS.UPDATE('clearance', id, value);
    conn.query(sql, values, function(err){	
      respondToClient(res, err, 200);
    });
  });

  /** Delete a user */
  app.delete('/api/v1/users/:id', verifyToken(CLEARANCES.ACTIONS.DELETE_ACCOUNT), function(req, res){
    // TODO: Differentiate between self-deletion and admin-deletion.
    const id = req.params.id;
    conn.query(SQL.USERS.DELETE, id, function(err, result){	
      if (err) return respondToClient(res, err);
      if (result.affectedRows === 0) err = ERROR.INVALID_USER_ID(id);
      respondToClient(res, err, 204);
    });
  });

  /** Clear added users */
  app.purge('/api/v1/users', verifyToken(9), function(req, res){
    if (process.env.NODE_ENV === 'production') return respondToClient(res, ERROR.UNAUTHORIZED_REQUEST());
    conn.query(SQL.USERS.CLEAR, function(err){
      respondToClient(res, err, 204);
    });
  });

  /** Resend the verification email to user's email address */
  app.notify('/api/v1/users/:id/email/verify', validateReq, function(req, res){
    const { id } = req.params;
    
    async.waterfall([
      function(callback){ // Retrieve user from database
        const sql = SQL.USERS.READ.SINGLE('id, firstname, lastname, clearance, username, email');
        conn.query(sql, id, function(err, [user] = []){
          if (err) return callback(err);
          if (!user) return callback(ERROR.INVALID_USER_ID());
          callback(null, user);
        });
      },
      function(user, callback){ // Generate verification token to send via email
        jwt.sign({user}, process.env.JWT_SECRET, { expiresIn: '30m' }, (err, token) => {
          if (err) return callback(err);
          if (noEmails) return callback(null, {token});
          emails(callback, [{token}]).resendVerificationEmail(user, token);
        });
      },
    ], function(err, token){
      respondToClient(res, err, 200, token);
    });
  });

  /** Verify a user's account */
  app.patch('/api/v1/users/:token/verify', function(req, res){
    const { token } = req.params;
    
    async.waterfall([
      function(callback){ // Verify the given token
        jwt.verify(token, process.env.JWT_SECRET, (err, {user} = {}) => {
          err ? callback(err) : callback(null, user);
        });
      },
      function(user, callback){ // Change user's clearance to indicate verification
        if (user.clearance > 1) return callback(ERROR.VERIFICATION_NOT_REQUIRED());
        const { sql, values } = SQL.USERS.UPDATE('clearance', user.id, 2)
        conn.query(sql, values, function(err){
          if (err) return callback(err);
          user.clearance = 2;
          callback(null, user);
        });
      }
    ], function(err, user){
      respondToClient(res, err, 200, user);

      // TODO: Review when doing routes
      // err ? renderErrorPage(req, res, err, server) : res.redirect(`/account?verified=${token}`);
    });
  });

  /** Send account recovery email */
  app.notify('/api/v1/users/recovery', validateReq, function(req, res){
    const { email } = req.body;
    
    async.waterfall([
      function(callback){ // Retrieve user using email address
        const sql = SQL.USERS.READ.RECOVERY('id, firstname, lastname, clearance, email, username');
        conn.query(sql, email, function(err, [user] = []){
          if (err) return callback(err);
          if (!user) return callback(ERROR.NONEXISTENT_EMAIL_ADDRESS());
          callback(null, user);
        });
      },
      function(user, callback){ // Generate recovery token to be sent via email
        jwt.sign({user}, process.env.JWT_SECRET, { expiresIn: '30m'}, (err, token) => {
          if (err) return callback(err);
          if (noEmails) return callback(null, {token});
          emails(callback, [{token}]).sendAccountRecoveryEmail(user, token);
        });
      },
    ], function(err, token){
      respondToClient(res, err, 200, token);
    });
  });

  /** Change a user's password from reset */
  app.patch('/api/v1/users/password/reset', function(req, res){
    const { token, password } = req.body;
    
    async.waterfall([
      function(callback){ // Verify the given token
        jwt.verify(token, process.env.JWT_SECRET, (err, {user}) => {
          err ? callback(err) : callback(null, user);
        });
      },
      function(user, callback){ // Hash new password
        bcrypt.hash(password, 8, function(err, hash) {
          err ? callback(err) : callback(null, user.id, hash);
        });
      },
      function(id, hash, callback){ // Update user's password in database
        const { sql, values } = SQL.USERS.UPDATE('password', id, hash)
        conn.query(sql, values, function(err, result){
          if (err) return callback(err);
          if (result.affectedRows === 0) err = ERROR.INVALID_USER_ID(id);
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, 200);
    });
  });

  /** Update information pages */
  app.put('/api/v1/pages', verifyToken(CLEARANCES.ACTIONS.EDIT_PAGE), function(req, res){
    const { page, text } = req.body;
    const { sql, values } = SQL.PAGES.UPDATE(page, text);

    conn.query(sql, values, function (err, result) {
      if (err) return respondToClient(res, err);
      if (result.affectedRows === 0) err = ERROR.INVALID_PAGE_NAME(page);
      respondToClient(res, err, 200);
    });
  });
}

/** Subscribe new user to Mailchimp mailing list */
const subscribeUserToMailingList = (user) => {
  mailchimp.post(`/lists/${process.env.MAILCHIMP_LISTID}/members`, {
    email_address: user.email,
    status: 'subscribed',
    merge_fields: {
      FNAME: user.firstname,
      LNAME: user.lastname
    }
  })
  .then(results => console.log(results))
  .catch(err => console.log(err.toString()));
}