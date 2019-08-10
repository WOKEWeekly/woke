const async = require('async');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { resToClient } = require('./response.js');

module.exports = {

  /** Verify access tokens */
  verifyToken: (req, res, next) => {
    async.waterfall([
      function(callback){ // Retrieve token from request
        const bearerHeader = req.headers.authorization;
        if (typeof bearerHeader !== 'undefined'){
          const token = bearerHeader.split(' ')[1];
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
        const threshold = parseInt(req.headers.clearance);
        if (clearance >= threshold){
          callback(null);
        } else {
          callback(new Error('You are not authorised to perform such an action.'));
        }
      }
    ], function(err){
      err ? resToClient(res, err) : next();
    });
  },

  /** Check for 'authorized' header values to validate requests */
  validateReq: (req, res, next) => {
    if (req.headers['authorization'] !== process.env.AUTH_KEY){
      res.sendStatus(403);
    } else {
      next();
    }
  },

  /** Uploading files using Multer */
  upload: multer({
    storage: multer.diskStorage({
      destination: function(req, file, callback) {callback(null, `./static/images/${req.headers.path}/`);},
      filename: function (req, file, callback) {callback(null, file.originalname);}
    }),
    limits: {
      files: 1,
      fileSize: 5 * 1024 * 1024
    },
    fileFilter: function(req, file, callback) {
      /** Limit to certain image types */
      let allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
      if (!allowedMimes.includes(file.mimetype)){
        return callback(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
      }

      /** If no image change, skip */
      if (!req.body.changed){
        return callback(null, false);
      }

      callback(null, true);
    }
  }).single('file')
}