
module.exports = function(app, conn, server){

  /** Individual session detail page */
  app.get('/session/:slug', function(req, res){
    let slug = req.params.slug;
    let sql = "SELECT * FROM sessions WHERE slug = ?";
    let session = {};
    
    conn.query(sql, [slug], function (err, result, fields) {
      if (!err){
        
        session = result[0];
        console.log(`Retrieved details for ${session.title}.`);

        return server.render(req, res, '/sessions.one', { session });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });
}
