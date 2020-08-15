/* eslint-disable import/order */
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
const port = isStageTesting ? 3010 : process.env.PORT || 3000;
const { setApp } = require('./private/singleton/app');
const { setKnex } = require('./private/singleton/knex');
const { setServer } = require('./private/singleton/server');

app.use(bodyParser.json({ limit: `${limits.file}MB` }));
app.use(cookieParser());
app.use(cors());

// Initialise MySQL database
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PWD,
    database: process.env.MYSQL_NAME
  }
});

/** Start the server including client functions. */
const startClientServer = () => {
  startServer();
  setServer(server);
  require('./private/routes');
  require('./private/cron')();
};

/**
 * Start the server for testing.
 * @param {Function} done - The Mocha completion signal.
 */
const startTestServer = (done) => {
  startServer(done);
};

/**
 * Start the server.
 * @param {Function} [done] - The possible Mocha completion signal.
 */
const startServer = (done) => {
  async.parallel(
    [
      // Start the server
      function (callback) {
        server.prepare().then(() => {
          app.get('*', (req, res) => handle(req, res));
          app.listen(port, (err) => {
            if (!err)
              console.info(`Server running on http://localhost:${port}`);
            callback(err);
          });
        });
      },
      // Set database instances
      function (callback) {
        setApp(app);
        setKnex(knex);
        require('./private/api');
        callback(null);
      }
    ],
    function (err) {
      if (err) throw err;
      if (done) done();
    }
  );
};

module.exports = {
  startTestServer,
  config,
  dev,
  port,
  isStageTesting
};

// Check for loaded environment variables
if (dotenv.error && !process.env.PORT) {
  throw new Error(`No environment variables loaded.`);
}

// Start client server
if (!isStageTesting && !isDevTesting) {
  startClientServer();
}
