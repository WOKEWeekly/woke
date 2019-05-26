
module.exports = function(app, conn, verifyToken){
  
  /** Add push notification token for user */
  app.post('/users/addPushToken', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        const sql = "INSERT INTO user_tokens (user_id, token_string, type) VALUES (?, ?, 'push')";
        const values = [req.body.id, req.body.token];
        
        conn.query(sql, values, function (err, result, fields) {
          if (!err){
            res.sendStatus(200);
          } else {
            res.status(400).send(err.toString());
            console.error(err.toString())
          }
        });
      }
    });
  });
  
  app.put('/users/toggleNotificationPermissions', verifyToken, function(req, res){
    async.waterfall([
      function(callback){
        jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
          if (err){
            res.sendStatus(403);
          } else {
            callback(null);
          }
        });
      },
      function (callback){
        let { id, sessions, qotd } = req.body;
        
        let sql = "UPDATE user_tokens SET _sessions = ?, _qotd = ? WHERE user_id = ?";
        let values = [sessions, qotd, id]
        
        conn.query(sql, values, function (err, result, fields) {
          if (!err){
            callback(null);
          } else {
            res.status(400).send(err.toString());
            console.error(err.toString())
          }
        });
      }
    ], function(){
      res.sendStatus(200);
    });
  });
  
  /** Send notification to all mobile app users */
  app.post('/notify', verifyToken, function(req, res){
    jwt.verify(req.token, process.env.JWT_SECRET, (err, auth) => {
      if (err){
        res.sendStatus(403);
      } else {
        if (!(auth.user && auth.user.clearance >= CLEARANCES.ACTIONS.SEND_NOTIFICATIONS)){
          res.status(401).send(`You are not authorised to perform such an action.`);
          return;
        }
        
        const { title, message } = req.body;
        notifications.all(conn, title, message);
        res.sendStatus(200);
      }
    });
  });
}
