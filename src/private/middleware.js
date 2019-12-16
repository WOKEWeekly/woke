const async = require('async');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const { resToClient } = require('./response.js');

module.exports = {

  /** Verify access tokens */
  verifyToken: (threshold) => {  
    return function(req, res, next){
      async.waterfall([
        function(callback){ // Retrieve token from request
          const { admission, authorization } = req.headers;
          if (admission === 'true') return next();

          if (typeof authorization !== 'undefined'){
            const token = authorization.split(' ')[1];
            callback(null, token);
          } else {
            callback(new Error('Unauthorized request.'));
          }
        },
        function(token, callback){ // Verify token
          jwt.verify(token, process.env.JWT_SECRET, (err, auth) => {
            if (err){
              req.logout();
              err.type = 'jwt';
              callback(err);
            } else {
              callback(null, auth);
            }
          });
        },
        function(auth, callback){ // Check authentication
          const clearance = auth ? auth.user.clearance : 0;
          if (!threshold) threshold = 1;
          if (clearance >= threshold){
            callback(null);
          } else {
            callback(new Error('You are not authorised to perform such an action.'));
          }
        }
      ], function(err){
        err ? resToClient(res, err) : next();
      });
    }
  },

  /** Check for 'authorized' header values to validate requests */
  validateReq: (req, res, next) => {
    const { admission, authorization } = req.headers;
    if (authorization !== process.env.AUTH_KEY && admission !== 'true'){
      res.sendStatus(403);
    } else {
      next();
    }
  },

  /** Log user activity on each request */
  logUserActivity: (conn) => {
    return function(req, res, next){
      const id = parseInt(req.headers['user']);
      if (isNaN(id)){
        next();
      } else {
        const sql = `UPDATE user SET last_active = ? WHERE id = ?`;
        const values = [new Date(), id];
        
        conn.query(sql, values, () => {
          next();
        });
      }
    }
  }
}