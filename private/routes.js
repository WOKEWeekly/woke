const fs = require('fs');

module.exports = function(app, conn, server){

  app.get('/', function(req, res){
    server.render(req, res, '/home', { 
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: 'Debates and discussions centered around and beyond the UK black community at university campuses. Providing a safe-space for expression and opinions to be heard and encouraging unity amongst the community through conversation, bringing together those divided by social status, religion and interest.',
      url: '/',
      isHome: true
     });
  });

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
        candidate.label = `#${candidate.id}: ${candidate.name}`;
        return server.render(req, res, '/blackexcellence/single', {
          title: candidate.label,
          description: candidate.description,
          url: `/blackexcellence/candidate/${candidate.id}`,
          image: `/static/images/blackexcellence/${candidate.image}`,
          alt: candidate.label,
          candidate
        });
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

  /** Render edit about page */
  app.get('/about/edit', function(req, res){
    return server.render(req, res, '/about/edit');
  });

  /** Render constitution */
  app.get('/constitution', function(req, res){
    const file = './static/resources/Constitution.pdf';
    fs.readFile(file, function (err, data){
      res.contentType("application/pdf");
      res.send(data);
    });
  });

}