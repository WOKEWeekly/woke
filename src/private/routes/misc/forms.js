const express = require('express');
const router = express.Router();

const { forms } = require('../../../constants/settings.js');

/** Recruitment Form */
router.get('/recruitment-form', function (req, res) {
  res.writeHead(301, {
    Location: forms.recruitment
  });
  res.end();
});

/** Audience Review Form */
router.get('/feedback', function (req, res) {
  res.writeHead(301, {
    Location: forms.audienceFeedback
  });
  res.end();
});

/** Client Review Form */
router.get('/feedback/client', function (req, res) {
  res.writeHead(301, {
    Location: forms.clientFeedback
  });
  res.end();
});

/** Membership Form */
router.get('/membership-form', function (req, res) {
  res.writeHead(301, {
    Location: forms.membership
  });
  res.end();
});

module.exports = router;