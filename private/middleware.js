const jwt = require('jsonwebtoken');
const multer = require('multer');

module.exports = {

  /** Verify access tokens */
  verifyToken: (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined'){
      const bearer = bearerHeader.split(' ');
      const token = bearer[1];
      req.token = token;
      jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
        if (!err){
          req.auth = auth;
          next();
        } else {
          res.status(400);
          console.error(err.toString());
        }
      });
    } else {
      res.status(400);
      console.error('Unauthorized request.');
    }
  },

  /** Check for 'authorized' header values to validate requests */
  validateReq: (req, res, next) => {
    if (req.headers['authorization'] !== 'authorized'){
      res.sendStatus(403);
    } else {
      next();
    }
  },

  /** Check authorisation before performing action */
  checkAuth: (req, res, next) => {
    const clearance = req.auth ? req.auth.user.clearance : 0;
    const threshold = parseInt(req.headers.clearance);
    if (clearance >= threshold){
      next();
    } else {
      res.status(401).send(`You are not authorised to perform such an action.`);
    }
  },

  /** Check authorisation before accessing a route, redirect to home if unauthorised */
  checkAuthRoute: (req, res, next, threshold) => {
    const clearance = req.auth ? req.auth.user.clearance : 0;
    if (clearance >= threshold){
      next();
    } else {
      res.redirect('/');
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
        callback(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
      }

      /** If no image change, skip */
      if (!req.body.changed){
        return callback(null, false);
      }

      callback(null, true);
    }
  }).single('file')
}