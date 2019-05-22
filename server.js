const express = require('express');
const app = express();

const emails = require('./private/emails.js');
const notifications = require('./private/notifications.js');
const CLEARANCES = require('./private/clearances.js');

const async = require('async');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config({path: '/root/config.env'});
const expressSession = require('express-session');
const flash = require('connect-flash');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const mysql = require('mysql');
const passport = require('passport');
const path = require("path");
const request = require('superagent');
const schedule = require('node-schedule');
const url = require('url');
const validator = require("email-validator");

const next = require('next');
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const server = next({ dev });
const handle = server.getRequestHandler();

server.prepare().then(() => {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());

	app.use(expressSession({
		// cookie: {maxAge: 2 * 60 * 60 * 1000},
		secret: process.env.SESSION_SECRET || "secret",
		resave: true,
		saveUninitialized: true
	}));
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());

	app.get('*', (req, res) => handle(req, res));
	app.listen(port, (err) => {
		if (err) throw err;
		console.log(`Server running on http://localhost:${port}`);
	});
});

/*******************************************
* MySQL Database
*******************************************/

/** Initialise MySQL database */
const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_NAME,
});

/** Connect to MySQL database */
conn.connect(function(err) {
  err ? (console.log(err.toString())) : console.log("Connected to database.");
});

/*******************************************
* Mailing List Subscriptions
*******************************************/

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

/*******************************************
* User Authentication
*******************************************/

/* Verify access token */
function verifyToken(req, res, next){
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    req.token = token;
    next();
  } else {
    render404PageNotFound(req, res);
  }
}

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

/** Check user is authenticated for particular pages */
function checkAuthentication(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else{
    req.flash('failed', `You must be logged in to view this resource.`);
    res.redirect('/');
  }
}

/*******************************************
* Templates & Locals
*******************************************/

/** Render locals and templates in all pages */
app.use(function (req, res, next) {
  var user = {};
  
  /** Pass authenticated user information to client */
  if (req.user){
    user.firstname = req.user.firstname;
    user.lastname = req.user.lastname;
    user.username = req.user.username;
    user.clearance = req.user.clearance;
  }
  
  /** Make locals and templates available for all client pages */
  res.locals = {
    user: JSON.stringify(user),
    isAuth: req.isAuthenticated()
  };
  next();
});

app.get('/', (req, res) => {
	return app.render(req, res, '/', req.query)
})

/**********************************
* Image Uploading to File System
*********************************/

const limits = {
  files: 1,
  fileSize: 5 * 1024 * 1024
};

const fileFilter = function(req, file, callback) {
  var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)){
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
    console.error('Invalid file type. Only jpg, png and gif image files are allowed.')
  }
};

const session_storage = multer.diskStorage({
  destination: function(req, file, callback) {callback(null, `.${sessions_dir}`);},
  filename: function (req, file, callback) {callback(null, file.originalname);}
});

const candidate_storage = multer.diskStorage({
  destination: function(req, file, callback) {callback(null, `.${blackex_dir}`);},
  filename: function (req, file, callback) {callback(null, file.originalname);}
});

const member_storage = multer.diskStorage({
  destination: function(req, file, callback) {callback(null, `.${team_dir}`);},
  filename: function (req, file, callback) {callback(null, file.originalname);}
});

const uploadSession = multer({
  storage: session_storage,
  limits: limits,
  fileFilter: fileFilter
});
const uploadCandidate = multer({
  storage: candidate_storage,
  limits: limits,
  fileFilter: fileFilter
});
const uploadMember = multer({
  storage: member_storage,
  limits: limits,
  fileFilter: fileFilter
});

/** Upload session image to directory */
app.post('/uploadSession', uploadSession.single('file'), function(req, res, err){
  if (req.file) {
    console.log("Session image successfully received.");
    res.status(200).send(req.file);
  } else {
    if (err.toString().includes("Request Entity Too Large")){
      res.status(413).send(`The file you're trying to upload is too large.`);
    } else {
      res.status(400).send(err.toString());
    }
  }
});

/** Upload canddidate image to directory */
app.post('/uploadCandidate', uploadCandidate.single('file'), function(req, res, err){
  if (req.file) {
    console.log("Candidate image successfully received.");
    res.status(200).send(req.file);
  } else {
    if (err.toString().includes("413")){
      res.status(413).send(`The file you're trying to upload is too large.`);
    } else {
      res.status(400).send(err.toString());
    }
    console.log(err.toString());
  }
});

/** Upload member image to directory */
app.post('/uploadMember', uploadMember.single('file'), function(req, res, err){
  if (req.file) {
    console.log("Member image successfully received.");
    res.status(200).send(req.file);
  } else {
    if (err.toString().includes("Request Entity Too Large")){
      res.status(413).send(`The file you're trying to upload is too large.`);
    } else {
      res.status(400).send(err.toString());
    }
  }
});

/*******************************************
* REST REQUESTS
*******************************************/

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

/** Retrieve all sessions */
app.get('/getSessions', function(req, res){
  if (req.headers['authorization'] !== 'authorized'){
    res.sendStatus(403);
  } else {
    conn.query("SELECT * FROM sessions", function (err, result) {
      if (!err){
        res.json(result);
      } else {
        res.status(400).send(err.toString());
      }
    });
  }
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

/** Add new session to database */
app.post('/addSession', verifyToken, function(req, res){
  jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
    if (err){
      res.sendStatus(403);
    } else {
      if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_SESSIONS)){
        res.status(401).send(`You are not authorised to perform such an action.`);
        return;
      }

      var session = req.body;
      var sql = "INSERT INTO sessions (title, dateHeld, image, slug, text, description, delta) VALUES ?";
      var values = [[session.title, session.dateHeld, session.image, session.slug, session.text, session.description, session.delta]];
      
      conn.query(sql, [values], function (err, result, fields) {
        if (!err){
          req.flash('success', `You've added the session: ${session.title}.`);
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

/** Update details of existing session in database */
app.put('/updateSession', verifyToken, function(req, res){
  jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
    if (err){
      res.sendStatus(403);
    } else {
      if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_SESSIONS)){
        res.status(401).send(`You are not authorised to perform such an action.`);
        return;
      }

      var session1 = req.body.sessions[0];
      var session2 = req.body.sessions[1];
      
      var sql = "UPDATE sessions SET title = ?, dateHeld = ?, image = ?, slug = ?, text = ?, description = ?, delta = ? WHERE id = ?";
      var values = [session2.title, session2.dateHeld, session2.image, session2.slug, session2.text, session2.description, session2.delta, session1.id];
      
      conn.query(sql, values, function (err, result, fields) {
        if (!err){
          req.flash('success', `You've updated the details of session: ${session2.title}.`);
          
          let image = `.${sessions_dir}${session1.image}`;
          
          /** Delete first image from file system if there was an image change */
          if (session2.change == true){
            if (session1.image !== session2.image){
              fs.unlink(image, function(err1) {
                if (!err1) {
                  console.log(`Deleted first ${session1.image} from the /sessions directory.` );
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

/** Delete an existing session from database */
app.delete('/deleteSession', verifyToken, function(req, res){
  jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
    if (err){
      res.sendStatus(403);
    } else {
      if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_SESSIONS)){
        res.status(401).send(`You are not authorised to perform such an action.`);
        return;
      }

      var session = req.body;
      var sql = "DELETE FROM sessions WHERE id = ?";
      
      conn.query(sql, session.id, function (err, result, fields) {
        if (!err){
          req.flash('success', `You've deleted session: ${session.title}.`);
          
          /** Delete image from file system */
          fs.unlink(`.${sessions_dir}${session.image}`, function(err1) {
            if (!err1) {
              res.sendStatus(200);
              console.log(`Deleted ${session.image} from the /sessions directory.` );
            } else {
              console.warn(`${session.image} not found in /sessions directory.` );
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

/** Retrieve all topics */
app.get('/getTopics', verifyToken, function(req, res){
  jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
    if (err){
      res.sendStatus(403);
    } else {
      if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.VIEW_TOPICS)){
        res.status(401).send(`You are not authorised to perform such an action.`);
        return;
      }

      conn.query("SELECT * FROM topics", function (err, result) {
        if (!err){
          res.json(result);
        } else {
          res.status(400).send(err.toString());
        }
      });
    }
  });
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

/** Add new topic to database */
app.post('/addTopic', verifyToken, function(req, res){
  jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
    if (err){
      res.sendStatus(403);
    } else {
      if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.CRUD_TOPICS)){
        res.status(401).send(`You are not authorised to perform such an action.`);
        return;
      }

      var topic = req.body;

      var sql = "INSERT INTO topics (headline, category, question, description, type, user, polarity, option1, option2) VALUES ?";
      var values = [[topic.headline, topic.category, topic.question, topic.description, topic.type, topic.user,
        topic.polarity, topic.option1, topic.option2]];
      
      conn.query(sql, [values], function (err, result, fields) {
        if (!err){
          req.flash('success', `You've added the topic: ${topic.headline}:${topic.question}.`);
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

/*******************************************
* Mobile App Specific
*******************************************/

/** Add push notification token for user */
app.post('/users/addPushToken', verifyToken, function(req, res){
  jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
    if (err){
      res.sendStatus(403);
    } else {
      const sql = "INSERT INTO user_tokens (user_id, token_string, type) VALUES (?, ?, 'push')";
      const values = [req.body.id, req.body.token];
      
      conn.query(sql, values, function (err, result, fields) {
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

app.put('/users/toggleNotificationPermissions', verifyToken, function(req, res){
  async.waterfall([
    function(callback){
      jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
        if (err){
          res.sendStatus(403);
        } else {
          callback(null);
        }
      });
    },
    function (callback){
      let { id, sessions, qotd } = req.body;

      console.log(sessions, qotd);

      let sql = "UPDATE user_tokens SET _sessions = ?, _qotd = ? WHERE user_id = ?";
      let values = [sessions, qotd, id]
      
      conn.query(sql, values, function (err, result, fields) {
        if (!err){
          callback(null);
        } else {
          res.status(400).send(err.toString());
          console.error(err.toString())
        }
      });
    }
  ], function(){
    res.sendStatus(200);
  });
});

/** Send notification to all mobile app users */
app.post('/notify', verifyToken, function(req, res){
  jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
    if (err){
      res.sendStatus(403);
    } else {
      if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.SEND_NOTIFICATIONS)){
        res.status(401).send(`You are not authorised to perform such an action.`);
        return;
      }
      
      const { title, message } = req.body;
      notifications.all(conn, title, message);
      res.sendStatus(200);
    }
  });
});

/**************
 * RESOURCES
 *************/

/** Get clearance allowances and restrictions */
app.get('/getClearances', function(req, res){
  res.json(CLEARANCES);
});

/**************
 * CRON JOBS
 *************/

/** Send Question of the Day notifications at 9:00am everyday */
schedule.scheduleJob('0 9 * * *', function(){
  let sql = `SELECT headline, question FROM topics
  WHERE polarity = 1
  AND category != 'Christian'
  AND category != 'Mental Health'
  ORDER BY RAND() LIMIT 1;`;

  conn.query(sql, function (err, result, fields) {
    if (!err){
      let topic = result[0];
      let title = `QOTD: ${topic.headline}`;
      let message = topic.question;
      notifications.all(conn, title, message, 'qotd');
    } else {
      console.log(err.toString());
    }
  });
});

/** Notify any sessions happening on current day at 10:00am */
schedule.scheduleJob('0 10 * * *', function(){
  conn.query("SELECT * FROM sessions WHERE dateHeld = CURDATE()", function (err, result, fields) {
    if (!err){
      for (let session of result) {
        let title = 'New Session Today!';
        let message = `${session.title} is taking place today!`;
        notifications.all(conn, title, message, 'sessions');
      }
    } else {
      console.log(err.toString());
    }
  });
});

/** Notify executives of team member birthdays */
schedule.scheduleJob('0 0 * * *', function(){
  conn.query("SELECT * FROM team WHERE DATE_FORMAT(birthday,'%m-%d') = DATE_FORMAT(CURDATE(),'%m-%d')", function (err, result, fields) {
    if (!err){
      for (let member of result) {
        let title = '';
        let message = `It's ${member.firstname} ${member.lastname}'s birthday today!`;
        notifications.exec(conn, title, message);
      }
    } else {
      console.log(err.toString());
    }
  });
});