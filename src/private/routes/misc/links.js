const express = require('express');
const router = express.Router();

const { accounts } = require('../../../constants/settings.js');

/** Link to Spotify */
router.get('/spotify', function (req, res) {
  res.writeHead(301, {
    Location: accounts.spotify
  });
  res.end();
});

/** Subscribe to YouTube */
router.get('/youtube', function (req, res) {
  res.writeHead(301, {
    Location: accounts.youtube
  });
  res.end();
});

/** Current zoom link */
router.get('/zoom', function (req, res) {
  res.writeHead(301, {
    Location: accounts.zoom,
    'Cache-Control': 'no-cache'
  });
  res.end();
});

/** Join Slack workspace link */
router.get('/slack', function (req, res) {
  res.writeHead(301, {
    Location: accounts.slack,
    'Cache-Control': 'no-cache'
  });
  res.end();
});

/** Join Trello team link */
router.get('/trello', function (req, res) {
  res.writeHead(301, {
    Location: accounts.trello,
    'Cache-Control': 'no-cache'
  });
  res.end();
});

module.exports = router;