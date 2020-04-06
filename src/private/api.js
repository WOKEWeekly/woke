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
  app.get('/api/v1/members/soft', validateReq, function(req, res){
    const sql = SQL.MEMBERS.READ.ALL('id, firstname, lastname');
    conn.query(sql, function (err, result) {
      respondToClient(res, err, 200, result);
    });
  });

  /*******************************************************
   * 
   * api redesign checkpoint
   * 
   *******************************************************/

  /** Retrieve all topics */
  app.get('/getTopics', verifyToken(CLEARANCES.ACTIONS.VIEW_TOPICS), function(req, res){
    conn.query("SELECT * FROM topics", function (err, result) {
      respondToClient(res, err, result)
    });
  });

  /** Add new topic to database */
  app.post('/addTopic', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const topic = req.body;
    const sql = "INSERT INTO topics (headline, category, question, description, type, polarity, validated, sensitivity, option1, option2, user_id) VALUES ?";
    const values = [[topic.headline, topic.category, topic.question, topic.description, topic.type,
      topic.polarity, topic.validated, topic.sensitivity, topic.option1, topic.option2, topic.userId]];
    
    conn.query(sql, [values], function (err, result) {
      respondToClient(res, err, result.insertId);
    });
  });

  /** Update topic in database */
  app.put('/updateTopic', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const topic = req.body;
    const sql = `UPDATE topics SET headline = ?, category = ?, question = ?, description = ?, type = ?, polarity = ?, validated = ?, sensitivity = ?, option1 = ?, option2 = ? WHERE id = ?`;
    const values = [topic.headline, topic.category, topic.question, topic.description, topic.type,
      topic.polarity, topic.validated, topic.sensitivity, topic.option1, topic.option2, topic.id];
    
    conn.query(sql, values, function (err) {
      respondToClient(res, err);
    });
  });

  /** Delete an existing topic from database */
  app.delete('/deleteTopic', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const topic = req.body;
    const sql = "DELETE FROM topics WHERE id = ?";
    
    conn.query(sql, topic.id, function (err) {
      // emails.sendTopicDeletionEmail(topic);
      respondToClient(res, err);
    });
  });

  /** Retrieve all team members */
  app.get('/getTeam', verifyToken(CLEARANCES.ACTIONS.VIEW_TEAM), function(req, res){
    conn.query("SELECT * FROM members", function (err, result) {
      respondToClient(res, err, 200, result);
    });
  });

  /** Retrieve only executive team members */
  app.get('/getExec', validateReq, function(req, res){
    conn.query("SELECT * FROM members WHERE level = 'Executive' AND verified = 1", function (err, result) {
      respondToClient(res, err, result);
    });
  });

  /** Add new team member to database */
  app.post('/addMember', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    let { member, changed } = req.body;
    async.waterfall([
      function(callback){ // Upload file to directory
        filer.uploadImage(member, 'team', changed, callback);
      },
      function(entity, callback){ // Add candidate to database
        member = entity;
        const sql = "INSERT INTO members (firstname, lastname, image, level, birthday, sex, role, ethnicity, socials, slug, description, verified, slackID) VALUES ?";
        const values = [[member.firstname, member.lastname, member.image, member.level, member.birthday, member.sex, member.role, member.ethnicity, member.socials, member.slug, member.description, member.verified, member.slackID]];
        
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ], function(err, id){
      respondToClient(res, err, { id, ...member } );
    });
  });

  /** Update details of existing team member in database */
  app.put('/updateMember', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    let { member1, member2, changed } = req.body;
    async.waterfall([
      function(callback){ // Delete original image from directory
        filer.destroyImage(member1.image, changed, callback);
      },
      function(callback){ // Upload new image to directory
        filer.uploadImage(member2, 'team', changed, callback); 
      },
      function(entity, callback){ // Update member in database
        member2 = entity;
        const sql = "UPDATE members SET firstname = ?, lastname = ?, image = ?, level = ?, birthday = ?, sex = ?, role = ?, ethnicity = ?, socials = ?, slug = ?, description = ?, verified = ?, slackID = ? WHERE id = ?";
        const values = [member2.firstname, member2.lastname, member2.image, member2.level, member2.birthday, member2.sex, member2.role, member2.ethnicity, member2.socials, member2.slug, member2.description, member2.verified, member2.slackID, member1.id];
        
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err,  { id: member1.id, ...member2 });
    });
  });

  /** Delete an existing team member from database */
  app.delete('/deleteMember', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    const member = req.body;
    async.waterfall([
      function(callback){ // Delete image from directory
        filer.destroyImage(member.image, true, callback);
      },
      function(callback){ // Delete member from database
        const sql = "DELETE FROM members WHERE id = ?";
        conn.query(sql, member.id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err);
    });
  });

  /** Retrieve all reviews */
  app.get('/getReviews', validateReq, function(req, res){
    const limit = req.query.limit;
    const query = "SELECT * FROM reviews";
    const sql = limit ? `${query} WHERE rating = 5 ORDER BY RAND() LIMIT ${limit}` : query;

    conn.query(sql, function (err, result) {
      respondToClient(res, err, result);
    });
  });

  /** Add new review to database */
  app.post('/addReview', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    let {review, changed} = req.body;
    async.waterfall([
      function(callback){ // Upload file to directory
        filer.uploadImage(review, 'reviews', changed, callback);
      },
      function(entity, callback){ // Add review to database
        review = entity;
        const sql = "INSERT INTO reviews (referee, position, rating, image, description) VALUES ?";
        const values = [[review.referee, review.position, review.rating, review.image, review.description]];
        
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ], function(err, id){
      respondToClient(res, err, {id, ...review});
    });
  });

  /** Update details of existing review in database */
  app.put('/updateReview', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    let { review1, review2, changed } = req.body;
    async.waterfall([
      function(callback){ // Delete original image from directory
        filer.destroyImage(review1.image, changed, callback);
      },
      function(callback){ // Upload new image to directory
        filer.uploadImage(review2, 'reviews', changed, callback);
      },
      function(entity, callback){ // Update review in database
        review2 = entity;
        const sql = "UPDATE reviews SET referee = ?, position = ?, rating = ?, image = ?, description = ? WHERE id = ?";
        const values = [review2.referee, review2.position, review2.rating, review2.image, review2.description, review1.id];

        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err, { id: review1.id, ...review2 });
    });
  });

  /** Delete an existing review from database */
  app.delete('/deleteReview', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    const review = req.body;

    async.waterfall([
      function(callback){ // Delete image from directory
        filer.destroyImage(review.image, true, callback);
      },
      function(callback){ // Delete review from database
        conn.query("DELETE FROM reviews WHERE id = ?", review.id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      respondToClient(res, err);
    });
  });

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

  /****************************
   * HOMEPAGE
   ***************************/

  /** Get random member of the executive team */
  app.get('/getRandomMember', function(req, res){
    const sql = "SELECT * FROM members WHERE verified = 1 ORDER BY RAND() LIMIT 1";
    conn.query(sql, function (err, result) {
      respondToClient(res, err, result[0]);
    });
  });

  /** Get random Topic */
  app.get('/getRandomTopic', validateReq, function(req, res){
    const sql = `SELECT id, headline, category, question, option1, option2, yes, no FROM topics
      WHERE polarity = 1 AND category != 'Christian' AND category != 'Mental Health'
      ORDER BY RAND() LIMIT 1;`;
    conn.query(sql, function (err, result) {
      respondToClient(res, err, result[0]);
    });
  });

  /** Increment the vote */
  app.put('/incrementVote', validateReq, function(req, res){
    const topic = req.body;
    const sql = `UPDATE topics SET ${topic.vote}=${topic.vote}+1 WHERE id = ${topic.id};`;
    conn.query(sql, function (err) {
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