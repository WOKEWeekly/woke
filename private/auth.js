const LocalStrategy = require('passport-local').Strategy;
const validator = require("email-validator");
const async = require('async');
const { verifyToken } = require('./middleware.js');

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
    
    var sql = `SELECT * FROM user WHERE Username = ? OR Email = ?`;
    var values = [username, username];
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
  app.post('/login', passport.authenticate('login'), function(req, res){
    
    if (req.user){
      console.log("Logging in for user " + req.user.firstname + ".");
      req.flash('positive', `Welcome, ${req.user.firstname}!`);
    } else {
      res.status(400).send("Invalid user");
    }
    
    /** If remember checked, maintain session for 30 days */
    if (req.body.remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      req.session.cookie.expires = false;
    }
    
    /** Pass authenticated user information to mobile app */
    jwt.sign({user: req.user}, process.env.JWT_SECRET, (err, token) => {
      var user = {};
      user.id = req.user.id;
      user.firstname = req.user.firstname;
      user.lastname = req.user.lastname;
      user.username = req.user.username;
      user.clearance = req.user.clearance;
      user.token = token;
      
      res.json(user);
    });  
  });
  
  /** Log user out */
  app.post('/logout', function(req, res){
    req.logout();
    req.flash('positive', 'You are now logged out.');
    res.redirect('/');
  });
  
  /** Sign up a new user */
  app.post('/signup', function(req, res){
    var user = req.body;
    
    if (!validator.validate(user.email)) res.status(400).send("Your email address is invalid.");
    if (user.password !== user.password2) res.status(400).send("Your passwords do not match.");
    
    async.waterfall([
      function(callback){
        /** Hash entered password */
        bcrypt.hash(user.password, 8, function(err, hash) {
          if (!err){
            var sql = "INSERT INTO user (firstname, lastname, clearance, email, username, password) VALUES ?";
            var values = [[user.firstname, user.lastname, 1, user.email, user.username, hash]];
            callback(null, sql, values);
          } else {
            throw err;
          } 
        });
      },
      /** Insert new user into database */
      function(sql, values, callback){
        conn.query(sql, [values], function(err, result){	
          if (!err){
            console.log(`New user ${user.firstname} ${user.lastname} signed up.`);
            user.id = result.insertId;
            
            // Subscribe user to mailing list if allowed
            if (user.subscribe) subscribeUserToMailingList(user);
            callback(null, user.id);
          } else {
            // Addition of user to database failed
            if (err.toString().includes("Duplicate entry")){
              res.status(409).send(`A user with this email already exists. Please use a different email address.`);
            } else {
              throw err;
            }
          }
        });
      },
      /** Generate verification token to be sent via email */
      function(id, callback){
        bcrypt.genSalt(8, function(err, salt) {
          if (!err){
            callback(null, id, salt);
          } else {
            throw err;
          } 
        });
      },
      /** Store verification token in database */
      function(id, salt, callback){
        var sql = "INSERT INTO user_tokens (user_id, token_string, type) VALUES ?";
        var values = [[id, salt, 'verification']];
        
        conn.query(sql, [values], function(err, result){	
          if (!err){
            callback(null, salt);
          } else {
            throw err;
          }
        });
      }
    ], function(error, salt){
      /** Log user in */
      if (!error){
        req.login(user, function(err) {
          if (!err) {
            // Send welcome email with verification link to user's email address
            // emails.sendWelcomeEmail(user, salt);
            
            req.flash('positive', `Congratulations, ${user.firstname}, you have successfully signed up to the #WOKEWeekly website!`);
            res.sendStatus(200);
          } else {
            res.status(400).send(err.toString());
          }
        });
      } else {
        res.status(400).send(error.toString());
        console.error(error.toString());
      }
    });
  });
  
  /** Change user's username in database */
  app.get('/verifyAccount/:id/:token', function(req, res){
    var { id, token } = req.params;
    
    async.waterfall([
      /** Determine user account */
      function(callback){
        var sql = "SELECT * FROM user_tokens WHERE (user_id, token_string) = (?, ?)";
        var values = [id, token];
        
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
        var sql = "SELECT clearance FROM user WHERE id = ?";
        
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
          
          var sql = "UPDATE user SET clearance = 2 WHERE id = ?";
          
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
        var sql = "DELETE FROM user_tokens WHERE user_id = ?";
        
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
        req.flash('positive', `You've successfully verified your account.`);
        res.redirect('/');
      } else {
        res.sendStatus(400);
        console.log(err.toString());
      }
    });
  });
  
  /** Resend the verification email to user's email address */
  app.post('/resendVerificationEmail', verifyToken, function(req, res){
    var id = req.body.id;
    
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
        var sql = `SELECT * from user
        INNER JOIN user_tokens on user.id = user_tokens.user_id
        WHERE (user.id, user_tokens.type) = (?, ?)`;
        var values = [id, 'verification'];
        
        conn.query(sql, values, function(err, result){	
          if (!err){
            var user = result[0];
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
        var sql = "UPDATE user SET username = ? WHERE id = ?";
        var values = [req.body.username, auth.user.id];
        
        conn.query(sql, values, function(err, result){	
          if (!err){
            req.flash('success', `You've successfully changed your username.`);
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
        var old_password = req.body.old_password;
        var new_password = req.body.new_password;
        
        var sql = `SELECT * FROM user WHERE ID = ?`;
        var id = auth.user.id;
        
        conn.query(sql, id, function(err, result){
          if (!(bcrypt.compareSync(old_password, result[0].password) || old_password == result[0].password)) {
            res.status(400).send(`Your current password is incorrect.`);
          } else {
            bcrypt.hash(new_password, 8, function(err, hash) {
              if (!err){
                var sql = "UPDATE user SET password = ? WHERE id = ?";
                var values = [hash, id];
                
                conn.query(sql, values, function(err1, result){
                  if (!err1){
                    req.flash('success', `You've successfully changed your password.`);
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
            req.flash('success', `Your account has successfully been deleted.`);
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
  
  /** Get all email address and usernames of users signed up to website */
  app.get('/getAllUserLogins', function(req, res){
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      conn.query("SELECT email, username FROM user;", function (err, result, fields) {
        if (!err){
          res.json(result);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
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
        
        var user = req.body;
        var sql = "UPDATE user SET clearance = ? WHERE id = ?";
        var values = [user.clearance, user.id];
        
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