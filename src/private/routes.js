const async = require('async');
const jwt = require('jsonwebtoken');
const path = require('path');
const request = require('request');
const sm = require('sitemap');

const { cloudinary, domain } = require('../constants/settings.js');
const { renderErrPage } = require('./response.js');

const { forms } = require('../constants/settings.js');

module.exports = function(app, conn, server){

  /**
   * Home page
   * @route {GET} /home
   */
  app.get(['/', '/home'], function(req, res){
    server.render(req, res, '/home', { 
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: 'Debates and discussions centered around and beyond the UK black community. Facilitating open-floor conversation to shape the minds and alter the perspectives of participants.',
      url: '/',
      backgroundImage: 'bg-app.jpg'
    });
  });

  /**
   * Sessions page
   * @route {GET} /sessions
   */
  app.get('/sessions', function(req, res){
    server.render(req, res, '/sessions', { 
      title: 'Sessions | #WOKEWeekly',
      description: 'Where the magic happens...',
      url: '/sessions',
      cardImage: `public/bg/card-sessions.jpg`,
      backgroundImage: 'bg-sessions.jpg'
     });
  });

  /**
   * Individual session page
   * @route {GET} /session/:slug
   */
  app.get('/session/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM sessions WHERE slug = ?";
    
    conn.query(sql, [slug], function (err, result) {
      if (!err && result.length){
        const session = result[0];
        return server.render(req, res, '/sessions/single', {
          title: `${session.title} | #WOKEWeekly`,
          description: createExcerpt(session.description),
          url: `/sessions/${session.slug}`,
          cardImage: session.image,
          backgroundImage: 'bg-sessions.jpg',
          session
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /**
   * Add Session page
   * @route {GET} /sessions/add
   */
  app.get('/sessions/add', function(req, res){
    server.render(req, res, '/sessions/crud', {
      title: 'Add New Session',
      operation: 'add',
      backgroundImage: 'bg-sessions.jpg'
    });
  });

  /**
   * Edit Session page
   * @route {GET} /sessions/edit/:id
   */
  app.get('/sessions/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM sessions WHERE id = ?";
    
    conn.query(sql, id, function (err, result) {
      if (!err && result.length){
        const session = result[0];
        return server.render(req, res, '/sessions/crud', {
          title: 'Edit Session',
          backgroundImage: 'bg-sessions.jpg',
          operation: 'edit',
          session
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /**
   * Topic Bank page
   * @route {GET} /topics
   */
  app.get('/topics', function(req, res){
    const token = req.query.access;
    const sql = "SELECT * FROM tokens WHERE name = 'topicBank'";

    conn.query(sql, function (err, result) {
      server.render(req, res, '/topics', {
        title: 'Topic Bank | #WOKEWeekly',
        description: 'The currency of the franchise.',
        url: '/topics',
        cardImage: `public/bg/card-topics.jpg`,
        backgroundImage: 'bg-topics.jpg',
        hasAccess: result[0].value === token
      });
    });
  });

  /**
   * Add Topic page
   * @route {GET} /topics/add
   */
  app.get('/topics/add', function(req, res){
    server.render(req, res, '/topics/crud', {
      title: 'Add New Topic',
      operation: 'add',
      backgroundImage: 'bg-topics.jpg'
    });
  });

  /**
   * Edit Topic page
   * @route {GET} /topics/edit/:id
   */
  app.get('/topics/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM topics WHERE id = ?";
    
    conn.query(sql, id, function (err, result) {
      if (!err && result.length){
        const topic = result[0];
        return server.render(req, res, '/topics/crud', {
          title: 'Edit Topic',
          operation: 'edit',
          backgroundImage: 'bg-topics.jpg',
          topic
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /**
   * #BlackExcellence page
   * @route {GET} /blackexcellence
   */
  app.get('/blackexcellence', function(req, res){
    server.render(req, res, '/blackexcellence', {
      title: '#BlackExcellence | #WOKEWeekly',
      description: 'Recognising the intrinsic potential in young black rising stars who are excelling in their respective fields and walks of life.',
      url: '/blackexcellence',
      backgroundImage: 'bg-blackex.jpg',
      cardImage: `public/bg/card-blackex.jpg`,
      theme: 'blackex'
    });
  });

  /**
   * Add #BlackExcellence Candidate page
   * @route {GET} /blackexcellence/add
   */
  app.get('/blackexcellence/add', function(req, res){
    server.render(req, res, '/blackexcellence/crud', {
      title: 'Add New Candidate',
      backgroundImage: 'bg-blackex.jpg',
      operation: 'add',
      theme: 'blackex'
    });
  });

  /**
   * Edit #BlackExcellence Candidate page
   * @route {GET} /blackexcellence/edit/:id
   */
  app.get('/blackexcellence/edit/:id', function(req, res){
    const { id } = req.params;
    const sql = "SELECT * FROM blackex WHERE id = ?";
    
    conn.query(sql, id, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const candidate = result[0];
      return server.render(req, res, '/blackexcellence/crud', {
        title: 'Edit Candidate',
        backgroundImage: 'bg-blackex.jpg',
        theme: 'blackex',
        operation: 'edit',
        candidate
      });
    });
  });

  /**
   * Individual #BlackExcellence Candidate page
   * @route {GET} /blackexcellence/add
   */
  app.get('/blackexcellence/candidate/:id', function(req, res){
    const id = req.params.id;
    const sql = `SELECT blackex.*, CONCAT(team.firstname, ' ', team.lastname) AS author,
    team.level AS author_level, team.slug AS author_slug
    FROM blackex LEFT JOIN team ON blackex.authorId=team.id WHERE blackex.id = ?`;
    
    conn.query(sql, id, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const candidate = result[0];
      candidate.label = `#${candidate.id}: ${candidate.name}`;
      return server.render(req, res, '/blackexcellence/single', {
        title: `${candidate.label} | #WOKEWeekly`,
        description: createExcerpt(candidate.description),
        url: `/blackexcellence/candidate/${candidate.id}`,
        cardImage: candidate.image,
        alt: candidate.label,
        backgroundImage: 'bg-blackex.jpg',
        theme: 'blackex',
        candidate
      });
    });
  });

  /**
   * Executives page
   * @route {GET} /executives
   */
  app.get('/executives', function(req, res){
    return server.render(req, res, '/team/exec', {
      title: 'Meet The Executives | #WOKEWeekly',
      description: 'The masterminds behind the cause.',
      url: '/executives',
      cardImage: 'public/bg/card-team.jpg',
      backgroundImage: 'bg-team.jpg',
    });
  });

  /**
   * Individual executive page
   * @route {GET} /executives/:slug
   */
  app.get('/executives/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM team WHERE slug = ? AND level = 'Executive'";
    
    conn.query(sql, [slug], function (err, result) {
      if (!err && result.length){
        const exec = result[0];
        return server.render(req, res, '/team/single', {
          title: `${exec.firstname} ${exec.lastname} | #WOKEWeekly`,
          description: createExcerpt(exec.description),
          url: `/executives/${exec.slug}`,
          cardImage: exec.image,
          backgroundImage: 'bg-team.jpg',
          member: exec
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /**
   * Team Members page
   * @route {GET} /team
   */
  app.get('/team', function(req, res){
    return server.render(req, res, '/team', {
      title: 'Team Members | #WOKEWeekly',
      backgroundImage: 'bg-team.jpg',
    });
  });

  /**
   * Individual team member page
   * @route {GET} /team/member/:slug
   */
  app.get('/team/member/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = "SELECT * FROM team WHERE slug = ?";
    
    conn.query(sql, slug, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const member = result[0];
      return server.render(req, res, '/team/single', { 
        title: `${member.firstname} ${member.lastname} | #WOKEWeekly`,
        description: createExcerpt(member.description),
        url: `/team/member/${member.slug}`,
        cardImage: member.image,
        alt: `${member.firstname} ${member.lastname}`,
        backgroundImage: 'bg-team.jpg',
        member
      });
    });
  });

  /**
   * Add Team Member page
   * @route {GET} /team/:add
   */
  app.get('/team/add', function(req, res){
    server.render(req, res, '/team/crud', {
      title: 'Add New Member',
      operation: 'add',
      backgroundImage: 'bg-team.jpg'
    });
  });

  /**
   * Edit Team Member page
   * @route {GET} /team/edit/:id
   */
  app.get('/team/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM team WHERE id = ?";
    
    conn.query(sql, id, function (err, result) {
      if (!err && result.length){
        const member = result[0];
        return server.render(req, res, '/team/crud', { 
          title: 'Edit Team Member',
          operation: 'edit',
          backgroundImage: 'bg-team.jpg',
          member
        });
      } else {
        renderErrPage(req, res, err, server);
      }
    });
  });

  /**
   * Registered Users page
   * @route {GET} /users
   */
  app.get('/users', function(req, res){
    return server.render(req, res, '/users', {
      title: 'Registered Users | #WOKEWeekly'
    });
  });

  /**
   * Registration page
   * @route {GET} /signup
   */
  app.get('/signup', function(req, res){
    server.render(req, res, '/_auth/signup', {
      title: 'Sign Up | #WOKEWeekly',
      backgroundImage: 'bg-signup.jpg',
      url: '/signup',
    });
  });

  /**
   * User account page
   * @route {GET} /account
   */
  app.get('/account', function(req, res){
    const token = req.query.verified;
    async.waterfall([
      function(callback){
        if (!token) return callback(null, false);
        jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
          if (err) return callback(null, false);
          callback(null, true, result.user);
        });
      }
    ], function(err, justVerified, user){
      server.render(req, res, '/_auth/account', {
        title: 'Account | #WOKEWeekly',
        url: '/account',
        justVerified: justVerified,
        verifiedUser: user
      });
    });
  });

  /**
   * 'Forgot Password' page
   * @route {GET} /account/recovery
   */
  app.get('/account/recovery', function(req, res){
    server.render(req, res, '/_auth/recovery', {
      title: 'Forgot Password | #WOKEWeekly',
      url: '/account/recovery',
    });
  });

  /**
   * Reset Password page
   * @route {GET} /account/reset/:token
   */
  app.get('/account/reset/:token', function(req, res){
    const { token } = req.params;
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) return renderErrPage(req, res, err, server);
      server.render(req, res, '/_auth/reset', {
        title: 'Reset Password | #WOKEWeekly',
        recoveryToken: token
      });
    });
  });

  /**
   * Admin page
   * @route {GET} /admin
   */
  app.get('/admin', function(req, res){
    server.render(req, res, '/_auth/admin', {
      title: 'Admin Tools | #WOKEWeekly',
    });
  });

   /**
   * Mental Health page
   * @route {GET} /mentalhealth
   */
   app.get('/mentalhealth', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'mentalhealth'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/variants', {
        title: '#WOKEWeekly Mental Health',
        description: 'Shattering the stigmata of discussion over our wellbeing through healthy conversation and education.',
        url: '/mentalhealth',
        cardImage: 'public/bg/card-mental.jpg',
        backgroundImage: 'bg-mental.jpg',
        pageText: text,
        coverImage: 'header-mental.jpg',
        imageLogo: 'mentalhealth-logo.png',
        imageAlt: 'Mental Health logo',
        theme: 'mental'
      });
    });
  });

  /**
   * Edit Mental Health page
   * @route {GET} /mentalhealth/edit
   */
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

  /**
   * About page
   * @route {GET} /executives/:slug
   */
  app.get('/about', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'about'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info', {
        title: 'About #WOKEWeekly',
        description: createExcerpt(text),
        pageText: text,
        cardImage: 'public/bg/card-about.jpg',
        url: '/about'
      });
    });
  });

  /**
   * Edit About page
   * @route {GET} /about/edit
   */
  app.get('/about/edit', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'about'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info/edit', {
        title: 'Edit About',
        description: text,
        resource: 'about',
        placeholder: `Write about #WOKEWeekly...`
      });
    });
  });

  /**
   * Privacy Policy page
   * @route {GET} /privacy
   */
  app.get('/privacy', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'privacy'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text, lastModified} = result[0];
      return server.render(req, res, '/info', {
        title: 'Privacy Policy | #WOKEWeekly',
        description: createExcerpt(text),
        pageText: text,
        url: '/privacy',
        lastModified: lastModified
      });
    });
  });

  /**
   * Edit Privacy Policy page
   * @route {GET} /privacy/edit
   */
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

  /**
   * Cookies Policy page
   * @route {GET} /cookies
   */
  app.get('/cookies', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'cookies'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info', {
        title: 'Cookies Policy | #WOKEWeekly',
        description: createExcerpt(text),
        pageText: text,
        url: '/cookies',
      });
    });
  });

  /**
   * Edit Cookies Policy page
   * @route {GET} /cookies/edit
   */
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

  /**
   * Donate page
   * @route {GET} /donate
   */
  app.get('/donate', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'donate'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info', {
        title: 'Donate | #WOKEWeekly',
        description: 'Contribute to the support of our movement.',
        pageText: text,
        url: '/donate',
        backgroundImage: 'bg-donate.jpg',
        cardImage: `public/bg/card-donate.jpg`,
      });
    });
  });

  /**
   * Edit Donate page
   * @route {GET} /donate/edit
   */
  app.get('/donate/edit', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'donate'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info/edit', {
        title: 'Edit Donate Page',
        description: text,
        resource: 'donate',
        placeholder: `How will #WOKEWeekly use donations?`
      });
    });
  });

  /**
   * 'Frequently Asked Questions' page
   * @route {GET} /faq
   */
  app.get('/faq', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'faq'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info', {
        title: 'FAQs | #WOKEWeekly',
        description: 'Our most Frequently Asked Questions.',
        pageText: text, 
        url: '/faq'
      });
    });
  });

  /**
   * Edit FAQs page
   * @route {GET} /faq/edit
   */
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

  /**
   * Recruitment page
   * @route {GET} /recruitment
   */
  app.get('/recruitment', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'recruitment'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info', {
        title: 'Recruitment | #WOKEWeekly',
        description: 'Join the family! Learn, grow and exercise your skills under us.',
        pageText: text,
        backgroundImage: 'bg-recruitment.jpg',
        cardImage: 'public/bg/card-recruitment.jpg',
        url: '/recruitment'
      });
    });
  });

  /**
   * Edit Recruitment page
   * @route {GET} /recruitment/edit
   */
  app.get('/recruitment/edit', function(req, res){
    conn.query(`SELECT * FROM resources WHERE name = 'recruitment'`, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const {text} = result[0];
      return server.render(req, res, '/info/edit', {
        title: 'Edit Recruitment Page',
        description: text,
        resource: 'recruitment',
        placeholder: `What are we recruiting for...?`
      });
    });
  });

  /**
   * Reviews Page
   * @route {GET} /reviews
   */
  app.get('/reviews', function(req, res){
    conn.query(`SELECT * FROM reviews`, function (err, result) {
      if (err) return renderErrPage(req, res, err, server);
      return server.render(req, res, '/reviews', {
        title: 'Reviews | #WOKEWeekly',
        description: 'Read what the people have to say about us.',
        url: '/reviews',
        cardImage: `public/bg/card-reviews.jpg`,
      });
    });
  });

  /**
   * Add Review page
   * @route {GET} /reviews/add
   */
  app.get('/reviews/add', function(req, res){
    server.render(req, res, '/reviews/crud', {
      title: 'Add New Review',
      operation: 'add'
    });
  });

  /**
   * Edit Review page
   * @route {GET} /reviews/edit/:id
   */
  app.get('/reviews/edit/:id', function(req, res){
    const { id } = req.params;
    const sql = "SELECT * FROM reviews WHERE id = ?";
    
    conn.query(sql, id, function (err, result) {
      if (err || !result.length) return renderErrPage(req, res, err, server);

      const review = result[0];
      server.render(req, res, '/reviews/crud', {
        title: 'Edit Review',
        operation: 'edit',
        review
      });
    });
  });

  /***************************************************************
   * FORMS
   **************************************************************/

  /**
   * Recruitment Form
   * @route {GET} /recruitment
   */
  app.get('/recruitment-form', function(req, res){
    res.writeHead(301, { Location: forms.recruitment });
    res.end();
  });

  /**
   * Audience Review Form
   * @route {GET} /feedback
   */
  app.get('/feedback', function(req, res){
    res.writeHead(301, { Location: forms.audienceFeedback });
    res.end();
  });

  /**
   * Client Review Form
   * @route {GET} /feedback/client
   */
  app.get('/feedback/client', function(req, res){
    res.writeHead(301, { Location: forms.clientFeedback });
    res.end();
  });

  /***************************************************************
   * RESOURCES
   **************************************************************/
     
  /**
   * Constitution PDF
   * @route {GET} /constitution
   */
  app.get('/constitution', function(req, res){
    request(`${cloudinary.url}/resources/Constitution.pdf`).pipe(res);
  });

  /**
   * Sponsorship Proposal PDF
   * @route {GET} /sponsorship-proposal
   */
  app.get('/sponsorship-proposal', function(req, res){
    request(`${cloudinary.url}/v1579300643/resources/Sponsorship_Proposal.pdf`).pipe(res);
  });

  /**
   * #Blackexcellence Tribute Guide PDF
   * @route {GET} /blackexcellence-tribute-guide
   */
  app.get('/blackexcellence-tribute-guide', function(req, res){
    request(`${cloudinary.url}/resources/BlackExcellence_Tribute_Guide.pdf`).pipe(res);
  });

  /**
   * Robots.txt page
   * @route {GET} /robots.txt
   */
  app.get('/robots.txt', (req, res) => (
    res.status(200).sendFile(path.resolve('./robots.txt'), {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8', }
    })
  ));

  /**
   * Sitemap generated page
   * @route {GET} /sitemap.xml
   */
  app.get('/sitemap.xml', (req, res) => {
    const routes = [ '/', '/home', '/sessions', '/blackexcellence', '/mentalhealth',
    '/executives', '/reviews', '/signup', '/about', '/cookies', '/donate', '/faq',
    '/privacy', '/recruitment', '/feedback' ];

    async.parallel([
      function(callback){
        conn.query('SELECT slug FROM sessions', function (err, result) {
          if (err) return callback(err);
          result.forEach(session => routes.push(`/session/${session.slug}`));
          callback(null);
        });
      },
      function(callback){
        conn.query('SELECT id FROM blackex', function (err, result) {
          if (err) return callback(err);
          result.forEach(candidate => routes.push(`/blackexcellence/candidate/${candidate.id}`));
          callback(null);
        });
      },
      function(callback){
        conn.query(`SELECT slug FROM team WHERE level = 'Executive'`, function (err, result) {
          if (err) return callback(err);
          result.forEach(exec => routes.push(`/executives/${exec.slug}`));
          callback(null);
        });
      },
      function(callback){
        conn.query(`SELECT slug FROM team WHERE level != 'Executive' AND verified = 1;`, function (err, result) {
          if (err) return callback(err);
          result.forEach(member => routes.push(`/team/member/${member.slug}`));
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

/**
 * Create an excerpt from the description of a web page.
 * @param {string} text - Piece of text to be served.
 * @returns {Boolean} The excerpt shown in previews.
 */
const createExcerpt = (text) => {
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