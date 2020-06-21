const async = require('async');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const knex = require('../singleton/knex').getKnex();
const { renderErrorPage } = require('../response');
const server = require('../singleton/server').getServer();

/** User account page */
router.get('/', (req, res) => {
  const token = req.query.verify;

  async.waterfall(
    [
      // Checks if attempt at verifying account.
      function (callback) {
        callback(token ? null : true);
      },
      // Verify the given token.
      function (callback) {
        jwt.verify(token, process.env.JWT_SECRET, (err, { user } = {}) => {
          callback(err, user);
        });
      },
      // Change user's clearance to indicate verification.
      function (user, callback) {
        if (user.clearance > 1) {
          return callback(null, false);
        }
        const query = knex('users')
          .update({
            clearance: 2
          })
          .where('id', user.id);
        query.asCallback(function (err) {
          if (err) return callback(err);
          user.clearance = 2;
          callback(null, true, user);
        });
      }
    ],
    function (err, justVerified, user = {}) {
      if (err && typeof err === 'object') return res.redirect('/');
      server.render(req, res, '/_auth/account', {
        title: 'Account | #WOKEWeekly',
        ogUrl: '/account',
        justVerified,
        verifiedUser: user
      });
    }
  );
});

/** 'Forgot Password' page */
router.get('/recovery', (req, res) => {
  return server.render(req, res, '/_auth/recovery', {
    title: 'Forgot Password | #WOKEWeekly',
    ogUrl: '/account/recovery'
  });
});

/** Reset Password page */
router.get('/reset/:token', (req, res) => {
  const { token } = req.params;

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return renderErrorPage(req, res, err, server);
    return server.render(req, res, '/_auth/reset', {
      title: 'Reset Password | #WOKEWeekly'
    });
  });
});

module.exports = router;
