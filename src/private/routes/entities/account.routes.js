const async = require('async');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { renderErrorPage } = require('../../response');
const knex = require('../../singleton/knex').getKnex();
const server = require('../../singleton/server').getServer();

/** Registration page */
router.get('/signup', function (req, res) {
  return server.render(req, res, '/_auth/signup', {
    title: 'Sign Up | #WOKEWeekly',
    backgroundImage: 'bg-signup.jpg',
    ogUrl: '/signup'
  });
});

/** Unsubscribe page */
router.get('/unsubscribe', function (req, res) {
  server.render(req, res, '/_auth/unsubscribe', {
    title: 'Unsubscribe | #WOKEWeekly'
  });
});

/** User account page */
router.get('/account', (req, res) => {
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
router.get('/account/recovery', (req, res) => {
  return server.render(req, res, '/_auth/recovery', {
    title: 'Forgot Password | #WOKEWeekly',
    ogUrl: '/account/recovery'
  });
});

/** Reset Password page */
router.get('/account/reset/:token', (req, res) => {
  const { token } = req.params;

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return renderErrorPage(req, res, err, server);
    return server.render(req, res, '/_auth/reset', {
      title: 'Reset Password | #WOKEWeekly'
    });
  });
});

module.exports = router;
