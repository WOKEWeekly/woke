const async = require('async');
const jwt = require('jsonwebtoken');
const path = require('path');
const request = require('request');
const sm = require('sitemap');

const ERROR = require('./errors.js');
const { renderErrorPage } = require('./response.js');
const SQL = require('./sql.js');

const { cloudinary, domain, forms, siteDescription } = require('../constants/settings.js');
const { OPERATIONS, PAGE } = require('../constants/strings.js');

let exigencies = {};

module.exports = function(app, conn, server){

  exigencies = { conn, server }

  /** Home page */
  app.get(['/', '/home'], function(req, res){
    return server.render(req, res, '/home', { 
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: siteDescription,
      url: '/',
      backgroundImage: 'bg-app.jpg'
    });
  });

  /** Sessions page */
  app.get('/sessions', function(req, res){
    return server.render(req, res, '/sessions', { 
      title: 'Sessions | #WOKEWeekly',
      description: 'Where the magic happens...',
      url: '/sessions',
      cardImage: `public/bg/card-sessions.jpg`,
      backgroundImage: 'bg-sessions.jpg'
     });
  });

  /** Individual session page */
  app.get('/session/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = SQL.SESSIONS.READ.SINGLE('slug');
    
    conn.query(sql, [slug], function (err, [session] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!session) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.SESSION), server);
      
      return server.render(req, res, '/sessions/single', {
        title: `${session.title} | #WOKEWeekly`,
        description: createExcerpt(session.description),
        url: `/sessions/${session.slug}`,
        cardImage: session.image,
        backgroundImage: 'bg-sessions.jpg',
        session
      });
    });
  });

  /** Add Session page */
  app.get('/sessions/add', function(req, res){
    return server.render(req, res, '/sessions/crud', {
      title: 'Add New Session',
      operation: 'add',
      backgroundImage: 'bg-sessions.jpg'
    });
  });

  /** Edit Session page */
  app.get('/sessions/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = SQL.SESSIONS.READ.SINGLE('id');
    
    conn.query(sql, id, function (err, [session] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!session) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.SESSION), server);

      return server.render(req, res, '/sessions/crud', {
        title: 'Edit Session',
        backgroundImage: 'bg-sessions.jpg',
        operation: 'edit',
        session
      });
    });
  });

  /** Topic Bank page */
  app.get('/topics', function(req, res){
    const accessToken = req.query.access;
    const sql = SQL.TOKENS.READ('topicBank');

    conn.query(sql, function (err, [token] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      const hasAccess = token && token.value === accessToken;

      return server.render(req, res, '/topics', {
        title: 'Topic Bank | #WOKEWeekly',
        description: 'The currency of the franchise.',
        url: '/topics',
        cardImage: `public/bg/card-topics.jpg`,
        backgroundImage: 'bg-topics.jpg',
        hasAccess
      });
    });
  });

  /** Add Topic page */
  app.get('/topics/add', function(req, res){
    return server.render(req, res, '/topics/crud', {
      title: 'Add New Topic',
      operation: 'add',
      backgroundImage: 'bg-topics.jpg'
    });
  });

  /** Edit Topic page */
  app.get('/topics/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = SQL.TOPICS.READ.SINGLE();
    
    conn.query(sql, id, function (err, [topic]) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!topic) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.TOPIC), server);

      return server.render(req, res, '/topics/crud', {
        title: 'Edit Topic',
        operation: 'edit',
        backgroundImage: 'bg-topics.jpg',
        topic
      });
    });
  });

  /** #BlackExcellence page */
  app.get('/blackexcellence', function(req, res){
    return server.render(req, res, '/blackexcellence', {
      title: '#BlackExcellence | #WOKEWeekly',
      description: 'Recognising the intrinsic potential in young black rising stars who are excelling in their respective fields and walks of life.',
      url: '/blackexcellence',
      backgroundImage: 'bg-blackex.jpg',
      cardImage: `public/bg/card-blackex.jpg`,
      theme: 'blackex'
    });
  });

  /** Add #BlackExcellence Candidate page */
  app.get('/blackexcellence/add', function(req, res){
    return server.render(req, res, '/blackexcellence/crud', {
      title: 'Add New Candidate',
      backgroundImage: 'bg-blackex.jpg',
      operation: 'add',
      theme: 'blackex'
    });
  });

  /** Edit #BlackExcellence Candidate page */
  app.get('/blackexcellence/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = SQL.CANDIDATES.READ.SINGLE();
    
    conn.query(sql, id, function (err, [candidate] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!candidate) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.CANDIDATE), server);

      return server.render(req, res, '/blackexcellence/crud', {
        title: 'Edit Candidate',
        backgroundImage: 'bg-blackex.jpg',
        theme: 'blackex',
        operation: 'edit',
        candidate
      });
    });
  });

  /** Individual #BlackExcellence Candidate page */
  app.get('/blackexcellence/candidate/:id', function(req, res){
    const id = req.params.id;
    const sql = SQL.CANDIDATES.READ.JOIN_MEMBERS;
    
    conn.query(sql, id, function (err, [candidate] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!candidate) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.CANDIDATE), server);
      
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

  /** Executives page */
  app.get('/executives', function(req, res){
    return server.render(req, res, '/team/exec', {
      title: 'Meet The Executives | #WOKEWeekly',
      description: 'The masterminds behind the cause.',
      url: '/executives',
      cardImage: 'public/bg/card-team.jpg',
      backgroundImage: 'bg-team.jpg',
    });
  });

  /** Individual executive page */
  app.get('/executives/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = SQL.MEMBERS.READ.EXECUTIVES_SLUG;
    
    conn.query(sql, [slug], function (err, [exec] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!exec) return renderErrorPage(req, res, ERROR.NONEXISTENT_MEMBER(true), server);
      
      return server.render(req, res, '/team/single', {
        title: `${exec.firstname} ${exec.lastname} | #WOKEWeekly`,
        description: createExcerpt(exec.description),
        url: `/executives/${exec.slug}`,
        cardImage: exec.image,
        backgroundImage: 'bg-team.jpg',
        member: exec
      });
    });
  });

  /** Team Members page */
  app.get('/team', function(req, res){
    return server.render(req, res, '/team', {
      title: 'Team Members | #WOKEWeekly',
      backgroundImage: 'bg-team.jpg',
    });
  });

  /** Individual team member page */
  app.get('/team/member/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = SQL.MEMBERS.READ.SLUG;
    
    conn.query(sql, slug, function (err, [member] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!member) return renderErrorPage(req, res, ERROR.NONEXISTENT_MEMBER(false), server);

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

  /** Add Team Member page */
  app.get('/team/add', function(req, res){
    return server.render(req, res, '/team/crud', {
      title: 'Add New Member',
      operation: 'add',
      backgroundImage: 'bg-team.jpg'
    });
  });

  /** Edit Team Member page */
  app.get('/team/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = SQL.MEMBERS.READ.SINGLE();
    
    conn.query(sql, id, function (err, [member] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!member) return renderErrorPage(req, res, ERROR.NONEXISTENT_MEMBER(false), server);

      return server.render(req, res, '/team/crud', { 
        title: 'Edit Team Member',
        operation: 'edit',
        backgroundImage: 'bg-team.jpg',
        member
      });
    });
  });

  /** Reviews Page */
  app.get('/reviews', function(req, res){
    return server.render(req, res, '/reviews', {
      title: 'Reviews | #WOKEWeekly',
      description: 'Read what the people have to say about us.',
      url: '/reviews',
      cardImage: `public/bg/card-reviews.jpg`,
    });
  });

  /** Add Review page */
  app.get('/reviews/add', function(req, res){
    return server.render(req, res, '/reviews/crud', {
      title: 'Add New Review',
      operation: 'add'
    });
  });

  /** Edit Review page */
  app.get('/reviews/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = "SELECT * FROM reviews WHERE id = ?";
    
    conn.query(sql, id, function (err, [review] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!review) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.REVIEW), server);

      server.render(req, res, '/reviews/crud', {
        title: 'Edit Review',
        operation: 'edit',
        review
      });
    });
  });

  /** Registered users page */
  app.get('/users', function(req, res){
    return server.render(req, res, '/users', {
      title: 'Registered Users | #WOKEWeekly'
    });
  });

  /** Registration page */
  app.get('/signup', function(req, res){
    return server.render(req, res, '/_auth/signup', {
      title: 'Sign Up | #WOKEWeekly',
      backgroundImage: 'bg-signup.jpg',
      url: '/signup',
    });
  });

  /** Blog page */
  app.get('/blog', function(req, res){
    return server.render(req, res, '/articles', { 
      title: 'The #WOKEWeekly Blog',
      description: 'Explore the expressions of our writers who put pen to paper over the various dimensions within our community.',
      url: '/blog',
      cardImage: `public/bg/card-sessions.jpg`, // TODO: Change while designing
      backgroundImage: 'bg-app.jpg'
     });
  });

  /** Individual blog post */
  app.get('/blog/:slug', function(req, res){
    const slug = req.params.slug;
    const sql = SQL.ARTICLES.READ.SINGLE('slug');
    
    conn.query(sql, [slug], function (err, [article] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!article) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.ARTICLE), server);
      
      return server.render(req, res, '/articles/single', {
        title: `${article.title} | #WOKEWeekly`,
        description: article.excerpt,
        url: `/blog/${article.slug}`,
        cardImage: article.image,
        backgroundImage: 'bg-app.jpg', // TODO: Change while designing
        article
      });
    });
  });

  /** Blog admin page */
  app.get('/admin/articles', function(req, res){
    return server.render(req, res, '/articles/admin', { 
      title: 'Blog Admin'
     });
  });

  /** Add article */
  app.get('/admin/articles/add', function(req, res){
    return server.render(req, res, '/articles/crud', {
      title: 'Add New Article',
      operation: OPERATIONS.CREATE,
      backgroundImage: 'bg-app.jpg'
    });
  });

  /** Edit article */
  app.get('/admin/articles/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = SQL.ARTICLES.READ.SINGLE('id');
    
    conn.query(sql, id, function (err, [article] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!article) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.ARTICLE), server);

      return server.render(req, res, '/articles/crud', {
        title: 'Edit Article',
        backgroundImage: 'bg-app.jpg',
        operation: 'edit',
        article
      });
    });
  });

  /** User account page */
  app.get('/account', function(req, res){
    const token = req.query.verified;

    async.waterfall([
      function(callback){
        if (!token) return callback(null, false);
        // TODO: Sort this out
        jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
          if (err) return callback(null, false);
          callback(null, true, result.user);
        });
      }
    ], function(err, justVerified, user = {}){
      server.render(req, res, '/_auth/account', {
        title: 'Account | #WOKEWeekly',
        url: '/account',
        justVerified: justVerified,
        verifiedUser: user
      });
    });
  });

  /** 'Forgot Password' page */
  app.get('/account/recovery', function(req, res){
    return server.render(req, res, '/_auth/recovery', {
      title: 'Forgot Password | #WOKEWeekly',
      url: '/account/recovery',
    });
  });

  /** Reset Password page */
  app.get('/account/reset/:token', function(req, res){
    const { token } = req.params;

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) return renderErrorPage(req, res, err, server);
      return server.render(req, res, '/_auth/reset', {
        title: 'Reset Password | #WOKEWeekly'
      });
    });
  });

  /** Admin page */
  app.get('/admin', function(req, res){
    server.render(req, res, '/_auth/admin', {
      title: 'Admin Tools | #WOKEWeekly',
    });
  });

  /***************************************************************
   * FORMS
   **************************************************************/

  /** Recruitment Form */
  app.get('/recruitment-form', function(req, res){
    res.writeHead(301, { Location: forms.recruitment });
    res.end();
  });

  /** Audience Review Form */
  app.get('/feedback', function(req, res){
    res.writeHead(301, { Location: forms.audienceFeedback });
    res.end();
  });

  /** Client Review Form */
  app.get('/feedback/client', function(req, res){
    res.writeHead(301, { Location: forms.clientFeedback });
    res.end();
  });

  /***************************************************************
   * RESOURCES
   **************************************************************/
     
  /** Constitution PDF */
  app.get('/constitution', function(req, res){
    request(`${cloudinary.url}/resources/Constitution.pdf`).pipe(res);
  });

  /** Sponsorship Proposal PDF */
  app.get('/sponsorship-proposal', function(req, res){
    request(`${cloudinary.url}/v1579300643/resources/Sponsorship_Proposal.pdf`).pipe(res);
  });

  /** #Blackexcellence Tribute Guide PDF */
  app.get('/blackexcellence-tribute-guide', function(req, res){
    request(`${cloudinary.url}/resources/BlackExcellence_Tribute_Guide.pdf`).pipe(res);
  });

  /** Robots.txt page */
  app.get('/robots.txt', (req, res) => (
    res.status(200).sendFile(path.resolve('./robots.txt'), {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8', }
    })
  ));

  /** Sitemap generated page */
  app.get('/sitemap.xml', (req, res) => {
    const routes = [ '/', '/home', '/sessions', '/blackexcellence', '/executives',
      '/reviews', '/signup' ];

    async.parallel([
      function(callback){
        conn.query('SELECT slug FROM sessions', function (err, result) {
          if (err) return callback(err);
          result.forEach(session => routes.push(`/session/${session.slug}`));
          callback(null);
        });
      },
      function(callback){
        conn.query('SELECT id FROM candidates', function (err, result) {
          if (err) return callback(err);
          result.forEach(candidate => routes.push(`/blackexcellence/candidate/${candidate.id}`));
          callback(null);
        });
      },
      function(callback){
        conn.query(`SELECT slug FROM members WHERE level = 'Executive'`, function (err, result) {
          if (err) return callback(err);
          result.forEach(exec => routes.push(`/executives/${exec.slug}`));
          callback(null);
        });
      },
      function(callback){
        conn.query(`SELECT slug FROM members WHERE level != 'Executive' AND verified = 1;`, function (err, result) {
          if (err) return callback(err);
          result.forEach(member => routes.push(`/team/member/${member.slug}`));
          callback(null);
        });
      },
      function(callback){
        conn.query(`SELECT page_name FROM pages;`, function (err, result) {
          if (err) return callback(err);
          result.forEach(page => routes.push(`/${page.page_name}`));
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

  app.get('/about', renderPage('about', PAGE.KINDS.INFO));
  app.get('/about/edit', renderPage('about', PAGE.KINDS.INFO, PAGE.OPERATIONS.UPDATE));

  app.get('/cookies', renderPage('cookies', PAGE.KINDS.INFO));
  app.get('/cookies/edit', renderPage('cookies', PAGE.KINDS.INFO, PAGE.OPERATIONS.UPDATE));

  app.get('/donate', renderPage('donate', PAGE.KINDS.INFO));
  app.get('/donate/edit', renderPage('donate', PAGE.KINDS.INFO, PAGE.OPERATIONS.UPDATE));

  app.get('/faq', renderPage('faq', PAGE.KINDS.INFO));
  app.get('/faq/edit', renderPage('faq', PAGE.KINDS.INFO, PAGE.OPERATIONS.UPDATE));

  app.get('/mentalhealth', renderPage('mentalhealth', PAGE.KINDS.VARIANTS));
  app.get('/mentalhealth/edit', renderPage('mentalhealth', PAGE.KINDS.VARIANTS, PAGE.OPERATIONS.UPDATE));

  app.get('/privacy', renderPage('privacy', PAGE.KINDS.INFO));
  app.get('/privacy/edit', renderPage('privacy', PAGE.KINDS.INFO, PAGE.OPERATIONS.UPDATE));

  app.get('/recruitment', renderPage('recruitment', PAGE.KINDS.INFO));
  app.get('/recruitment/edit', renderPage('recruitment', PAGE.KINDS.INFO, PAGE.OPERATIONS.UPDATE));

}

/**
 * Dynamically render a page from the database.
 * @param {string} pageName - The name of the page.
 * @param {string} kind - Either PAGE.KINDS.VARIANTS or 'information'.
 * @param {string} [operation] - Either 'READ' or 'UPDATE'. Defaults to 'READ'.
 */
const renderPage = (
    pageName,
    kind,
    operation = PAGE.OPERATIONS.READ
  ) => {
  const { conn, server } = exigencies;
  return function(req, res){
    conn.query(`SELECT * FROM pages WHERE name = '${pageName}'`, function (err, [page] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!page) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.PAGE), server);
  
      const { name, title, include_domain, text, excerpt, card_image, bg_image,
        cover_image, cover_image_logo, cover_image_alt, theme,
        edit_title, edit_placeholder_text } = page;

      let uri = '';
      let information = {};
  
      if (operation === PAGE.OPERATIONS.READ){
        uri = `/pages/${kind}`;
        information = {
          pageName: name,
          pageText: text,
          title: include_domain ? `${title} | #WOKEWeekly` : title,
          description: excerpt || createExcerpt(text),
          url: `/${name}`,
          cardImage: card_image || 'public/bg/card-home.jpg',
          backgroundImage: bg_image || 'bg-app.jpg',
          coverImage: cover_image,
          imageLogo: cover_image_logo,
          imageAlt: cover_image_alt,
          theme: theme || PAGE.THEMES.DEFAULT
        };
      } else {
        uri = `/pages/edit`;
        information = {
          pageName: name,
          pageText: text,
          title: edit_title,
          backgroundImage: bg_image || 'bg-app.jpg',
          placeholderText: edit_placeholder_text,
          theme: theme || PAGE.THEMES.DEFAULT
        }
      }

      return server.render(req, res, uri, information);
    });
  }
}

/**
 * Create an excerpt from the description of a web page.
 * @param {string} text - Piece of text to be served.
 * @returns {string} The excerpt shown in previews.
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