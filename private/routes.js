const async = require('async');
const fs = require('fs');
const path = require('path');
const sm = require('sitemap');
const { domain } = require('../constants/settings.js');

const { renderErrPage } = require('./response.js');

module.exports = function(app, conn, server){

  /** Home */
  app.get(['/', '/home'], function(req, res){
    server.render(req, res, '/home', { 
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: 'Debates and discussions centered around and beyond the UK black community.',
      url: '/',
      backgroundImage: 'bg-app.jpg'
     });
  });

  /** Sessions */
  app.get('/sessions', function(req, res){
    server.render(req, res, '/sessions', { 
      title: 'Sessions | #WOKEWeekly',
      description: 'Where the magic happens...',
      url: '/sessions',
      backgroundImage: 'bg-sessions.jpg'
     });
  });

  /** Session:Individual */
  app.get('/session/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM sessions WHERE slug = ?";
    
    conn.query(sql, [slug], function (err, result) {
      if (!err && result.length){
        const session = result[0];
        return server.render(req, res, '/sessions/single', {
          title: `${session.title} | #WOKEWeekly`,
          description: serveDescription(session.description),
          url: `/sessions/${session.slug}`,
          cardImage: `/sessions/${session.image}`,
          backgroundImage: 'bg-sessions.jpg',
          session
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** Add New Session */
  app.get('/sessions/add', function(req, res){
    server.render(req, res, '/sessions/add', {
      title: 'Add New Session',
      backgroundImage: 'bg-sessions.jpg'
    });
  });

  /** Edit Session */
  app.get('/sessions/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM sessions WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err && result.length){
        const session = result[0];
        return server.render(req, res, '/sessions/edit', {
          title: 'Edit Session',
          backgroundImage: 'bg-sessions.jpg',
          session
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** Topic Bank */
  app.get('/topics', function(req, res){
    server.render(req, res, '/topics', {
      title: 'Topic Bank | #WOKEWeekly',
      backgroundImage: 'bg-topics.jpg'
    });
  });

  /** Add New Topic */
  app.get('/topics/add', function(req, res){
    server.render(req, res, '/topics/add', {
      title: 'Add New Topic',
      backgroundImage: 'bg-topics.jpg'
    });
  });

  /** Edit Topic */
  app.get('/topics/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM topics WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err && result.length){
        const topic = result[0];
        return server.render(req, res, '/topics/edit', {
          title: 'Edit Topic',
          backgroundImage: 'bg-topics.jpg',
          topic
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** #BlackExcellence */
  app.get('/blackexcellence', function(req, res){
    server.render(req, res, '/blackexcellence', {
      title: '#BlackExcellence | #WOKEWeekly',
      description: 'Recognising the intrinsic potential in young black rising stars who are excelling in their respective fields and walks of life.',
      url: '/blackexcellence',
      backgroundImage: 'bg-blackex.jpg',
      cardImage: `/bg/card-blackex.jpg`,
      theme: 'blackex'
    });
  });

  /** Add New Candidate */
  app.get('/blackexcellence/add', function(req, res){
    server.render(req, res, '/blackexcellence/add', {
      title: 'Add New Candidate',
      backgroundImage: 'bg-blackex.jpg',
      theme: 'blackex'
    });
  });

  /** Edit Candidate */
  app.get('/blackexcellence/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM blackex WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err && result.length){
        const candidate = result[0];
        return server.render(req, res, '/blackexcellence/edit', {
          title: 'Edit Candidate',
          backgroundImage: 'bg-blackex.jpg',
          theme: 'blackex',
          candidate
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** Candidate:Individual */
  app.get('/blackexcellence/candidate/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM blackex WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err && result.length){
        const candidate = result[0];
        candidate.label = `#${candidate.id}: ${candidate.name}`;
        return server.render(req, res, '/blackexcellence/single', {
          title: `${candidate.label} | #WOKEWeekly`,
          description: serveDescription(candidate.description),
          url: `/blackexcellence/candidate/${candidate.id}`,
          cardImage: `/blackexcellence/${candidate.image}`,
          alt: candidate.label,
          backgroundImage: 'bg-blackex.jpg',
          theme: 'blackex',
          candidate
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** Executives */
  app.get('/executives', function(req, res){
    return server.render(req, res, '/team/exec', {
      title: 'Meet The Executives | #WOKEWeekly',
      description: 'The masterminds behind the cause.',
      url: '/executives',
      cardImage: '/bg/card-team.jpg',
      backgroundImage: 'bg-team.jpg',
    });
  });

  /** Executive:Individual */
  app.get('/executives/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM team WHERE slug = ?";
    
    conn.query(sql, [slug], function (err, result) {
      if (!err && result.length){
        const exec = result[0];
        return server.render(req, res, '/team/exec.single', {
          title: `${exec.firstname} ${exec.lastname} | #WOKEWeekly`,
          description: serveDescription(exec.description),
          url: `/executives/${exec.slug}`,
          cardImage: `/team/${exec.image}`,
          backgroundImage: 'bg-team.jpg',
          exec
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** Team Members */
  app.get('/team', function(req, res){
    return server.render(req, res, '/team', {
      title: 'Team Members | #WOKEWeekly',
      backgroundImage: 'bg-team.jpg',
    });
  });

  /** Edit Team Member */
  app.get('/team/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM team WHERE id = ?";
    
    conn.query(sql, [id], function (err, result) {
      if (!err && result.length){
        const member = result[0];
        return server.render(req, res, '/team/edit', { 
          title: 'Edit Team Member',
          backgroundImage: 'bg-team.jpg',
          member
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** Registered Users */
  app.get('/users', function(req, res){
    return server.render(req, res, '/users', {
      title: 'Registered Users | #WOKEWeekly'
    });
  });

  /** Registration */
  app.get('/signup', function(req, res){
    server.render(req, res, '/_auth/signup', {
      title: 'Sign Up | #WOKEWeekly',
      backgroundImage: 'bg-signup.jpg',
      url: '/signup',
    });
  });

  /** Account */
  app.get('/account', function(req, res){
    server.render(req, res, '/_auth/account', {
      title: 'Account | #WOKEWeekly',
      url: '/account',
    });
  });

  /** Forgot Password */
  app.get('/account/recovery', function(req, res){
    server.render(req, res, '/_auth/recovery', {
      title: 'Forgot Password | #WOKEWeekly',
      url: '/account/recovery',
    });
  });

  /** Reset Password */
  app.get('/account/reset-password/:id/:token', function(req, res){
    const { id, token } = req.params;
    server.render(req, res, '/_auth/reset', {
      title: 'Reset Password | #WOKEWeekly',
      userId: id,
      recoveryToken: token
    });
  });

   /** Mental Health */
   app.get('/mentalhealth', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'mentalhealth'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/variants', {
        title: '#WOKEWeekly Mental Health',
        description: 'Shattering the stigmata of discussion over our wellbeing through healthy conversation and education.',
        url: '/mentalhealth',
        cardImage: '/bg/card-mental.jpg',
        backgroundImage: 'bg-mental.jpg',
        pageText: text,
        coverImage: 'header-mental.jpg',
        imageLogo: 'mentalhealth-logo.png',
        imageAlt: 'Mental Health logo',
        theme: 'mental'
      });
    });
  });

  /** Edit Mental Health Page */
  app.get('/mentalhealth/edit', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'mentalhealth'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/variants/edit', {
        title: 'Edit Mental Health Page',
        backgroundImage: 'bg-mental.jpg',
        pageText: text,
        resource: 'mentalhealth',
        placeholder: `What do we do at #WOKEWeekly Mental Health?`,
        theme: 'mental'
      });
    });
  });

  /** About Us */
  app.get('/about', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'about'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info', {
        title: 'About #WOKEWeekly',
        description: serveDescription(text),
        pageText: text,
        cardImage: '/bg/card-about.jpg',
        url: '/about'
      });
    });
  });

  /** Edit About */
  app.get('/about/edit', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'about'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      return server.render(req, res, '/info/edit', {
        title: 'Edit About',
        description: text,
        resource: 'about',
        placeholder: `Write about #WOKEWeekly...`
      });
    });
  });

  /** Privacy Policy */
  app.get('/privacy', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'privacy'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text, lastModified} = result[0];
      return server.render(req, res, '/info', {
        title: 'Privacy Policy | #WOKEWeekly',
        description: serveDescription(text),
        pageText: text,
        url: '/privacy',
        lastModified: lastModified
      });
    });
  });

  /** Edit Privacy Policy */
  app.get('/privacy/edit', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'privacy'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info/edit', {
        title: 'Edit Privacy Policy',
        description: text,
        resource: 'privacy',
        placeholder: `Detail this website's Privacy Policy...`
      });
    });
  });

  /** Cookies Policy */
  app.get('/cookies', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'cookies'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info', {
        title: 'Cookies Policy | #WOKEWeekly',
        description: serveDescription(text),
        pageText: text,
        url: '/cookies',
      });
    });
  });

  /** Edit Cookies Policy */
  app.get('/cookies/edit', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'cookies'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info/edit', {
        title: 'Edit Cookies Policy',
        description: text,
        resource: 'cookies',
        placeholder: `Detail this website's Cookie Policy...`
      });
    });
  });

  /** FAQs */
  app.get('/faq', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'faq'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info', {
        title: 'FAQs | #WOKEWeekly',
        description: serveDescription(text),
        pageText: text, 
        url: '/faq'
      });
    });
  });

  /** Edit FAQs */
  app.get('/faq/edit', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'faq'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info/edit', {
        title: 'Edit FAQs',
        description: text,
        resource: 'faq',
        placeholder: `Ask and answer some frequently asked questions...`
      });
    });
  });

  /***************************************************************
   * RESOURCES
   **************************************************************/
     
  app.get('/constitution', function(req, res){
    fs.readFile('./static/resources/Constitution.pdf', function (err, data){
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
    const routes = [ '/', '/home', '/sessions', '/blackexcellence', '/mentalhealth',
    '/executives', '/signup', '/about', '/cookies', '/faq', '/privacy' ];

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


const serveDescription = (text) => {
  if (!text) text = '';

  const parts = text.split('\n').map(paragraph => {
    if (paragraph.length === 0) return null;

    switch (paragraph.charAt(0)){
      case '*': return null;                    // For headings
      case '>': return paragraph.substring(1);  // For subheadings
      case ';': return null;                    // For images
      case '•': return paragraph;               // For list items

      // Normal paragraph text
      default:
        const linkRegex = new RegExp(/\<\[(.*?)\]\s(.*?)\>/g);  // Regular expression for links
        const subRegex = new RegExp(/\<\$(.*?)\$\>/g);          // Regular expression for substitutions
        return paragraph.replace(subRegex, null).replace(linkRegex, '$1');
    }
  });

  text = parts.filter(e => e != null);

  return text[0];
}