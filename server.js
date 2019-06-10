const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config({path: './config.env'});
const expressSession = require('express-session');
const flash = require('connect-flash');
const mysql = require('mysql');
const passport = require('passport');
const request = require('superagent');
const url = require('url');

const next = require('next');
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const server = next({ dev });
const handle = server.getRequestHandler();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

server.prepare().then(() => {
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
* Templates & Locals
*******************************************/

/** Render locals */
app.use(function (req, res, next) {
  var user = {};
  
  /** Pass authenticated user information to client */
  if (req.user){
    user.firstname = req.user.firstname;
    user.lastname = req.user.lastname;
    user.username = req.user.username;
    user.clearance = req.user.clearance;
  }
  
  res.locals = {
    user: JSON.stringify(user),
    isAuth: req.isAuthenticated()
  };

  next();
});

/*******************************************
* Microservices
*******************************************/

require('./private/api.js')(app, conn);
require('./private/auth.js')(app, conn, passport);
require('./private/cron.js')(conn);
require('./private/mobile.js')(app, conn);
require('./private/routes.js')(app, conn, server);

const emails = require('./private/emails.js');
const notifications = require('./private/notifications.js');