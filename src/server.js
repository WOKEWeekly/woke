const express = require('express');
const app = express();

const next = require('next');
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
// const config = dev ? '../../config.env' : '/home/config.env';
const config = '/home/config.env';
const server = next({ dev });
const handle = server.getRequestHandler();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv').config({path: config});
const expressSession = require('express-session');
const mysql = require('mysql');
const passport = require('passport');
const url = require('url');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use(expressSession({
  name: 'wokeSession',
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  unset: 'destroy'
}));
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
  console.log(err ? err.toString() : 'Connected to database.');
});

/*******************************************
* Microservices
*******************************************/

require('./private/api.js')(app, conn);
require('./private/auth.js')(app, conn, passport, server);
require('./private/routes.js')(app, conn, server);
// require('./private/cron.js')(conn);
// require('./private/mobile.js')(app, conn);
// require('./private/notifications.js');

module.exports = { config }