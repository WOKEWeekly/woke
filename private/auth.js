const LocalStrategy = require('passport-local').Strategy;
const validator = require("email-validator");
const async = require('async');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    
    ({ username, password } = req.body);
    
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
          err ? callback(err) : callback(null, user);

          // /** If remember checked, maintain session for 30 days */
          // if (req.body.remember) {
          //   req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
          // } else {
          //   req.session.cookie.expires = false;
          // }
        });
      },
      function(user, callback){ // Update last login time for user
        const sql = `UPDATE user SET last_login = ? WHERE id = ?`;
        const values = [new Date(), user.id];
        
        conn.query(sql, values, function() {
          callback(null);
        });
      },
      function(callback){ // Pass authenticated user information to mobile app */
        jwt.sign( { user: req.user }, process.env.JWT_SECRET,
          { expiresIn: req.body.remember ? '30d' : '2h' }, (err, token) => {
          if (err) return callback(err);

          const { id, firstname, lastname, username, clearance } = req.user;
          const user = { id, firstname, lastname, username, clearance, token };
          
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
    resToClient(res, null);
  });
  
  /** Sign up a new user */
  app.post('/signup', validateReq, function(req, res){
    const { firstname, lastname, email, username, password1, password2, subscribe} = req.body;
    
    if (!validator.validate(email)) return resToClient(res, new Error("Your email address is invalid."));
    if (password1 !== password2) return resToClient(res, new Error("Your passwords do not match."));
    
    async.waterfall([
      function(callback){  /** Hash entered password */
        bcrypt.hash(password1, 8, function(err, hash) {
          err ? callback(err) : callback(null, hash);
        });
      },
      function(hash, callback){ /** Insert new user into database */
        const sql = "INSERT INTO user (firstname, lastname, clearance, email, username, password) VALUES ?";
        const values = [[firstname, lastname, 1, email, username, hash]];

        conn.query(sql, [values], function(err, result){	
          if (err) return callback(err);

          console.log(`New user ${firstname} ${lastname} signed up.`);
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
      function(user, callback){ /** Generate verification token to be sent via email */
        jwt.sign({user}, process.env.JWT_SECRET, { expiresIn: '24h'}, (err, token) => {
          err ? callback(err) : callback(null, user, token);
        });
      },
      function(user, token, callback){ // Send welcome email with verification link to user's email address
        req.login(user, function(err) {
          if (err) return callback(err);
          emails.sendWelcomeEmail(user, token);
          callback(null);
        });
      },
      function(callback){ // Pass authenticated user information to client with access token
        jwt.sign({user: req.user}, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
          if (err) return callback(err);
          
          const { id, firstname, lastname, username, clearance } = req.user;
          const user = { id, firstname, lastname, username, clearance, token };
          
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
    
    conn.query(sql, values, function(err){
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
        const sql = `SELECT id, firstname, lastname, clearance, username, email FROM user WHERE id = ?`;
        
        conn.query(sql, id, function(err, result){	
          err ? callback(err) : callback(null, result[0]);
        });
      },
      function(user, callback){ // Generate verification token to send via email
        jwt.sign({user}, process.env.JWT_SECRET, { expiresIn: '30m'}, (err, token) => {
          err ? callback(err) : callback(null, user, token);
        });
      },
      function(user, token, callback){ // Resend verification email to user
        emails.resendVerificationEmail(user, token);
        callback(null);
      }
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Change user's username in database */
  app.get('/verifyAccount/:token', function(req, res){
    const { token } = req.params;
    
    async.waterfall([
      function(callback){ // Verify the given token
        jwt.verify(token, process.env.JWT_SECRET, (err, auth) => {
          err ? callback(err) : callback(null, auth.user);
        });
      },
      function(user, callback){ /** Verify account by changing user clearance to verified */
        if (user.clearance === 1){
          conn.query('UPDATE user SET clearance = 2 WHERE id = ?', user.id, function(err){	
            err ? callback(err) : callback(null);
          });
        } else {
          callback(new Error(`Verification not required.`));
        }
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
        conn.query(`SELECT id, firstname, lastname, clearance, email, username FROM user WHERE email = ?`, email, function(err, result){
          err ? callback(err) : callback(null, result[0]);
        });
      },
      function(user, callback){ /** Generate recovery token to be sent via email */
        jwt.sign({user}, process.env.JWT_SECRET, { expiresIn: '30m'}, (err, token) => {
          err ? callback(err) : callback(null, user, token);
        });
      },
      function(user, token, callback){ // Send account recovery email with link to reset password
        emails.sendAccountRecoveryEmail(user, token);
        callback(null);
      },
    ], function(err){
      resToClient(res, err);
    });
  });

  /** Reset user password */
  app.put('/resetPassword', function(req, res){
    const { token, password } = req.body;
    
    async.waterfall([
      function(callback){ // Verify the given token
        jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
          err ? callback(err) : callback(null, result.user);
        });
      },
      function(user, callback){ // Hash new password
        bcrypt.hash(password, 8, function(err, hash) {
          err ? callback(err) : callback(null, user.id, hash);
        });
      },
      function(id, hash, callback){
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