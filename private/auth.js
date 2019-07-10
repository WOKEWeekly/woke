const LocalStrategy = require('passport-local').Strategy;
const validator = require("email-validator");
const async = require('async');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middleware.js');
const emails = require('./emails.js');
const { validateReq} = require('./middleware.js');
const { resToClient } = require('./response.js');

module.exports = function(app, conn, passport){
  
  /* Used to serialize the user for the session */
  passport.serializeUser(function(user, done) {
    console.log("Serialising user:", user.firstname);
    done(null, user.id);
  });
  
  /* Used to deserialize the user */
  passport.deserializeUser(function(id, done) {
    conn.query(`SELECT * FROM user WHERE ID = ?`, id, function(err, rows){
      done(err, rows[0]);
    });
  });
  
  passport.use('login', new LocalStrategy({
    passReqToCallback: true
  }, function(req, username, password, done) {
    
    username = req.body.username;
    password = req.body.password;
    
    const sql = `SELECT * FROM user WHERE Username = ? OR Email = ?`;
    const values = [username, username];
    
    conn.query(sql, values, function(err, rows){
      if (err) return done(err);
      
      /** If the user isn't found... */
      if (!rows.length) {
        return done(null, false);
      }
      
      /** Compare passwords with hash */
      if(!bcrypt.compareSync(password, rows[0].password) && !(rows[0].password == password)) {
        return done(null, false);
      }
      
      /** Everything's okay. Return successful user */
      return done(null, rows[0]);
    });
  }));
  
  /* Authenticate user login */
  app.post('/login', function(req, res, next){
    async.waterfall([
      function(callback){
        passport.authenticate('login', function(err, user){ // Authenticate user
          if (err) return callback(err);
          if (!user) return callback(new Error('Incorrect username or password.'));
          
          callback(null, user);
        })(req, res, next);
      },
      function(user, callback){ // Log user session
        req.login(user, function(err) {
          if (err) callback(err);

          /** If remember checked, maintain session for 30 days */
          if (req.body.remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
          } else {
            req.session.cookie.expires = false;
          }

          callback(null);
        });
      },
      function(callback){ // Pass authenticated user information to mobile app */
        jwt.sign({user: req.user}, process.env.JWT_SECRET, (err, token) => {
          if (err) callback(err);

          const user = {
            id: req.user.id,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            username: req.user.username,
            clearance: req.user.clearance,
            token: token
          };
          
          callback(null, user);
        });
      }
    ], function(err, user){
      resToClient(res, err, user);
    });
  });
  
  /** Log user out */
  app.post('/logout', function(req, res){
    req.logout();
    res.sendStatus(200);
  });
  
  /** Sign up a new user */
  app.post('/signup', validateReq, function(req, res){
    const user = req.body;
    
    if (!validator.validate(user.email)) return resToClient(res, new Error("Your email address is invalid."));
    if (user.password1 !== user.password2) return resToClient(res, new Error("Your passwords do not match."));
    
    async.waterfall([
      function(callback){  /** Hash entered password */
        bcrypt.hash(user.password1, 8, function(err, hash) {
          err ? callback(err) : callback(null, hash);
        });
      },
      function(hash, callback){ /** Insert new user into database */
        const sql = "INSERT INTO user (firstname, lastname, clearance, email, username, password) VALUES ?";
        const values = [[user.firstname, user.lastname, 1, user.email, user.username, hash]];

        conn.query(sql, [values], function(err, result){	
          if (err) callback(err);

          console.log(`New user ${user.firstname} ${user.lastname} signed up.`);
          user.id = result.insertId;
          
          // Subscribe user to mailing list if allowed
          if (user.subscribe) subscribeUserToMailingList(user);
          callback(null, user.id);
        });
      },
      function(id, callback){ /** Generate verification token to be sent via email */
        bcrypt.genSalt(8, function(err, salt) {
          err ? callback(err) : callback(null, id, salt);
        });
      },
      function(id, salt, callback){ /** Store verification token in database */
        const sql = "INSERT INTO user_tokens (user_id, token_string, type) VALUES ?";
        const values = [[id, salt, 'verification']];
        
        conn.query(sql, [values], function(err, result){	
          err ? callback(err) : callback(null, salt);
        });
      },
      function(salt, callback){ // Send welcome email with verification link to user's email address
        req.login(user, function(err) {
          if (err) callback(err);
          emails.sendWelcomeEmail(user, salt);
          callback(null);
        });
      },
      function(callback){ // Pass authenticated user information to client
        jwt.sign({user: req.user}, process.env.JWT_SECRET, (err, token) => {
          if (err) callback(err);
          
          const user = {
            id: req.user.id,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            username: req.user.username,
            clearance: req.user.clearance,
            token: token
          };
          
          callback(null, user);
        });
      }
    ], function(err, user){
      resToClient(res, err, user);
    });
  });

  /****************************
   * CHECKPOINT
   ***************************/
  
  /** Change user's username in database */
  app.get('/verifyAccount/:id/:token', function(req, res){
    const { id, token } = req.params;
    
    async.waterfall([
      /** Determine user account */
      function(callback){
        const sql = "SELECT * FROM user_tokens WHERE (user_id, token_string) = (?, ?)";
        const values = [id, token];
        
        conn.query(sql, values, function(err, result){	
          if (!err){
            callback(null, result.length);
          } else {
            res.sendStatus(400);
            console.log(err.toString());
          }
        });
      },
      /** Determine user clearance level */
      function(length, callback){
        const sql = "SELECT clearance FROM user WHERE id = ?";
        
        if (length > 0){
          conn.query(sql, id, function(err, result){	
            if (!err){
              callback(null, result[0].clearance);
            } else {
              res.sendStatus(400);
              console.log(err.toString());
            }
          });
        } else {
          res.sendStatus(400);
        }
      },
      /** Verify account by changing user clearance to verified */
      function(clearance, callback){
        if (clearance < 2){
          
          const sql = "UPDATE user SET clearance = 2 WHERE id = ?";
          
          conn.query(sql, id, function(err, result){	
            if (!err){
              callback(null);
            } else {
              res.sendStatus(400);
              console.log(err.toString());
            }
          });
        } else {
          res.sendStatus(200);
        }
      },
      /** Delete verification token */
      function(callback){
        const sql = "DELETE FROM user_tokens WHERE user_id = ?";
        
        conn.query(sql, id, function(err, result){	
          if (!err){
            callback(null);
          } else {
            res.sendStatus(400);
            console.log(err.toString());
          }
        });
      }
    ], function(err){
      if (!err){
                res.redirect('/');
      } else {
        res.sendStatus(400);
        console.log(err.toString());
      }
    });
  });
  
  /** Resend the verification email to user's email address */
  app.post('/resendVerificationEmail', verifyToken, function(req, res){
    const id = req.body.id;
    
    async.waterfall([
      /** Verify token */
      function(callback){
        jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
          if (err){
            res.sendStatus(403);
            console.error(err.toString());
          } else {
            callback(null);
          }
        });
      },
      /** Retrieve user and token string from database */
      function(callback){
        const sql = `SELECT * from user
        INNER JOIN user_tokens on user.id = user_tokens.user_id
        WHERE (user.id, user_tokens.type) = (?, ?)`;
        const values = [id, 'verification'];
        
        conn.query(sql, values, function(err, result){	
          if (!err){
            const user = result[0];
            callback(null, user, user.token_string);
          } else {
            res.status(400).send(error.toString());
            console.error(err.toString());
          }
        });
      },
      /** Resend verification email to user */
    ], function(err, user, salt){
      if (!err){
        emails.resendVerificationEmail(user, salt);
        res.sendStatus(200);
      } else {
        res.status(400).send(error.toString());
        console.error(err.toString);
      }
    });
  });
  
  
  /** Change user's username in database */
  app.put('/changeUsername', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        const sql = "UPDATE user SET username = ? WHERE id = ?";
        const values = [req.body.username, auth.user.id];
        
        conn.query(sql, values, function(err, result){	
          if (!err){
                        res.sendStatus(200);
          } else {
            res.status(400).send(err.toString());
          }
        });
      }
    });
  });
  
  /** Change user's password in database */
  app.put('/changePassword', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        const old_password = req.body.old_password;
        const new_password = req.body.new_password;
        
        const sql = `SELECT * FROM user WHERE ID = ?`;
        const id = auth.user.id;
        
        conn.query(sql, id, function(err, result){
          if (!(bcrypt.compareSync(old_password, result[0].password) || old_password == result[0].password)) {
            res.status(400).send(`Your current password is incorrect.`);
          } else {
            bcrypt.hash(new_password, 8, function(err, hash) {
              if (!err){
                const sql = "UPDATE user SET password = ? WHERE id = ?";
                const values = [hash, id];
                
                conn.query(sql, values, function(err1, result){
                  if (!err1){
                                        res.sendStatus(200);
                  } else {
                    res.status(400).send(err1.toString());
                  }
                });
              } else {
                res.status(400).send(err.toString());
              }
            });
          } 
        });
      }
    });
  });
  
  /** Delete user account */
  app.delete('/deleteUser', verifyToken, function(req, res){
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
        conn.query('DELETE FROM user_tokens WHERE user_id = ?', req.body.id, function(err, result){	
          if (!err){
            callback(null);
          } else {
            res.status(400).send(err.toString());
            console.error(err.toString());
          }
        });
      },
      function(callback){
        conn.query('DELETE FROM suggestions WHERE user_id = ?', req.body.id, function(err, result){	
          if (!err){
            callback(null);
          } else {
            res.status(400).send(err.toString());
            console.error(err.toString());
          }
        });
      },
      function(callback){
        req.logout();
        
        conn.query("DELETE FROM user WHERE id = ?", req.body.id, function(err, result){	
          if (!err){
                        res.sendStatus(200);
          } else {
            res.status(400).send(err.toString());
            console.error(err.toString());
          }
        });
      }
    ], function(err){
      
    });
  });
  
  /** Retrieve all users */
  app.get('/getRegisteredUsers', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.VIEW_USERS)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }
        
        conn.query("SELECT id, firstname, lastname, clearance, username, email, create_time FROM user;", function (err, result, fields) {
          if (!err){
            res.json(result);
          } else {
            res.status(400).send(err.toString());
          }
        });
      }
    });
  });
  
  /** Change user's clearance */
  app.put('/changeClearance', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CHANGE_CLEARANCE)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }
        
        const user = req.body;
        const sql = "UPDATE user SET clearance = ? WHERE id = ?";
        const values = [user.clearance, user.id];
        
        conn.query(sql, values, function(err, result){	
          if (!err){
            res.sendStatus(200);
          } else {
            res.status(400).send(err.toString());
          }
        });
      }
    });
  });
}

/** Subscribe new user to Mailchimp mailing list */
function subscribeUserToMailingList(user){
  request
  .post(`https://${process.env.MAILCHIMP_INSTANCE}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LISTID}/members/`)
  .set({
    'Content-Type': 'application/json;charset=utf-8',
    'Authorization': 'Basic ' + new Buffer(`any:${process.env.MAILCHIMP_API_KEY}`).toString('base64')
  })
  .send({
    'email_address': user.email,
    'status': 'subscribed',
    'merge_fields': {
      'FNAME': user.firstname,
      'LNAME': user.lastname
    }
  })
  .end(function(err, response) {
    if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
      console.log(`Signed up user ${user.firstname} ${user.lastname} to mailing list.`);
    } else {
      console.log(err.toString());
    }
  });
}