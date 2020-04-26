const express = require('express');
const app = express();

const dev = process.env.NODE_ENV !== 'production';
const config = './config.env';
const isStageTesting = process.argv.includes('--stage-testing');
const isDevTesting = process.argv.includes('--dev-testing');

const next = require('next');
const server = next({ dev, quiet: isStageTesting });
const handle = server.getRequestHandler();

const async = require('async');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv').config({path: config });
const mysql = require('mysql');
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '2MB' }));
app.use(cookieParser());
app.use(cors());

// Initialise MySQL database
const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_NAME,
});

// Check for loaded environment variables
if (dotenv.error && !process.env.PORT) {
  throw new Error(`No environment variables loaded.`);
}

// Start client server
if (!isStageTesting && !isDevTesting){
  startClientServer();
}

function startClientServer(){
  startServer();
  require('./private/api.js')(app, conn);
  require('./private/routes.js')(app, conn, server);
  require('./private/cron.js')(conn);
}

function startTestServer(next){
  startServer(next);
  require('./private/api.js')(app, conn);
}

function startServer(next){
  async.parallel([
    function(callback){ // Start the server
      server.prepare().then(() => {
        app.get('*', (req, res) => handle(req, res));
        app.listen(port, (err) => {
          if (!err) console.log(`Server running on http://localhost:${port}`);
          callback(err);
        });
      });
    },
    function(callback){ // Connect to MySQL database
      conn.connect(function(err) {
        if (!err) console.log('Connected to database.');
        callback(err);
      });
    }
  ], function(err){
    if (err) throw err;
    if (next) next();
  });
}

module.exports = {
  startTestServer,
  config,
  dev,
  isStageTesting
}