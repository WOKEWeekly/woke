const async = require('async');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { resToClient } = require('./response.js');
const filer = require('./file.js');

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
    if (req.headers['authorization'] !== process.env.AUTH_KEY){
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
  },

  /** Uploading files using Multer */
  upload: multer({
    storage: multer.diskStorage({
      destination: function(req, file, callback) {callback(null, `./static/images/${req.headers.path}/`);},
      filename: function (req, file, callback) {
        let filename, slug;
        switch (req.headers.path){
          case 'sessions':
            const session = req.method === 'POST' ? JSON.parse(req.body.session) : JSON.parse(req.body.sessions).session2;
            slug = req.body.slug = filer.generateSlug(session.title);
            filename = filer.generateSessionFilename(session.dateHeld, slug, file);
            break;
          case 'blackexcellence':
            const candidate = req.method === 'POST' ? JSON.parse(req.body.candidate) : JSON.parse(req.body.candidates).candidate2;
            slug = filer.generateSlug(candidate.name);
            filename = filer.generateCandidateFilename(candidate.id, slug, file);
            break;
          case 'reviews':
            const review = req.method === 'POST' ? JSON.parse(req.body.review) : JSON.parse(req.body.reviews).review2;
            slug = filer.generateSlug(review.referee);
            filename = filer.generateReviewFilename(review.rating, slug, file);
            break;
        }
        callback(null, filename);
      }
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