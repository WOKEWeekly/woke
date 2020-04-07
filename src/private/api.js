const async = require('async');

const ERROR = require('./errors.js');
const filer = require('./filer.js');
const { verifyToken, validateReq, logUserActivity } = require('./middleware.js');
const { respondToClient } = require('./response.js');
const SQL = require('./sql.js');

const CLEARANCES = require('../constants/clearances.js');
const { DIRECTORY } = require('../constants/strings.js');

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
    conn.query(SQL.SESSIONS.READ.SINGLE(), id, function (err, [session]) {
      if (!session) err = ERROR.INVALID_SESSION_ID(id);
      respondToClient(res, err, 200, session);
    });
  });

  /** Get upcoming session */
  app.get('/api/v1/sessions/featured', validateReq, function(req, res){
    async.waterfall([
      function(callback){ // Get a random upcoming session
        conn.query(SQL.SESSIONS.READ.UPCOMING, function (err, [session]) {
          if (err) return callback(err);
          if (!session) return callback(null);
          callback(true, { session, upcoming: true });
        });
      },
      function(callback){ // If not, get latest session
        conn.query(SQL.SESSIONS.READ.LATEST, function (err, [session]) {
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
        conn.query(SQL.SESSIONS.READ.SINGLE('image'), id, function (err, [session]) {
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
        conn.query(SQL.SESSIONS.READ.SINGLE('image'), id, function (err, [session]) {
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
    conn.query(SQL.CANDIDATES.READ.SINGLE(), id, function (err, [candidate]) {
      if (!candidate) err = ERROR.INVALID_CANDIDATE_ID(id);
      respondToClient(res, err, 200, candidate);
    });
  });

  /** Retrieve the details of the latest candidate  */
  app.get('/api/v1/candidates/latest', validateReq, function(req, res){
    conn.query(SQL.CANDIDATES.READ.LATEST, function (err, [candidate]) {
      respondToClient(res, err, 200, candidate);
    });
  });

  /** Get random candidate */
  app.get('/api/v1/candidates/random', validateReq, function(req, res){
    conn.query(SQL.CANDIDATES.READ.RANDOM, function (err, [candidate]) {
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
        conn.query(SQL.CANDIDATES.READ.SINGLE('image'), id, function (err, [candidate]) {
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
        conn.query(SQL.CANDIDATES.READ.SINGLE('image'), id, function (err, [candidate]) {
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
    conn.query(SQL.MEMBERS.READ.SINGLE(), id, function (err, [member]) {
      if (!member) err = ERROR.INVALID_MEMBER_ID(id);
      respondToClient(res, err, 200, member);
    });
  });

  /** Retrieve a random verified member */
  app.get('/api/v1/members/random', validateReq, function(req, res){
    conn.query(SQL.MEMBERS.READ.RANDOM, function (err, [member]) {
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
        conn.query(SQL.MEMBERS.READ.SINGLE('image'), id, function (err, [member]) {
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
        conn.query(SQL.MEMBERS.READ.SINGLE('image'), id, function (err, [member]) {
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
    conn.query(SQL.TOPICS.READ.SINGLE(), id, function (err, [topic]) {
      if (!topic) err = ERROR.INVALID_TOPIC_ID(id);
      respondToClient(res, err, 200, topic);
    });
  });

  /** Retrieve a random topic */
  app.get('/api/v1/topics/random', validateReq, function(req, res){
    conn.query(SQL.TOPICS.READ.RANDOM, function (err, [topic]) {
      respondToClient(res, err, 200, topic);
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
          if (result.affectedRows === 0) err = ERROR.INVALID_TOPIC_ID(id);
          err ? callback(err) : callback(null);
        });
      },
      function(callback){ // Retrieve new topic vote counts
        conn.query(SQL.TOPICS.READ.SINGLE('yes, no'), id, function (err, [topic]) {
          err ? callback(err) : callback(null, topic);
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
      // emails.sendTopicDeletionEmail(topic);
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
    conn.query(SQL.REVIEWS.READ.SINGLE(), id, function (err, [review]) {
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
        conn.query(SQL.REVIEWS.READ.SINGLE('image'), id, function (err, [review]) {
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
        conn.query(SQL.REVIEWS.READ.SINGLE('image'), id, function (err, [review]) {
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

  /*******************************************************
   * 
   * api redesign checkpoint
   * 
   *******************************************************/

  /** Retrieve all users */
  app.get('/getRegisteredUsers', verifyToken(CLEARANCES.ACTIONS.VIEW_USERS), function(req, res){
    const sql = "SELECT id, firstname, lastname, clearance, username, email, create_time, last_active FROM user";
    conn.query(sql, function (err, result) {
      respondToClient(res, err, result);
    });
  });
  
  /** Change user's clearance */
  app.put('/changeClearance', verifyToken(CLEARANCES.ACTIONS.CRUD_USERS), function(req, res){
    const {id, clearance} = req.body;
    const sql = "UPDATE user SET clearance = ? WHERE id = ?";
    const values = [clearance, id];
    
    conn.query(sql, values, function(err){	
      respondToClient(res, err);
    });
  });

  /** Update information pages */
  app.put('/updatePage', verifyToken(CLEARANCES.ACTIONS.EDIT_INFO), function(req, res){
    const { page, text } = req.body;
    const sql = "UPDATE pages SET text = ?, last_modified = ? WHERE name = ?";
    const values = [text, new Date(), page];
    conn.query(sql, values, function (err) {
      respondToClient(res, err);
    });
  });
}