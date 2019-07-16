const async = require('async');
const request = require('superagent');
const fs = require('fs');
const { verifyToken, validateReq, checkAuth, upload } = require('./middleware.js');
const { resToClient } = require('./response.js');

module.exports = function(app, conn){

  /** Retrieve all sessions */
  app.get('/getSessions', validateReq, function(req, res){
    conn.query("SELECT * FROM sessions", function (err, result) {
      resToClient(res, err, result);
    });
  });

  /** Add new session to database */
  app.post('/addSession', verifyToken, function(req, res){
    async.waterfall([
      function(callback){ // Upload file to directory
        upload(req, res, function(err){
          err ? callback(err) : callback(null);
        });
      },
      function(callback){ // Add session to databse
        const session = JSON.parse(req.body.session);
        const sql = "INSERT INTO sessions (title, dateHeld, image, slug, description) VALUES ?";
        const values = [[session.title, session.dateHeld, session.image, session.slug, session.description]];
        
        conn.query(sql, [values], function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Update details of existing session in database */
  app.put('/updateSession', verifyToken, function(req, res){
    async.waterfall([
      function(callback){ // Upload new image to directory
        upload(req, res, function(err){
          err ? callback(err) : callback(null);
        });
      },
      function(callback){ // Update session in database
        const { session1, session2 } = JSON.parse(req.body.sessions);
        const sql = "UPDATE sessions SET title = ?, dateHeld = ?, image = ?, slug = ?, description = ? WHERE id = ?";
        const values = [session2.title, session2.dateHeld, session2.image, session2.slug, session2.description, session1.id];
        
        conn.query(sql, values, function (err) {
          if (err) return callback(err);
          const image = `./static/images/sessions/${session1.image}`;
          
          if (req.body.changed){
            if (session1.image !== session2.image){
              callback(null, image);
            } else { callback(true); }
          } else { callback(true); }
        });
      },
      function(image, callback){ // Delete original image from directory
        fs.unlink(image, function(err) {
          if (err) console.warn(err.toString());
          callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Delete an existing session from database */
  app.delete('/deleteSession', verifyToken, function(req, res){
    async.waterfall([
      function(callback){ // Delete session from database
        const session = req.body;
        const sql = "DELETE FROM sessions WHERE id = ?";

        conn.query(sql, session.id, function (err) {
          err ? callback(err) : callback(null, session.image);
        });
      },
      function(image, callback){ // Delete image from directory
        fs.unlink(`./static/images/sessions/${image}`, function(err) {
          if (err) console.warn(`${image} not found in /sessions directory.`);
          callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Retrieve all topics */
  app.get('/getTopics', verifyToken, function(req, res){
    conn.query("SELECT * FROM topics", function (err, result) {
      resToClient(res, err, result)
    });
  });

  /** Add new topic to database */
  app.post('/addTopic', verifyToken, function(req, res){
    const topic = req.body;
    const sql = "INSERT INTO topics (headline, category, question, description, type, polarity, option1, option2, user_id) VALUES ?";
    const values = [[topic.headline, topic.category, topic.question, topic.description, topic.type,
      topic.polarity, topic.option1, topic.option2, topic.userId]];
    
    conn.query(sql, [values], function (err) {
      resToClient(res, err);
    });
  });

  /** Update topic in database */
  app.put('/updateTopic', verifyToken, function(req, res){
    const topic = req.body;
    const sql = `UPDATE topics SET headline = ?, category = ?, question = ?, description = ?, type = ?, polarity = ?, option1 = ?, option2 = ? WHERE id = ?`;
    const values = [topic.headline, topic.category, topic.question, topic.description, topic.type,
      topic.polarity, topic.option1, topic.option2, topic.id];
    
    conn.query(sql, values, function (err) {
      resToClient(res, err);
    });
  });

  /** Delete an existing topic from database */
  app.delete('/deleteTopic', verifyToken, function(req, res){
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
  app.post('/addCandidate', verifyToken, function(req, res){
    async.waterfall([
      function(callback){ // Upload file to directory
        upload(req, res, function(err){
          err ? callback(err) : callback(null);
        });
      },
      function(callback){ // Add candidate to databse
        const candidate = JSON.parse(req.body.candidate);
        const sql = "INSERT INTO blackex (id, name, image, birthday, ethnicity, socials, occupation, description) VALUES ?";
        const values = [[candidate.id, candidate.name, candidate.image, candidate.birthday, candidate.ethnicity, candidate.socials, candidate.occupation, candidate.description]];
    
        conn.query(sql, [values], function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Update details of existing candidate in database */
  app.put('/updateCandidate', verifyToken, function(req, res){
    async.waterfall([
      function(callback){ // Upload new image to directory
        upload(req, res, function(err){
          err ? callback(err) : callback(null);
        });
      },
      function(callback){ // Update candidate in database
        const { candidate1, candidate2 } = JSON.parse(req.body.candidates);
        const sql = "UPDATE blackex SET id = ?, name = ?, image = ?, birthday = ?, ethnicity = ?, socials = ?, occupation = ?, description = ? WHERE id = ?";
        const values = [candidate2.id, candidate2.name, candidate2.image, candidate2.birthday, candidate2.ethnicity, candidate2.socials, candidate2.occupation, candidate2.description, candidate1.id];
        
        conn.query(sql, values, function (err) {
          if (err) return callback(err);
          const image = `./static/images/blackexcellence/${candidate1.image}`;
          
          if (req.body.changed){
            if (candidate1.image !== candidate2.image){
              callback(null, image);
            } else { callback(true); }
          } else { callback(true); }
        });
      },
      function(image, callback){ // Delete original image from directory
        fs.unlink(image, function(err) {
          if (err) console.warn(err.toString());
          callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Delete an existing candidate from database */
  app.delete('/deleteCandidate', verifyToken, function(req, res){
    async.waterfall([
      function(callback){ // Delete candidate from database
        const candidate = req.body;
        const sql = "DELETE FROM blackex WHERE id = ?";

        conn.query(sql, candidate.id, function (err) {
          err ? callback(err) : callback(null, candidate.image);
        });
      },
      function(image, callback){ // Delete image from directory
        fs.unlink(`./static/images/blackexcellence/${image}`, function(err) {
          if (err) console.warn(`${image} not found in /blackexcellence directory.`);
          callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Retrieve only executive team members */
  app.get('/getExec', validateReq, function(req, res){
    conn.query("SELECT * FROM team WHERE level = 'Executive'", function (err, result) {
      resToClient(res, err, result);
    });
  });

  /** Update details of existing team member in database */
  app.put('/updateMember', verifyToken, function(req, res){
    async.waterfall([
      function(callback){ // Upload new image to directory
        upload(req, res, function(err){
          err ? callback(err) : callback(null);
        });
      },
      function(callback){ // Update member in database
        const { member1, member2 } = JSON.parse(req.body.members);
        const sql = "UPDATE team SET firstname = ?, lastname = ?, image = ?, level = ?, birthday = ?, role = ?, ethnicity = ?, socials = ?, slug = ?, description = ? WHERE id = ?";
        const values = [member2.firstname, member2.lastname, member2.image, member2.level, member2.birthday, member2.role, member2.ethnicity, member2.socials, member2.slug, member2.description, member1.id];
        
        conn.query(sql, values, function (err) {
          if (err) return callback(err);
          const image = `./static/images/team/${member1.image}`;
          
          if (req.body.changed){
            if (member1.image !== member2.image){
              callback(null, image);
            } else { callback(true); }
          } else { callback(true); }
        });
      },
      function(image, callback){ // Delete original image from directory
        fs.unlink(image, function(err) {
          if (err) console.warn(err.toString());
          callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

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
  app.get('/getRandomExecutive', function(req, res){
    const sql = "SELECT * FROM team WHERE level = 'Executive' ORDER BY RAND() LIMIT 1";
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

  /** Update about description */
  app.put('/updateAbout', verifyToken, function(req, res){
    const text = req.body.text;
    fs.writeFile('./static/resources/about.txt', text, function(err) {
      resToClient(res, err);
    });
  });

  /****************************
   * CHECKPOINT
   ***************************/

  /** Retrieve all team members */
  app.get('/getTeam', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT * FROM team", function (err, result) {
        if (!err){
          res.json(result);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  /** Add new team member to database */
  app.post('/addMember', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_TEAM)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }

        var member = req.body;
        var sql = "INSERT INTO team (firstname, lastname, image, level, birthday, role, ethnicity, socials, slug, text, description, delta) VALUES ?";
        var values = [[member.firstname, member.lastname, member.image, member.level, member.birthday, member.role, member.ethnicity, member.socials, member.slug, member.text, member.description, member.delta]];
        
        conn.query(sql, [values], function (err, result) {
          if (!err){
                        res.sendStatus(200);
          } else {
            if (err.toString().includes("Incorrect string")){
              res.status(422).send(`Please do not use emojis during input.`)
            } else {
              res.status(400).send(err.toString());
            }
          }
        });
      }
    });
  });

  /** Delete an existing team member from database */
  app.delete('/deleteMember', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_TEAM)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }

        var member = req.body;
        var sql = "DELETE FROM team WHERE id = ?";
        
        conn.query(sql, member.id, function (err, result) {
          if (!err){
                        
            /** Delete image from file system if exists */
            if (member.image){
              fs.unlink(`.${team_dir}${member.image}`, function(err1) {
                if (!err1) {
                  console.log(`Deleted ${member.image} from the /team directory.` );
                  res.sendStatus(200);
                } else {
                  console.warn(`${member.image} not found in /team directory.` );
                  res.sendStatus(200);
                }
              });
            } else {
              console.log(`You've deleted team member ${member.firstname} ${member.lastname}.`);
              res.sendStatus(200);
            }
          } else {
            res.status(400).send(err.toString());
          }
        });
      }
    });
  });

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