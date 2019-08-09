const LocalStrategy = require('passport-local').Strategy;
const validator = require("email-validator");
const async = require('async');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middleware.js');
const emails = require('./emails.js');
const { validateReq} = require('./middleware.js');
const { resToClient, renderErrPage } = require('./response.js');

module.exports = function(app, conn, passport, server){
  
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
          if (err) return callback(err);

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
          if (err) return callback(err);

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
          if (err) return callback(err);

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
          if (err) return callback(err);
          emails.sendWelcomeEmail(user, salt);
          callback(null);
        });
      },
      function(callback){ // Pass authenticated user information to client
        jwt.sign({user: req.user}, process.env.JWT_SECRET, (err, token) => {
          if (err) return callback(err);
          
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

  /** Change user's username in database */
  app.put('/changeUsername', validateReq, function(req, res){
    const { id, username } = req.body;
    const sql = "UPDATE user SET username = ? WHERE id = ?";
    const values = [username, id];
    
    conn.query(sql, values, function(err, result){
      resToClient(res, err);
    });
  });

  /** Change user's password in database */
  app.put('/changePassword', validateReq, function(req, res){
    const { id, oldPassword, newPassword } = req.body;

    async.waterfall([
      function(callback){ // Get current password of user
        const sql = `SELECT * FROM user WHERE ID = ?`;
        conn.query(sql, id, function(err, result){
          err ? callback(err) : callback(null, result[0].password);
        });
      },
      function(password, callback){ // Verify that current password is valid
        if (!(bcrypt.compareSync(oldPassword, password) || oldPassword == password)) {
          callback(new Error(`Your current password is incorrect.`));
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
        const sql = "UPDATE user SET password = ? WHERE id = ?";
        const values = [hash, id];
        conn.query(sql, values, function(err){
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Delete user account */
  app.delete('/deleteAccount', validateReq, function(req, res){
    const { id } = req.body;

    async.waterfall([
      function(callback){
        conn.query('DELETE FROM user_tokens WHERE user_id = ?', id, function(err){	
          err ? callback(err) : callback(null);
        });
      },
      function(callback){
        conn.query('DELETE FROM suggestions WHERE user_id = ?', id, function(err){	
          err ? callback(err) : callback(null);
        });
      },
      function(callback){
        req.logout();
        
        conn.query("DELETE FROM user WHERE id = ?", id, function(err){	
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Resend the verification email to user's email address */
  app.notify('/resendVerificationEmail', validateReq, function(req, res){
    const { id } = req.body;
    
    async.waterfall([
      function(callback){ // Retrieve user and token string from database
        const sql = `SELECT * from user
        INNER JOIN user_tokens on user.id = user_tokens.user_id
        WHERE (user.id, user_tokens.type) = (?, ?)`;
        const values = [id, 'verification'];
        
        conn.query(sql, values, function(err, result){	
          if (err) return callback(err);
          const user = result[0];
          callback(null, user, user.token_string);
        });
      },
      function(user, salt, callback){ // Resend verification email to user
        emails.resendVerificationEmail(user, salt);
        callback(null);
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Change user's username in database */
  app.get('/verifyAccount/:id/:token', function(req, res){
    const { id, token } = req.params;
    
    async.waterfall([
      function(callback){ /** Determine user account */
        const sql = "SELECT * FROM user_tokens WHERE (user_id, token_string, type) = (?, ?, ?)";
        const values = [id, token, 'verification'];
        
        conn.query(sql, values, function(err, result){
          if (result.length > 0){
            err ? callback(err) : callback(null);
          } else {
            callback(new Error(`User account doesn't exist.`));
          }
        });
      },
      function(callback){ /** Determine user clearance level */
        conn.query('SELECT clearance FROM user WHERE id = ?', id, function(err, result){
          err ? callback(err) : callback(null, result[0].clearance);	
        });
      },
      function(clearance, callback){ /** Verify account by changing user clearance to verified */
        if (clearance === 1){
          conn.query('UPDATE user SET clearance = 2 WHERE id = ?', id, function(err){	
            err ? callback(err) : callback(null);
          });
        } else {
          callback(new Error(`Verification not required.`));
        }
      },
      function(callback){ /** Delete verification token */
        const sql = 'DELETE FROM user_tokens WHERE (user_id, type) = (?, ?)';
        const values = [id, 'verification'];
        conn.query(sql, values, function(err){		
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      err ? renderErrPage(req, res, err, server) : res.redirect('/account');
    });
  });

  /** Send reset password email */
  app.notify('/sendAccountRecoveryEmail', validateReq, function(req, res){
    const { email } = req.body;
    
    async.waterfall([
      function(callback){ /** Retrieve user from email */
        conn.query(`SELECT * FROM user WHERE email = ?`, email, function(err, result){
          err ? callback(err) : callback(null, result[0]);
        });
      },
      function(user, callback){ // Check if email is already in recovery
        const sql = `SELECT * FROM user_tokens WHERE (user_id, type) = (?, ?)
          AND create_time > DATE_SUB(NOW(), INTERVAL 30 MINUTE);`;
        const values = [user.id, 'recovery'];

        conn.query(sql, values, function(err, result){
          if (err) return callback(err);
          if (result.length) return callback(new Error('Your account is already attempting to recovery. Please check your email.'));
          
          callback(null, user);
        });
      },
      function(user, callback){ /** Generate recovery token to be sent via email */
        bcrypt.genSalt(8, function(err, salt) {
          err ? callback(err) : callback(null, user, salt);
        });
      },
      function(user, salt, callback){ /** Store recovery token in database */
        const sql = "INSERT INTO user_tokens (user_id, token_string, type) VALUES ?";
        const values = [[user.id, salt, 'recovery']];
        
        conn.query(sql, [values], function(err){	
          err ? callback(err) : callback(null, user, salt);
        });
      },
      function(user, salt, callback){ // Send account recovery email with link to reset password
        emails.sendAccountRecoveryEmail(user, salt);
        callback(null);
      },
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Reset user password */
  app.put('/resetPassword', function(req, res){
    const { id, token, password } = req.body;
    
    async.waterfall([
      function(callback){ /** Determine user account */
        const sql = "SELECT * FROM user_tokens WHERE (user_id, token_string, type) = (?, ?, ?)";
        const values = [id, token, 'recovery'];
        
        conn.query(sql, values, function(err, result){
          if (result.length > 0){
            err ? callback(err) : callback(null);
          } else {
            callback(new Error(`User account doesn't exist.`));
          }
        });
      },
      function(callback){ // Hash new password
        bcrypt.hash(password, 8, function(err, hash) {
          err ? callback(err) : callback(null, hash);
        });
      },
      function(hash, callback){
        const sql = "UPDATE user SET password = ? WHERE id = ?";
        const values = [hash, id];
        conn.query(sql, values, function(err){
          err ? callback(err) : callback(null);
        });
      },
      function(callback){ /** Delete recovery token */
        const sql = 'DELETE FROM user_tokens WHERE (user_id, type) = (?, ?)';
        const values = [id, 'recovery'];
        conn.query(sql, values, function(err){	
          err ? callback(err) : callback(null);
        });
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /****************************
   * CHECKPOINT
   ***************************/
  
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