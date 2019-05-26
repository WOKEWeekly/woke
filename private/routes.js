
module.exports = function(app, conn){

  /** Individual session detail page */
  app.get('/session/:slug', function(req, res){
    var slug = req.params.slug;
    var sql = "SELECT * FROM sessions WHERE slug = ?";
    var session = {};
    
    conn.query(sql, [slug], function (err, result, fields) {
      if (!err){
        
        session = result[0];
        console.log(`Retrieved details for ${session.title}.`);

        return app.render(req, res, '/sessions', { slug: req.params.slug });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });
}
