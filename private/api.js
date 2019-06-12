const async = require('async');
const fs = require('fs');
const { verifyToken, upload } = require('./middleware.js');

module.exports = function(app, conn){

  /** Retrieve all sessions */
  app.get('/getSessions', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT * FROM sessions", function (err, result) {
        resToClient(res, err, result)
      });
    }
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
        
        conn.query(sql, [values], function (err, result, fields) {
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
        
        conn.query(sql, values, function (err, result, fields) {
          if (!err){
            const image = `./static/images/sessions/${session1.image}`;
            
            if (req.body.changed){
              if (session1.image !== session2.image){
                callback(null, image);
              } else { callback(true); }
            } else { callback(true); }
          } else { callback(err); }
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

        conn.query(sql, session.id, function (err, result, fields) {
          err ? callback(err) : callback(null, session.image);
        });
      },
      function(image, callback){ // Delete image from directory
        fs.unlink(`./static/images/sessions/${image}`, function(err) {
          if (err) console.warn(`${session.image} not found in /sessions directory.`);
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

  /****************************
   * CHECKPOINT
   ***************************/

  /** Retrieve all candidates */
  app.get('/getBlackEx', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT * FROM blackex", function (err, result, fields) {
        if (!err){
          res.json(result);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  /** Get random candidate */
  app.get('/getRandomCandidate', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT * FROM blackex ORDER BY RAND() LIMIT 1", function (err, result, fields) {
        if (!err){
          res.json(result[0]);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  /** Find last candidate ID */
  app.get('/newCandidateID', function(req, res){
    conn.query("SELECT MAX(ID) FROM blackex", function (err, result, fields) {
      if (!err){
        res.json(result[0]['MAX(ID)'] + 1);
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Add new candidate to database */
  app.post('/addBlackEx', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_BLACKEX)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }

        var candidate = req.body;
        var sql = "INSERT INTO blackex (id, name, image, birthday, ethnicity, socials, occupation, text, description, delta) VALUES ?";
        var values = [[candidate.id, candidate.name, candidate.image, candidate.birthday, candidate.ethnicity, candidate.socials, candidate.occupation, candidate.text, candidate.description, candidate.delta]];
        
        conn.query(sql, [values], function (err, result, fields) {
          if (!err){
            req.flash('success', `You've added candidate ${candidate.name}.`);
            res.sendStatus(200);
            console.log("Added #BlackExcellence candidate successfully.");
          } else {
            if (err.toString().includes("Duplicate entry")){
              res.status(409).send(`There\'s already a candidate with ID number ${candidate.id}.`)
            } else if (err.toString().includes("Incorrect string")){
              res.status(422).send(`Please do not use emojis during input.`)
            } else {
              res.status(400).send(err.toString());
            }
          }
        });
      }
    });
  });

  /** Update details of existing candidate in database */
  app.put('/updateBlackEx', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_BLACKEX)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }

        var candidates = req.body.candidates;
    
        var candidate1 = candidates[0];
        var candidate2 = candidates[1];
        
        var sql = "UPDATE blackex SET id = ?, name = ?, image = ?, birthday = ?, ethnicity = ?, socials = ?, occupation = ?, text = ?, description = ?, delta = ? WHERE id = ?";
        var values = [candidate2.id, candidate2.name, candidate2.image, candidate2.birthday, candidate2.ethnicity, candidate2.socials, candidate2.occupation, candidate2.text, candidate2.description, candidate2.delta, candidate1.id];
        
        conn.query(sql, values, function (err, result, fields) {
          if (!err){
            req.flash('success', `You've updated the details of ${candidate2.name}.`);
            
            let image = `./public/images/blackexcellence/${candidate1.image}`;
            
            /** Delete first image from file system if there was an image change */
            if (candidate2.change == true){
              if (candidate1.image !== candidate2.image){
                fs.unlink(image, function(err1) {
                  if (!err1) {
                    console.log(`Deleted first ${candidate1.image} from the /blackexcellence directory.` );
                    res.sendStatus(200);
                  } else {
                    console.error(err1.toString());
                    res.sendStatus(200);
                  }
                });
              } else {
                console.log("Same slugs. Image is being replaced rather than deleted.");
                res.sendStatus(200);
              }
            } else {
              console.log("No image change, hence, no deletion.");
              res.sendStatus(200);
            }
          } else {
            if (err.toString().includes("Duplicate entry")){
              res.status(409).send(`There\'s already a candidate with ID number ${candidate2.id}.`)
            } else if (err.toString().includes("Incorrect string")){
              res.status(422).send(`Please do not use emojis during input.`)
            } else {
              res.status(400).send(err.toString());
            }
          }
        });
      }
    });
    
    
  });

  /** Delete an existing candidate from database */
  app.delete('/deleteBlackEx', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_BLACKEX)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }

        var candidate = req.body;
        var sql = "DELETE FROM blackex WHERE id = ?";
        
        conn.query(sql, candidate.id, function (err, result, fields) {
          if (!err){
            req.flash('success', `You've deleted candidate ${candidate.name}.`);
            
            /** Delete image from file system */
            fs.unlink('./public/images/blackexcellence/' + candidate.image, function(err1) {
              if (!err1) {
                res.sendStatus(200);
                console.log(`Deleted ${candidate.image} from the /blackexcellence directory.` );
              } else {
                console.warn(`${candidate.image} not found in /blackexcellence directory.` );
                res.sendStatus(200);
              }
            });
          } else {
            res.status(400).send(err.toString());
          }
        });
      }
    });
  });

  /** Retrieve all team members */
  app.get('/getTeam', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT * FROM team", function (err, result, fields) {
        if (!err){
          res.json(result);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  /** Retrieve only executive team members */
  app.get('/getExecTeam', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT * FROM team WHERE level = 'Executive'", function (err, result, fields) {
        if (!err){
          res.json(result);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  /** Get random member of the executive team */
  app.get('/getRandomExecMember', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT * FROM team WHERE level = 'Executive' ORDER BY RAND() LIMIT 1", function (err, result, fields) {
        if (!err){
          res.json(result[0]);
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
        
        conn.query(sql, [values], function (err, result, fields) {
          if (!err){
            req.flash('success', `You've added team member ${member.name}.`);
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

  /** Update details of existing team member in database */
  app.put('/updateMember', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_TEAM)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }

        var members = req.body.members;
    
        var member1 = members[0];
        var member2 = members[1];
        
        var sql = "UPDATE team SET firstname = ?, lastname = ?, image = ?, level = ?, birthday = ?, role = ?, ethnicity = ?, socials = ?, slug = ?, text = ?, description = ?, delta = ? WHERE id = ?";
        var values = [member2.firstname, member2.lastname, member2.image, member2.level, member2.birthday, member2.role, member2.ethnicity, member2.socials, member2.slug, member2.text, member2.description, member2.delta, member1.id];
        
        conn.query(sql, values, function (err, result, fields) {
          if (!err){
            req.flash('success', `You've updated the details of ${member2.name}.`);
            
            let image = `.${team_dir}${member1.image}`;
            
            /** Delete first image from file system if there was an image change */
            if (member2.change == true){
              if (member1.image !== member2.image){
                fs.unlink(image, function(err1) {
                  if (!err1) {
                    console.log(`Deleted first ${member1.image} from the /team directory.` );
                    res.sendStatus(200);
                  } else {
                    console.error(err1.toString());
                    res.sendStatus(200);
                  }
                });
              } else {
                console.log("Same slugs. Image is being replaced rather than deleted.");
                res.sendStatus(200);
              }
            } else {
              console.log("No image change, hence, no deletion.");
              res.sendStatus(200);
            }
          } else {
            console.error(err.toString());
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
        
        conn.query(sql, member.id, function (err, result, fields) {
          if (!err){
            req.flash('success', `You've deleted team member ${member.firstname} ${member.lastname}.`);
            
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

  /** Get upcoming session */
  app.get('/getUpcomingSession', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT * FROM sessions WHERE dateHeld > NOW() ORDER BY dateHeld LIMIT 1;", function (err, result, fields) {
        if (!err){
          if (result.length == 0){
            conn.query("SELECT * FROM sessions ORDER BY dateHeld DESC LIMIT 1;", function (err, result, fields) {
              if (!err){
                res.json({
                  result: result[0],
                  session: true
                });
              } else {
                res.status(400).send(err.toString());
              }
            });
          } else {
            res.json({
              result: result[0],
              session: false
            });
          }
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  

  /** Get Random Topic */
  app.get('/getRandomTopic', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      let sql = `SELECT id, headline, category, question, option1, option2, yes, no FROM topics
        WHERE polarity = 1 AND category != 'Christian' AND category != 'Mental Health'
        ORDER BY RAND() LIMIT 1;`;

      conn.query(sql, function (err, result, fields) {
        if (!err){
          res.json(result[0]);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  /** Add new topic to database */
  app.put('/updateTopicVote', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      var topic = req.body;
      var sql = `UPDATE topics SET ${topic.vote}=${topic.vote}+1 WHERE id = ${topic.id};`;
      
      conn.query(sql, function (err) {
        if (!err){
          conn.query(`SELECT yes, no FROM topics WHERE id = ${topic.id};`, function (err, result) {
            if (!err){

              let topic = result[0];

              /** Calculate total votes and percentages */
              let totalVotes = topic.yes + topic.no;
              let pctYes = (topic.yes / totalVotes) * 100;
              let pctNo = (topic.no / totalVotes) * 100;

              res.json({
                countYes: topic.yes,
                countNo: topic.no,
                pctYes: pctYes,
                pctNo: pctNo,
                stringYes: `${Math.ceil(pctYes)}%`,
                stringNo: `${Math.floor(pctNo)}%`,
                totalVotes: totalVotes,
              });
            } else {
              res.status(400).send(err.toString());
            }
          });
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });

  /** Update topic in database */
  app.put('/updateTopic', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_TOPICS)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }

        var topic = req.body;

        if (!topic.polarity){
          topic.option1 = topic.option2 = null;
        }

        var sql = `UPDATE topics SET headline = ?, category = ?, question = ?, description = ?, type = ?, polarity = ?, option1 = ?, option2 = ? WHERE id = ?`;
        var values = [topic.headline, topic.category, topic.question, topic.description, topic.type,
          topic.polarity, topic.option1, topic.option2, topic.id];
        
        conn.query(sql, values, function (err, result, fields) {
          if (!err){
            req.flash('success', `You've updated the details of session: ${topic.headline}:${topic.question}.`);
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

  /** Delete an existing topic from database */
  app.delete('/deleteTopic', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_TOPICS)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }

        var topic = req.body;
        var sql = "DELETE FROM topics WHERE id = ?";
        
        conn.query(sql, topic.id, function (err, result, fields) {
          if (!err){
            // emails.sendTopicDeletionEmail(topic);
            
            req.flash('success', `You've deleted topic: ${topic.headline}:${topic.question}.`);
            res.sendStatus(200);
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
        
        conn.query(sql, [values], function (err, result, fields) {
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

        conn.query(sql, id, function (err, result, fields) {
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

      req.flash('success', `Your suggestion has successfully been submitted and will be reviewed.`);
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
        
        conn.query(sql, suggestion.id, function (err, result, fields) {
          if (!err){
            req.flash('success', `You've deleted suggestion: ${suggestion.question}.`);
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
        
        conn.query(sql, id, function (err, result, fields) {
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

      req.flash('success', `Suggestion approved.`);
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
        
        conn.query(sql, id, function (err, result, fields) {
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

      req.flash('success', `Suggestion rejected.`);
      res.sendStatus(200);
    });
  });

}

function resToClient(res, err, json){
  if (err && err !== true){
    res.status(400).send(err.toString());
    console.error(err.toString());
  } else {
    json ? res.json(json) : res.sendStatus(200);
  }
}