const async = require('async');
const fs = require('fs');
const path = require('path');
const sm = require('sitemap');
const { formatDate } = require('../constants/date.js');
const { domain } = require('../constants/settings.js');

const { renderErrPage } = require('./response.js');

const about = './static/resources/about.txt';
const constitution = './static/resources/Constitution.pdf';
const cookies = './static/resources/cookies.txt';
const faq = './static/resources/faq.txt';
const mentalhealth = './static/resources/mentalhealth.txt';
const privacy = './static/resources/privacy.txt';

module.exports = function(app, conn, server){

  /** Home */
  app.get(['/', '/home'], function(req, res){
    server.render(req, res, '/home', { 
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: 'Debates and discussions centered around and beyond the UK black community at university campuses. Providing a safe-space for expression and opinions to be heard and encouraging unity amongst the community through conversation, bringing together those divided by social status, religion and interest.',
      url: '/',
      noSuffix: true,
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
      if (!err && result.length){
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
        renderErrPage(req, res, err, server);
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
      if (!err && result.length){
        const session = result[0];
        return server.render(req, res, '/sessions/edit', {
          title: 'Edit Session',
          backgroundImage: 'sessions-bg.jpg',
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
      title: 'Topic Bank',
      backgroundImage: 'topics-bg.jpg'
    });
  });

  /** Add New Topic */
  app.get('/topics/add', function(req, res){
    server.render(req, res, '/topics/add', {
      title: 'Add New Topic',
      backgroundImage: 'topics-bg.jpg'
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
          backgroundImage: 'topics-bg.jpg',
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
      title: '#BlackExcellence',
      description: 'Recognising the intrinsic potential in young black rising stars who are excelling in their respective fields and walks of life.',
      url: '/blackexcellence',
      backgroundImage: 'blackex-bg.jpg',
      theme: 'blackex'
    });
  });

  /** Add New Candidate */
  app.get('/blackexcellence/add', function(req, res){
    server.render(req, res, '/blackexcellence/add', {
      title: 'Add New Candidate',
      backgroundImage: 'blackex-bg.jpg',
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
          backgroundImage: 'blackex-bg.jpg',
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
          title: candidate.label,
          description: candidate.description,
          url: `/blackexcellence/candidate/${candidate.id}`,
          image: `/static/images/blackexcellence/${candidate.image}`,
          alt: candidate.label,
          backgroundImage: 'blackex-bg.jpg',
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
      if (!err && result.length){
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
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** Team Members */
  app.get('/team', function(req, res){
    return server.render(req, res, '/team', {
      title: 'Team Members',
      backgroundImage: 'team-bg.jpg',
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
          backgroundImage: 'team-bg.jpg',
          member
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /** Registration */
  app.get('/signup', function(req, res){
    server.render(req, res, '/_auth/signup', {
      title: 'Sign Up',
      backgroundImage: 'signup-bg.jpg',
      url: '/signup',
    });
  });

  /** Registration */
  app.get('/account', function(req, res){
    server.render(req, res, '/_auth/account', {
      title: 'Account',
      url: '/account',
    });
  });

   /** Mental Health */
   app.get('/mentalhealth', function(req, res){
    fs.readFile(mentalhealth, 'utf8', function (err, data){
      return server.render(req, res, '/variants', {
        title: '#WOKEWeekly Mental Health',
        description: 'Shattering the stigmata of discussion over our wellbeing through healthy conversation and education.',
        url: '/mentalhealth',
        noSuffix: true,
        backgroundImage: 'mental-bg.jpg',
        pageText: data,
        coverImage: 'mental-header.jpg',
        imageLogo: 'mentalhealth-logo.png',
        imageAlt: 'Mental Health logo',
        theme: 'mental'
      });
    });
  });

  /** Edit Mental Health Page */
  app.get('/mentalhealth/edit', function(req, res){
    fs.readFile(mentalhealth, 'utf8', function (err, data){
      return server.render(req, res, '/variants/edit', {
        title: 'Edit Mental Health Page',
        backgroundImage: 'mental-bg.jpg',
        pageText: data,
        file: 'mentalhealth.txt',
        placeholder: `What do we do at #WOKEWeekly Mental Health?`,
        theme: 'mental'
      });
    });
  });

  /** About Us */
  app.get('/about', function(req, res){
    fs.readFile(about, 'utf8', function (err, data){
      return server.render(req, res, '/info', {
        title: 'About #WOKEWeekly',
        description: data,
        url: '/about',
        noSuffix: true
      });
    });
  });

  /** Edit About */
  app.get('/about/edit', function(req, res){
    fs.readFile(about, 'utf8', function (err, data){
      return server.render(req, res, '/info/edit', {
        title: 'Edit About',
        description: data,
        file: 'about.txt',
        placeholder: `Write about #WOKEWeekly...`
      });
    });
  });

  /** Privacy Policy */
  app.get('/privacy', function(req, res){
    const stats = fs.statSync(privacy);
    fs.readFile(privacy, 'utf8', function (err, data){
      return server.render(req, res, '/info', {
        title: 'Privacy Policy',
        description: data,
        url: '/privacy',
        noSuffix: true,
        lastModified: formatDate(stats.mtime)
      });
    });
  });

  /** Edit Privacy Policy */
  app.get('/privacy/edit', function(req, res){
    fs.readFile(privacy, 'utf8', function (err, data){
      return server.render(req, res, '/info/edit', {
        title: 'Edit Privacy Policy',
        description: data,
        file: 'privacy.txt',
        placeholder: `Detail this website's Privacy Policy...`
      });
    });
  });

  /** Cookies Policy */
  app.get('/cookies', function(req, res){
    fs.readFile(cookies, 'utf8', function (err, data){
      return server.render(req, res, '/info', {
        title: 'Cookies Policy',
        description: data,
        url: '/cookies',
        noSuffix: true
      });
    });
  });

  /** Edit Cookies Policy */
  app.get('/cookies/edit', function(req, res){
    fs.readFile(cookies, 'utf8', function (err, data){
      return server.render(req, res, '/info/edit', {
        title: 'Edit Cookies Policy',
        description: data,
        file: 'cookies.txt',
        placeholder: `Detail this website's Cookie Policy...`
      });
    });
  });

  /** FAQs */
  app.get('/faq', function(req, res){
    fs.readFile(faq, 'utf8', function (err, data){
      return server.render(req, res, '/info', {
        title: 'FAQs',
        description: data,
        url: '/faq',
        noSuffix: true
      });
    });
  });

  /** Edit FAQs */
  app.get('/faq/edit', function(req, res){
    fs.readFile(faq, 'utf8', function (err, data){
      return server.render(req, res, '/info/edit', {
        title: 'Edit FAQs',
        description: data,
        file: 'faq.txt',
        placeholder: `Ask and answer some frequently asked questions...`
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
    const routes = [ '/', '/home', '/sessions', '/blackexcellence', '/mentalhealth',
    '/executives', '/signup', '/about', '/privacy', '/cookies', '/faq' ];

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