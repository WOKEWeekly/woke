const path = require('path');

module.exports = function(app, conn, server){

  /** Render individual session detail page */
  app.get('/session/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM sessions WHERE slug = ?";
    
    conn.query(sql, [slug], function (err, result) {
      if (!err){
        const session = result[0];
        return server.render(req, res, '/sessions/single', { session });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Render edit session page */
  app.get('/sessions/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM sessions WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const session = result[0];
        return server.render(req, res, '/sessions/edit', { session });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Render edit topic page */
  app.get('/topics/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM topics WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const topic = result[0];
        return server.render(req, res, '/topics/edit', { topic });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Render individual candidate detail page */
  app.get('/blackexcellence/candidate/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM blackex WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const candidate = result[0];
        return server.render(req, res, '/blackexcellence/single', { candidate });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Render edit candidate page */
  app.get('/blackexcellence/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM blackex WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const candidate = result[0];
        return server.render(req, res, '/blackexcellence/edit', { candidate });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Render executives page */
  app.get('/executives', function(req, res){
    return server.render(req, res, '/team/exec');
  });

  /** Render individual executive profile page */
  app.get('/executives/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM team WHERE slug = ?";
    
    conn.query(sql, [slug], function (err, result) {
      if (!err){
        const exec = result[0];
        return server.render(req, res, '/team/exec.single', { exec });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Render edit team member page */
  app.get('/team/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM team WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const member = result[0];
        return server.render(req, res, '/team/edit', { member });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });
}