const express = require('express');
const app = express();

const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const config = process.env.LOCAL_ENV ? '../../config.env' : '/home/config/config.env';
const server = next({ dev });
const handle = server.getRequestHandler();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv').config({path: config });
const mysql = require('mysql');
const passport = require('passport');
const port = parseInt(process.env.PORT, 10) || 3000;

app.use(bodyParser.json({ limit: '2MB' }));
app.use(cookieParser());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

if (dotenv.error) {
  throw new Error("Environment file either doesn't exist or cannot be found.");
}

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
require('./private/cron.js')(conn);

module.exports = { config }