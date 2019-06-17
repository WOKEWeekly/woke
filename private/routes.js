
const CLEARANCES = require('../constants/clearances.js');
const { checkAuthRoute } = require('./middleware.js');

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

  /** Render Topic Bank page only if authorised */
  app.get('/topics', function(req, res){
    checkAuthRoute(req, res, () => {
      return server.render(req, res, '/topics');
    }, CLEARANCES.ACTIONS.VIEW_TOPICS);
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
}
