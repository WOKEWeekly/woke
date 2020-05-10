const express = require('express');
const app = express();

const dev = process.env.NODE_ENV !== 'production';
const config = './config.env';
const isStageTesting = process.argv.includes('--stage-testing');
const isDevTesting = process.argv.includes('--dev-testing');

const { limits } = require('./constants/settings');

const next = require('next');
const server = next({
  dev,
  quiet: isStageTesting
});
const handle = server.getRequestHandler();

const async = require('async');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv').config({
  path: config
});
const mysql = require('mysql');
const port = process.env.PORT || 3000;
const {setDb, setKnex} = require("./private/api/db");

app.use(bodyParser.json({ limit: `${limits.file}MB` }));
app.use(cookieParser());
app.use(cors());

// TODO: To be fully replaced with Knex
// Initialise MySQL database
const conn = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PWD,
	database: process.env.MYSQL_NAME,
});

const knex = require('knex')({
	client: 'mysql',
	connection: {
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PWD,
		database: process.env.MYSQL_NAME,
	},
});
setKnex(knex);

// Check for loaded environment variables
if (dotenv.error && !process.env.PORT) {
	throw new Error(`No environment variables loaded.`);
}

// Start client server
if (!isStageTesting && !isDevTesting) {
  startClientServer();
}

function startClientServer() {
  startServer();
	require('./private/routes.js')(app, conn, knex, server);
	require('./private/cron.js')(conn);
}

function startTestServer(next) {
  startServer(next);
}

function startServer(next) {
  async.parallel([
    function (callback) { // Start the server
      server.prepare().then(() => {
        app.get('*', (req, res) => handle(req, res));
        app.listen(port, (err) => {
          if (!err) console.log(`Server running on http://localhost:${port}`);
          callback(err);
        });
      });
    },
    function (callback) { // Connect to MySQL database
      conn.connect(function (err) {
        if (!err) {
          setDb(conn);
          require('./private/api/api.js')(app, conn);
          console.log("Connected to database.");
        }
        callback(err);
      });
    }
  ], function (err) {
    if (err) throw err;
    if (next) next();
  });
}

module.exports = {
  startTestServer,
  config,
  dev,
  isStageTesting
};
