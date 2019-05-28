
const multer = require('multer');

module.exports = function(app){
  
  const limits = {
    files: 1,
    fileSize: 5 * 1024 * 1024
  };
  
  const fileFilter = function(req, file, callback) {
    var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)){
      callback(null, true);
    } else {
      callback(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
      console.error('Invalid file type. Only jpg, png and gif image files are allowed.')
    }
  };
  
  const session_storage = multer.diskStorage({
    destination: function(req, file, callback) {callback(null, `.${sessions_dir}`);},
    filename: function (req, file, callback) {callback(null, file.originalname);}
  });
  
  const candidate_storage = multer.diskStorage({
    destination: function(req, file, callback) {callback(null, `.${blackex_dir}`);},
    filename: function (req, file, callback) {callback(null, file.originalname);}
  });
  
  const member_storage = multer.diskStorage({
    destination: function(req, file, callback) {callback(null, `.${team_dir}`);},
    filename: function (req, file, callback) {callback(null, file.originalname);}
  });
  
  const uploadSession = multer({
    storage: session_storage,
    limits: limits,
    fileFilter: fileFilter
  });
  const uploadCandidate = multer({
    storage: candidate_storage,
    limits: limits,
    fileFilter: fileFilter
  });
  const uploadMember = multer({
    storage: member_storage,
    limits: limits,
    fileFilter: fileFilter
  });
  
  /** Upload session image to directory */
  app.post('/uploadSession', uploadSession.single('file'), function(req, res, err){
    if (req.file) {
      console.log("Session image successfully received.");
      res.status(200).send(req.file);
    } else {
      if (err.toString().includes("Request Entity Too Large")){
        res.status(413).send(`The file you're trying to upload is too large.`);
      } else {
        res.status(400).send(err.toString());
      }
    }
  });
  
  /** Upload canddidate image to directory */
  app.post('/uploadCandidate', uploadCandidate.single('file'), function(req, res, err){
    if (req.file) {
      console.log("Candidate image successfully received.");
      res.status(200).send(req.file);
    } else {
      if (err.toString().includes("413")){
        res.status(413).send(`The file you're trying to upload is too large.`);
      } else {
        res.status(400).send(err.toString());
      }
      console.log(err.toString());
    }
  });
  
  /** Upload member image to directory */
  app.post('/uploadMember', uploadMember.single('file'), function(req, res, err){
    if (req.file) {
      console.log("Member image successfully received.");
      res.status(200).send(req.file);
    } else {
      if (err.toString().includes("Request Entity Too Large")){
        res.status(413).send(`The file you're trying to upload is too large.`);
      } else {
        res.status(400).send(err.toString());
      }
    }
  });
}