const async = require('async');
const jwt = require('jsonwebtoken');

const ERROR = require('./errors.js');
const { respondToClient } = require('./response.js');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  /** Verify access tokens */
  verifyToken: (threshold) => {
    return function (req, res, next) {
      async.waterfall(
        [
          function (callback) {
            // Retrieve token from request
            const { admission, authorization } = req.headers;
            if (admission === 'true' && isDev) return next();

            if (typeof authorization !== 'undefined') {
              const token = authorization.split(' ')[1];
              callback(null, token);
            } else {
              callback(ERROR.NOT_AUTHENTICATED());
            }
          },
          function (token, callback) {
            // Verify token
            jwt.verify(token, process.env.JWT_SECRET, (err, auth) => {
              if (err) {
                callback(ERROR.JWT_FAILURE(err.message));
              } else {
                callback(null, auth);
              }
            });
          },
          function (auth, callback) {
            // Check authentication
            const clearance = auth ? auth.user.clearance : 0;
            if (!threshold) threshold = 1;
            if (clearance >= threshold) {
              callback(null);
            } else {
              callback(ERROR.UNAUTHORIZED_REQUEST());
            }
          }
        ],
        function (err) {
          err ? respondToClient(res, err) : next();
        }
      );
    };
  },

  /** Check for 'authorized' header values to validate requests */
  validateReq: (req, res, next) => {
    const { admission, authorization } = req.headers;
    if (authorization !== process.env.AUTH_KEY && admission !== 'true') {
      respondToClient(res, ERROR.UNAUTHORIZED_REQUEST());
    } else {
      next();
    }
  },

  /** Log user activity on each request */
  logUserActivity: (conn) => {
    return function (req, res, next) {
      const id = parseInt(req.headers['user']);
      if (isNaN(id)) {
        next();
      } else {
        const sql = `UPDATE user SET lastActive = ? WHERE id = ?`;
        const values = [new Date(), id];

        conn.query(sql, values, () => {
          next();
        });
      }
    };
  }
};
