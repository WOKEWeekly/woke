const async = require('async');
const fs = require('fs');
const path = require('path');
const sm = require('sitemap');
const { domain } = require('../constants/settings.js');

const about = './static/resources/about.txt';
const constitution = './static/resources/Constitution.pdf';

module.exports = function(app, conn, server){

  /** Home */
  app.get(['/', '/home'], function(req, res){
    server.render(req, res, '/', { 
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: 'Debates and discussions centered around and beyond the UK black community at university campuses. Providing a safe-space for expression and opinions to be heard and encouraging unity amongst the community through conversation, bringing together those divided by social status, religion and interest.',
      url: '/',
      isHome: true,
      backgroundImage: 'body-bg.jpg'
     });
  });

  /** Sessions */
  app.get('/sessions', function(req, res){
    server.render(req, res, '/sessions', { 
      title: 'Sessions',
      description: 'Where the magic happens...',
      url: '/sessions',
      backgroundImage: 'sessions-bg.jpg'
     });
  });

  /** Session:Individual */
  app.get('/session/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM sessions WHERE slug = ?";
    
    conn.query(sql, [slug], function (err, result) {
      if (!err){
        const session = result[0];
        return server.render(req, res, '/sessions/single', {
          title: session.title,
          description: session.description,
          url: `/sessions/${session.slug}`,
          image: `/static/images/sessions/${session.image}`,
          backgroundImage: 'sessions-bg.jpg',
          session
        });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Add New Session */
  app.get('/sessions/add', function(req, res){
    server.render(req, res, '/sessions/add', {
      title: 'Add New Session',
      backgroundImage: 'sessions-bg.jpg'
    });
  });

  /** Edit Session */
  app.get('/sessions/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM sessions WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const session = result[0];
        return server.render(req, res, '/sessions/edit', {
          title: 'Edit Session',
          backgroundImage: 'sessions-bg.jpg',
          session
        });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Topic Bank */
  app.get('/topics', function(req, res){
    server.render(req, res, '/topics', {
      title: 'Topic Bank'
    });
  });

  /** Add New Topic */
  app.get('/topics/add', function(req, res){
    server.render(req, res, '/topics/add', {
      title: 'Add New Topic'
    });
  });

  /** Edit Topic */
  app.get('/topics/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM topics WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const topic = result[0];
        return server.render(req, res, '/topics/edit', {
          title: 'Edit Topic',
          topic
        });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** #BlackExcellence */
  app.get('/blackexcellence', function(req, res){
    server.render(req, res, '/blackexcellence', { title: '#BlackExcellence' });
  });

  /** Add New Candidate */
  app.get('/blackexcellence/add', function(req, res){
    server.render(req, res, '/blackexcellence/add', { title: 'Add New Candidate' });
  });

  /** Edit Candidate */
  app.get('/blackexcellence/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM blackex WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const candidate = result[0];
        return server.render(req, res, '/blackexcellence/edit', {
          title: 'Edit Candidate',
          candidate
        });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Candidate:Individual */
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

  /** Executives */
  app.get('/executives', function(req, res){
    return server.render(req, res, '/team/exec', {
      title: 'Meet The Executives',
      description: 'The masterminds behind the cause.',
      url: '/executives',
      backgroundImage: 'team-bg.jpg',
    });
  });

  /** Executive:Individual */
  app.get('/executives/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM team WHERE slug = ?";
    
    conn.query(sql, [slug], function (err, result) {
      if (!err){
        const exec = result[0];
        return server.render(req, res, '/team/exec.single', {
          title: `${exec.firstname} ${exec.lastname}`,
          description: exec.description,
          url: `/executives/${exec.slug}`,
          image: `/static/images/team/${exec.image}`,
          backgroundImage: 'team-bg.jpg',
          exec
        });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Edit Team Member */
  app.get('/team/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM team WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err){
        const member = result[0];
        return server.render(req, res, '/team/edit', { 
          title: 'Edit Team Member',
          backgroundImage: 'team-bg.jpg',
          member
        });
      } else {
        res.status(400).send(err.toString());
      }
    });
  });

  /** Registration */
  app.get('/signup', function(req, res){
    server.render(req, res, '/signup', {
      title: 'Sign Up',
      backgroundImage: 'signup-bg.jpg',
      url: '/signup',
    });
  });

  /** Registration */
  app.get('/account', function(req, res){
    server.render(req, res, '/account', {
      title: 'Account',
      url: '/account',
    });
  });

  /** About Us */
  app.get('/about', function(req, res){
    fs.readFile(about, 'utf8', function (err, data){
      return server.render(req, res, '/about', {
        title: 'About Us',
        description: data,
        url: '/about'
      });
    });
  });

  /** Edit About */
  app.get('/about/edit', function(req, res){
    fs.readFile(about, 'utf8', function (err, data){
      return server.render(req, res, '/about/edit', {
        title: 'Edit About',
        description: data
      });
    });
  });

  /***************************************************************
   * RESOURCES
   **************************************************************/
     
  app.get('/constitution', function(req, res){
    fs.readFile(constitution, function (err, data){
      if (err) res.sendStatus(404);
      res.contentType("application/pdf");
      res.send(data);
    });
  });

  app.get('/robots.txt', (req, res) => (
    res.status(200).sendFile(path.resolve('./static/resources/robots.txt'), {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8', }
    })
  ));

  app.get('/sitemap.xml', (req, res) => {
    const routes = [ '/', '/home', '/sessions', '/blackexcellence',
    '/executives', '/signup', '/about' ];

    async.parallel([
      function(callback){
        conn.query('SELECT slug FROM sessions', function (err, result) {
          if (err) return callback(err);
          result.forEach(session => {
            routes.push(`/session/${session.slug}`)
          });
          callback(null);
        });
      },
      function(callback){
        conn.query('SELECT id FROM blackex', function (err, result) {
          if (err) return callback(err);
          result.forEach(candidate => {
            routes.push(`/blackexcellence/candidate/${candidate.id}`)
          });
          callback(null);
        });
      },
      function(callback){
        conn.query(`SELECT slug FROM team WHERE level = 'Executive'`, function (err, result) {
          if (err) return callback(err);
          result.forEach(exec => {
            routes.push(`/executives/${exec.slug}`)
          });
          callback(null);
        });
      }
    ], function(){
      const sitemap = sm.createSitemap ({
        hostname: domain,
        cacheTime: 10 * 60 * 1000,  // 10 minutes,
      });

      routes.forEach(route => {
        sitemap.add({ url: route, changefreq: 'weekly' })
      });

      sitemap.toXML(function(err, xml) {
        if (err) return res.status(500).end()
        res.header('Content-Type', 'application/xml');
        res.send(xml);
      });
    });
  });

}