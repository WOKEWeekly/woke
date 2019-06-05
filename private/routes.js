
module.exports = function(app, conn, server){

  /** Render individual session detail page */
  app.get('/session/:slug', function(req, res){
    let slug = req.params.slug;
    let sql = "SELECT * FROM sessions WHERE slug = ?";
    let session = {};
    
    conn.query(sql, [slug], function (err, result) {
      if (!err){
        session = result[0];
        return server.render(req, res, '/sessions/single', { session });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Render edit session page */
  app.get('/sessions/edit/:id', function(req, res){
    let id = req.params.id;
    let sql = "SELECT * FROM sessions WHERE id = ?";
    let session = {};
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        session = result[0];
        return server.render(req, res, '/sessions/edit', { session });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });
}
