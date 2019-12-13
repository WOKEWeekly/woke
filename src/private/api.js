const async = require('async');
const fs = require('fs');

const filer = require('./filer.js');
const { verifyToken, validateReq, logUserActivity, upload } = require('./middleware.js');
const { resToClient } = require('./response.js');
const CLEARANCES = require('../constants/clearances.js');

module.exports = function(app, conn){

  /** Log user activity on each request */
  app.use('/', logUserActivity(conn));

  /** Retrieve all sessions */
  app.get('/getSessions', validateReq, function(req, res){
    conn.query("SELECT * FROM sessions", function (err, result) {
      resToClient(res, err, result);
    });
  });

  /** Add new session to database */
  app.post('/addSession', verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS), function(req, res){
    let session = req.body;

    async.waterfall([
      function(callback){
        filer.uploadImage(session, 'sessions', callback);
      },
      function(entity, callback){ // Add session to database
        session = entity;
        const sql = "INSERT INTO sessions (title, dateHeld, image, slug, description) VALUES ?";
        const values = [[session.title, session.dateHeld, session.image, session.slug, session.description]];
        
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ], function(err, id){
      resToClient(res, err, {id, ...session});
    });
  });

  /** Update details of existing session in database */
  app.put('/updateSession', verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS), function(req, res){
    let { session1, session2, changed } = req.body;
    async.waterfall([
      function(callback){ // Upload new image to directory
        filer.uploadImage(session2, 'sessions', callback);
      },
      function(entity, callback){ // Update session in database
        session2 = entity;
        const sql = "UPDATE sessions SET title = ?, dateHeld = ?, image = ?, slug = ?, description = ? WHERE id = ?";
        const values = [session2.title, session2.dateHeld, session2.image, session2.slug, session2.description, session1.id];

        conn.query(sql, values, function (err) {
          if (err) return callback(err);
          changed === 'true' ? callback(null) : callback(true);
        });
      },
      function(callback){ // Delete original image from directory
        filer.destroyImage(session1.image, callback);
      }
    ], function(err){
      resToClient(res, err, { id: session1.id, ...session2 });
    });
  });

  /** Delete an existing session from database */
  app.delete('/deleteSession', verifyToken(CLEARANCES.ACTIONS.CRUD_SESSIONS), function(req, res){
    const session = req.body;

    async.waterfall([
      function(callback){ // Delete image from directory
        filer.destroyImage(session.image, callback);
      },
      function(callback){ // Delete session from database
        conn.query("DELETE FROM sessions WHERE id = ?", session.id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Retrieve all topics */
  app.get('/getTopics', verifyToken(CLEARANCES.ACTIONS.VIEW_TOPICS), function(req, res){
    conn.query("SELECT * FROM topics", function (err, result) {
      resToClient(res, err, result)
    });
  });

  /** Add new topic to database */
  app.post('/addTopic', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const topic = req.body;
    const sql = "INSERT INTO topics (headline, category, question, description, type, polarity, validated, sensitivity, option1, option2, user_id) VALUES ?";
    const values = [[topic.headline, topic.category, topic.question, topic.description, topic.type,
      topic.polarity, topic.validated, topic.sensitivity, topic.option1, topic.option2, topic.userId]];
    
    conn.query(sql, [values], function (err, result) {
      resToClient(res, err, result.insertId);
    });
  });

  /** Update topic in database */
  app.put('/updateTopic', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const topic = req.body;
    const sql = `UPDATE topics SET headline = ?, category = ?, question = ?, description = ?, type = ?, polarity = ?, validated = ?, sensitivity = ?, option1 = ?, option2 = ? WHERE id = ?`;
    const values = [topic.headline, topic.category, topic.question, topic.description, topic.type,
      topic.polarity, topic.validated, topic.sensitivity, topic.option1, topic.option2, topic.id];
    
    conn.query(sql, values, function (err) {
      resToClient(res, err);
    });
  });

  /** Delete an existing topic from database */
  app.delete('/deleteTopic', verifyToken(CLEARANCES.ACTIONS.CRUD_TOPICS), function(req, res){
    const topic = req.body;
    const sql = "DELETE FROM topics WHERE id = ?";
    
    conn.query(sql, topic.id, function (err) {
      // emails.sendTopicDeletionEmail(topic);
      resToClient(res, err);
    });
  });

  /** Retrieve all candidates */
  app.get('/getCandidates', validateReq, function(req, res){
    conn.query("SELECT * FROM blackex", function (err, result) {
      resToClient(res, err, result);
    });
  });

   /** Find last candidate ID */
  app.get('/newCandidateID', function(req, res){
    conn.query("SELECT MAX(ID) FROM blackex", function (err, result) {
      resToClient(res, err, result[0]['MAX(ID)'] + 1)
    });
  });

  /** Add new candidate to database */
  app.post('/addCandidate', verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX), function(req, res){
    let candidate = req.body;
    async.waterfall([
      function(callback){ // Upload file to directory
        filer.uploadImage(candidate, 'blackexcellence', callback);
      },
      function(entity, callback){ // Add candidate to database
        candidate = entity;
        const sql = "INSERT INTO blackex (id, name, image, birthday, ethnicity, socials, occupation, description, authorId, date_written) VALUES ?";
        const values = [[candidate.id, candidate.name, candidate.image, candidate.birthday, candidate.ethnicity, candidate.socials, candidate.occupation, candidate.description, candidate.authorId, candidate.date_written]];
    
        conn.query(sql, [values], function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err, { ...candidate });
    });
  });

  /** Update details of existing candidate in database */
  app.put('/updateCandidate', verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX), function(req, res){
    let { candidate1, candidate2, changed } = req.body;
    async.waterfall([
      function(callback){ // Upload new image to directory
        filer.uploadImage(candidate2, 'blackexcellence', callback);
      },
      function(entity, callback){ // Update candidate in database
        candidate2 = entity;
        const sql = "UPDATE blackex SET id = ?, name = ?, image = ?, birthday = ?, ethnicity = ?, socials = ?, occupation = ?, description = ?, authorId = ?, date_written = ? WHERE id = ?";
        const values = [candidate2.id, candidate2.name, candidate2.image, candidate2.birthday, candidate2.ethnicity, candidate2.socials, candidate2.occupation, candidate2.description, candidate2.authorId, candidate2.date_written, candidate1.id];
        
        conn.query(sql, values, function (err) {
          if (err) return callback(err);
          changed === 'true' ? callback(null) : callback(true);
        });
      },
      function(callback){ // Delete original image from directory
        filer.destroyImage(candidate2.image, callback);
      }
    ], function(err){
      resToClient(res, err, { id: candidate1.id, ...candidate2 });
    });
  });

  /** Delete an existing candidate from database */
  app.delete('/deleteCandidate', verifyToken(CLEARANCES.ACTIONS.CRUD_BLACKEX), function(req, res){
    const candidate = req.body;

    async.waterfall([
      function(callback){ // Delete image from directory
        filer.destroyImage(candidate.image, callback);
      },
      function(callback){ // Delete candidate from database
        conn.query("DELETE FROM blackex WHERE id = ?", candidate.id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Retrieve all team members */
  app.get('/getTeam', verifyToken(CLEARANCES.ACTIONS.VIEW_TEAM), function(req, res){
    conn.query("SELECT * FROM team", function (err, result) {
      resToClient(res, err, result);
    });
  });

  /** Retrieve only executive team members */
  app.get('/getExec', validateReq, function(req, res){
    conn.query("SELECT * FROM team WHERE level = 'Executive'", function (err, result) {
      resToClient(res, err, result);
    });
  });

  /** Add new team member to database */
  app.post('/addMember', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    let member = req.body;
    async.waterfall([
      function(callback){ // Upload file to directory
        filer.uploadImage(member, 'team', callback);
      },
      function(entity, callback){ // Add candidate to database
        member = entity;
        const sql = "INSERT INTO team (firstname, lastname, image, level, birthday, role, ethnicity, socials, slug, description, verified) VALUES ?";
        const values = [[member.firstname, member.lastname, member.image, member.level, member.birthday, member.role, member.ethnicity, member.socials, member.slug, member.description, member.verified]];
        
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ], function(err, id){
      resToClient(res, err, { id, ...member } );
    });
  });

  /** Update details of existing team member in database */
  app.put('/updateMember', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    let { member1, member2, changed } = req.body;
    async.waterfall([
      function(callback){ // Upload new image to directory
        filer.uploadImage(member2, 'team', callback);
      },
      function(entity, callback){ // Update member in database
        member2 = entity;
        const sql = "UPDATE team SET firstname = ?, lastname = ?, image = ?, level = ?, birthday = ?, role = ?, ethnicity = ?, socials = ?, slug = ?, description = ?, verified = ? WHERE id = ?";
        const values = [member2.firstname, member2.lastname, member2.image, member2.level, member2.birthday, member2.role, member2.ethnicity, member2.socials, member2.slug, member2.description, member2.verified, member1.id];
        
        conn.query(sql, values, function (err) {
          if (err) return callback(err);
          changed === 'true' ? callback(null) : callback(true);
        });
      },
      function(callback){ // Delete original image from directory
        filer.destroyImage(member1.image, callback);
      }
    ], function(err){
      resToClient(res, err,  { id: member1.id, ...member2 });
    });
  });

  /** Delete an existing team member from database */
  app.delete('/deleteMember', verifyToken(CLEARANCES.ACTIONS.CRUD_TEAM), function(req, res){
    const member = req.body;
    async.waterfall([
      function(callback){ // Delete image from directory
        filer.destroyImage(member.image, callback);
      },
      function(callback){ // Delete member from database
        const sql = "DELETE FROM team WHERE id = ?";
        conn.query(sql, member.id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Retrieve all reviews */
  app.get('/getReviews', validateReq, function(req, res){
    const limit = req.query.limit;
    const query = "SELECT * FROM reviews";
    const sql = limit ? `${query} WHERE rating = 5 ORDER BY RAND() LIMIT ${limit}` : query;

    conn.query(sql, function (err, result) {
      resToClient(res, err, result);
    });
  });

  /** Add new review to database */
  app.post('/addReview', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    let review = req.body;
    async.waterfall([
      function(callback){ // Upload file to directory
        filer.uploadImage(review, 'reviews', callback);
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
      resToClient(res, err, {id, ...review});
    });
  });

  /** Update details of existing review in database */
  app.put('/updateReview', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    let { review1, review2, changed } = req.body;
    async.waterfall([
      function(callback){ // Upload new image to directory
        filer.uploadImage(review2, 'reviews', callback);
      },
      function(entity, callback){ // Update review in database
        review2 = entity;
        const sql = "UPDATE reviews SET referee = ?, position = ?, rating = ?, image = ?, description = ? WHERE id = ?";
        const values = [review2.referee, review2.position, review2.rating, review2.image, review2.description, review1.id];

        conn.query(sql, values, function (err) {
          if (err) return callback(err);
          changed === 'true' ? callback(null) : callback(true);
        });
      },
      function(callback){ // Delete original image from directory
        filer.destroyImage(review1.image, callback);
      }
    ], function(err){
      resToClient(res, err, { id: review1.id, ...review2 });
    });
  });

  /** Delete an existing review from database */
  app.delete('/deleteReview', verifyToken(CLEARANCES.ACTIONS.CRUD_REVIEWS), function(req, res){
    const review = req.body;

    async.waterfall([
      function(callback){ // Delete image from directory
        filer.destroyImage(review.image, callback);
      },
      function(callback){ // Delete review from database
        conn.query("DELETE FROM reviews WHERE id = ?", review.id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Retrieve all users */
  app.get('/getRegisteredUsers', verifyToken(CLEARANCES.ACTIONS.VIEW_USERS), function(req, res){
    const sql = "SELECT id, firstname, lastname, clearance, username, email, create_time, last_active FROM user";
    conn.query(sql, function (err, result) {
      resToClient(res, err, result);
    });
  });
  
  /** Change user's clearance */
  app.put('/changeClearance', verifyToken(CLEARANCES.ACTIONS.CRUD_USERS), function(req, res){
    const {id, clearance} = req.body;
    const sql = "UPDATE user SET clearance = ? WHERE id = ?";
    const values = [clearance, id];
    
    conn.query(sql, values, function(err){	
      resToClient(res, err);
    });
  });

  /****************************
   * HOMEPAGE
   ***************************/

  /** Get upcoming session */
  app.get('/getUpcomingSession', validateReq, function(req, res){
    async.waterfall([
      function(callback){ // Get most upcoming session
        const sql = "SELECT * FROM sessions WHERE dateHeld > NOW() ORDER BY dateHeld LIMIT 1;";
        conn.query(sql, function (err, result) {
          if (err) return callback(err);
          if (result.length === 0) return callback(null);
          callback(true, {
            session: result[0],
            upcoming: true
          });
        });
      },
      function(callback){ // If not, get latest session
        const sql = "SELECT * FROM sessions ORDER BY dateHeld DESC LIMIT 1;";
        conn.query(sql, function (err, result) {
          if (err) return callback(err);
          callback(null, {
            session: result[0],
            upcoming: false
          });
        });
      }
    ], function(err, result){
      resToClient(res, err, result);
    });
  });

  /** Get random candidate */
  app.get('/getRandomCandidate', validateReq, function(req, res){
    const sql = "SELECT * FROM blackex ORDER BY RAND() LIMIT 1";
    conn.query(sql, function (err, result) {
      resToClient(res, err, result[0]);
    });
  });

  /** Get random member of the executive team */
  app.get('/getRandomMember', function(req, res){
    const sql = "SELECT * FROM team WHERE verified = 1 ORDER BY RAND() LIMIT 1";
    conn.query(sql, function (err, result) {
      resToClient(res, err, result[0]);
    });
  });

  /** Get random Topic */
  app.get('/getRandomTopic', validateReq, function(req, res){
    const sql = `SELECT id, headline, category, question, option1, option2, yes, no FROM topics
      WHERE polarity = 1 AND category != 'Christian' AND category != 'Mental Health'
      ORDER BY RAND() LIMIT 1;`;
    conn.query(sql, function (err, result) {
      resToClient(res, err, result[0]);
    });
  });

  /** Increment the vote */
  app.put('/incrementVote', validateReq, function(req, res){
    const topic = req.body;
    const sql = `UPDATE topics SET ${topic.vote}=${topic.vote}+1 WHERE id = ${topic.id};`;
    conn.query(sql, function (err) {
      resToClient(res, err);
    });
  });

  /** Update information pages */
  app.put(['/updateInfo', '/updateVariantPage'], verifyToken(CLEARANCES.ACTIONS.EDIT_INFO), function(req, res){
    const { resource, text } = req.body;
    const sql = "UPDATE resources SET text = ?, lastModified = ? WHERE name = ?";
    const values = [text, new Date(), resource];
    conn.query(sql, values, function (err) {
      resToClient(res, err);
    });
  });

  /****************************
   * CHECKPOINT
   ***************************/

  /** Retrieve all suggestions */
  app.get('/getSuggestions', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      let sql = `SELECT suggestions.id, question, category, type, user_id, approved, suggestions.create_time, CONCAT(firstname, ' ', lastname) AS author FROM suggestions
        INNER JOIN user ON suggestions.user_id = user.id
        WHERE approved = 1`;

      conn.query(sql, function (err, result) {
        if (!err){
          res.json(result);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  /** Retrieve all suggestions made by a particular user */
  app.get('/getUserSuggestions', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        let sql = `SELECT suggestions.id, question, category, type, user_id, approved, suggestions.create_time, CONCAT(firstname, ' ', lastname) AS author FROM suggestions
          INNER JOIN user ON suggestions.user_id = user.id
          WHERE suggestions.user_id = ?`;

        conn.query(sql, auth.user.id, function (err, result) {
          if (!err){
            res.json(result);
          } else {
            res.status(400).send(err.toString());
          }
        });
      }
    });
  });

  /** Retrieve all unapproved suggestions */
  app.get('/getUnapprovedSuggestions', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        let sql = `SELECT suggestions.id, question, category, type, user_id, approved,suggestions.create_time, CONCAT(firstname, ' ', lastname) AS author FROM suggestions
          INNER JOIN user ON suggestions.user_id = user.id
          WHERE approved = 0`;

        conn.query(sql, function (err, result) {
          if (!err){
            res.json(result);
          } else {
            res.status(400).send(err.toString());
          }
        });
      }
    });
  });

  /** Add new topic suggestion to database */
  app.post('/addSuggestion', verifyToken, function(req, res){
    async.waterfall([
      function(callback){
        jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
          if (err){
            res.sendStatus(403);
          } else {
            callback(null)
          }
        });
      },
      function(callback){
        var suggestion = req.body;
        var sql = "INSERT INTO suggestions (question, category, type, user_id, approved) VALUES ?";
        var values = [[suggestion.question, suggestion.category, suggestion.type, suggestion.user_id, 0]];
        
        conn.query(sql, [values], function (err, result) {
          if (!err){
            callback(null, suggestion.user_id)
          } else {
            if (err.toString().includes("Incorrect string")){
              res.status(422).send(`Please do not use emojis during input.`);
              console.error(err.toString());
            } else {
              res.status(400).send(err.toString());
              console.error(err.toString());
            }
          }
        });
      },
      function(id, callback){
        let sql = `SELECT CONCAT(firstname, ' ', lastname) AS name FROM user
          WHERE id = ?`;

        conn.query(sql, id, function (err, result) {
          if (!err){
            callback(null, result[0].name)
          } else {
            console.error(err.toString());
          }
        });
      }
    ], function(err, name){
      let title = '';
      let message = `${name} just made a suggestion.`;
      notifications.exec(conn, title, message);

            res.sendStatus(200);
    })
  });

  /** Delete an existing suggestion from database */
  app.delete('/deleteSuggestion', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        var suggestion = req.body;
        var sql = "DELETE FROM suggestions WHERE id = ?";
        
        conn.query(sql, suggestion.id, function (err, result) {
          if (!err){
            res.sendStatus(200);
          } else {
            res.status(400).send(err.toString());
            console.error(err.toString())
          }
        });
      }
    });
  });

  /** Approve suggestion */
  app.put('/approveSuggestion', verifyToken, function(req, res){
    async.waterfall([
      /** Verify token */
      function(callback){
        jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
          if (!err){
            callback(null);
          } else {
            res.sendStatus(403);
            console.error(err.toString());
          }
        });
      },
      /** Set suggestion to approved */
      function(callback){
        var id = req.body.id;
        var sql = "UPDATE suggestions SET approved = 1 WHERE id = ?";
        
        conn.query(sql, id, function (err, result) {
          if (!err){
            callback(null);
          } else {
            res.status(400).send(err.toString());
            console.error(err.toString());
          }
        });
      }
    ], function(){
      /** Send notification to author of approval */

      let id = req.body.user_id;
      let title = '';
      let message = 'Your suggestion has been approved.'

      notifications.one(conn, title, message, id);
      res.sendStatus(200);
    });
  });

  /** Reject suggestion */
  app.put('/rejectSuggestion', verifyToken, function(req, res){
    async.waterfall([
      /** Verify token */
      function(callback){
        jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
          if (!err){
            callback(null);
          } else {
            res.sendStatus(403);
            console.error(err.toString());
          }
        });
      },
      /** Set suggestion to rejected */
      function(callback){
        var id = req.body.id;
        var sql = "UPDATE suggestions SET approved = 2 WHERE id = ?";
        
        conn.query(sql, id, function (err, result) {
          if (!err){
            callback(null);
          } else {
            res.status(400).send(err.toString());
            console.error(err.toString());
          }
        });
      }
    ], function(){
      /** Send notification to author of approval */

      let id = req.body.user_id;
      let title = '';
      let message = 'Your suggestion has been rejected.'

      notifications.one(conn, title, message, id);
      res.sendStatus(200);
    });
  });
}