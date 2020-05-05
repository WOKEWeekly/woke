const async = require('async');
const jwt = require('jsonwebtoken');
const path = require('path');
const request = require('request');
const sm = require('sitemap');

const ERROR = require('./errors.js');
const { renderErrorPage } = require('./response.js');
const SQL = require('./sql.js');

const { accounts, cloudinary, domain, forms, siteDescription } = require('../constants/settings.js');
const { ENTITY, OPERATIONS, PAGE } = require('../constants/strings.js');

const env = process.env.NODE_ENV !== 'production' ? 'dev' : 'prod';

let exigencies = {};

module.exports = function(app, conn, knex, server){

  exigencies = { conn, knex, server };

  /** Home page */
  app.get(['/', '/home'], function(req, res){
    return server.render(req, res, '/home', { 
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: siteDescription,
      ogUrl: '/',
      backgroundImage: 'bg-app.jpg'
    });
  });

  /** Sessions page */
  app.get('/sessions', function(req, res){
    return server.render(req, res, '/sessions', { 
      title: 'Sessions | #WOKEWeekly',
      description: 'Where the magic happens...',
      ogUrl: '/sessions',
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
        ogUrl: `/sessions/${session.slug}`,
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
      operation: OPERATIONS.CREATE,
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
        operation: OPERATIONS.UPDATE,
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
        ogUrl: '/topics',
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
      operation: OPERATIONS.CREATE,
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
        operation: OPERATIONS.UPDATE,
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
      ogUrl: '/blackexcellence',
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
      operation: OPERATIONS.CREATE,
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
        operation: OPERATIONS.UPDATE,
        candidate
      });
    });
  });

  /** Individual #BlackExcellence Candidate page */
  app.get('/blackexcellence/candidate/:id', function(req, res){
    const id = req.params.id;
    const sql = SQL.CANDIDATES.READ.SINGLE();
    
    conn.query(sql, id, function (err, [candidate] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!candidate) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.CANDIDATE), server);
      
      candidate.label = `#${candidate.id}: ${candidate.name}`;
      return server.render(req, res, '/blackexcellence/single', {
        title: `${candidate.label} | #WOKEWeekly`,
        description: createExcerpt(candidate.description),
        ogUrl: `/blackexcellence/candidate/${candidate.id}`,
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
      ogUrl: '/executives',
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
      if (!exec) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.MEMBER), server);
      
      return server.render(req, res, '/team/single', {
        title: `${exec.firstname} ${exec.lastname} | #WOKEWeekly`,
        description: createExcerpt(exec.description),
        ogUrl: `/executives/${exec.slug}`,
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
      if (!member) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.MEMBER), server);

      return server.render(req, res, '/team/single', { 
        title: `${member.firstname} ${member.lastname} | #WOKEWeekly`,
        description: createExcerpt(member.description),
        ogUrl: `/team/member/${member.slug}`,
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
      operation: OPERATIONS.CREATE,
      backgroundImage: 'bg-team.jpg'
    });
  });

  /** Edit Team Member page */
  app.get('/team/edit/:id', function(req, res){
    const id = req.params.id;
    const sql = SQL.MEMBERS.READ.SINGLE();
    
    conn.query(sql, id, function (err, [member] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!member) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.MEMBER), server);

      return server.render(req, res, '/team/crud', { 
        title: 'Edit Team Member',
        operation: OPERATIONS.UPDATE,
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
      ogUrl: '/reviews',
      cardImage: `public/bg/card-reviews.jpg`,
    });
  });

  /** Add Review page */
  app.get('/reviews/add', function(req, res){
    return server.render(req, res, '/reviews/crud', {
      title: 'Add New Review',
      operation: OPERATIONS.CREATE
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
        operation: OPERATIONS.UPDATE,
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
      ogUrl: '/signup',
    });
  });

  /** Blog page */
  app.get('/blog', function(req, res){
    return server.render(req, res, '/articles', { 
      title: 'The #WOKEWeekly Blog',
      description: 'Explore the expressions of our writers who put pen to paper over the various dimensions within our community.',
      ogUrl: '/blog',
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
        ogUrl: `/blog/${article.slug}`,
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
        operation: OPERATIONS.UPDATE,
        article
      });
    });
  });

  /** Document admin page */
  app.get('/admin/documents', function(req, res){
    return server.render(req, res, '/documents', { 
      title: 'Document Admin'
     });
  });

  /** Add new document form */
  app.get('/admin/documents/add', function(req, res){
    return server.render(req, res, '/documents', { 
      title: 'Add New Admin',
      operation: OPERATIONS.CREATE,
      backgroundImage: 'bg-app.jpg'
     });
  });

  /** Edit document form */
  app.get('/admin/documents/edit/:name', function(req, res){
    const { name } = req.params;

    const query = knex.select().from('documents').where('name', name);
    query.asCallback(function (err, [document] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!document) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.DOCUMENT), server);

      return server.render(req, res, '/documents/crud', {
        title: 'Edit Document',
        operation: OPERATIONS.UPDATE,
        document
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
        ogUrl: '/account',
        justVerified: justVerified,
        verifiedUser: user
      });
    });
  });

  /** 'Forgot Password' page */
  app.get('/account/recovery', function(req, res){
    return server.render(req, res, '/_auth/recovery', {
      title: 'Forgot Password | #WOKEWeekly',
      ogUrl: '/account/recovery',
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
  * OTHER MEDIA
  **************************************************************/
  
  /** Link to Spotify */
  app.get('/podcast', function(req, res){
    res.writeHead(301, { Location: accounts.spotify });
    res.end();
  });

  /** Subscribe to YouTube */
  app.get('/subscribe', function(req, res){
    res.writeHead(301, { Location: accounts.youtube });
    res.end();
  });

  /** Current zoom link */
  app.get('/zoom', function(req, res){
    res.writeHead(307, { Location: accounts.zoom, 'Cache-Control': 'no-cache' });
    res.end();
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
        conn.query(`SELECT name FROM pages;`, function (err, result) {
          if (err) return callback(err);
          result.forEach(page => routes.push(`/${page.name}`));
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

  app.get('/docs/:name', function(req, res){
    const { name } = req.params;
    const query = knex.select().from('documents').where('name', name);
    query.asCallback(function(err, [document] = []){
      if (err) return renderErrorPage(req, res, err, server);
      if (!document) return renderErrorPage(req, res, ERROR.NONEXISTENT_ENTITY(ENTITY.DOCUMENT), server);
      return renderDocument(res, document);
    });
  });

  app.get('/:page', function(req, res, next){
    const name = req.params.page;
    knex.select().from('pages').asCallback(function(err, pages){
      const page = pages.find(element => element.name === name);
      if (!page) return next();
      return renderPage(req, res, page, PAGE.OPERATIONS.READ);
    });
  });

  app.get('/:page/edit', function(req, res, next){
    const name = req.params.page;
    knex.select().from('pages').asCallback(function(err, pages){
      const page = pages.find(element => element.name === name);
      if (!page) return next();
      return renderPage(req, res, page, PAGE.OPERATIONS.UPDATE);
    });
  });
}

/**
 * Render a document, particularly a PDF, from Cloudinary.
 * @param {Object} res - The response context.
 * @param {Object} document - The document object containing
 * the file and version.
 */
const renderDocument = (res, document) => {
  const { file, version } = document;
  let url;

  if (version){
    url = `${cloudinary.url}/v${version}/${env}/documents/${file}`
  } else {
    url = `${cloudinary.url}/${env}/documents/${file}`
  }

  request(url).pipe(res); 
}

/**
 * Dynamically render a page from the database.
 * @param {string} pageName - The name of the page.
 * @param {string} [operation] - Either 'READ' or 'UPDATE'. Defaults to 'READ'.
 */
const renderPage = (req, res, page, operation) => {
  const { server } = exigencies;

  const { name, title, kind, includeDomain, text, excerpt, cardImage, bgImage,
    coverImage, coverImageLogo, coverImageAlt, theme,
    editTitle, editPlaceholderText } = page;

  let uri = '';
  let information = {};

  if (operation === PAGE.OPERATIONS.READ){
    uri = `/pages/${kind.toLowerCase()}`;
    information = {
      pageName: name,
      pageText: text,
      title: includeDomain ? `${title} | #WOKEWeekly` : title,
      description: excerpt || createExcerpt(text),
      ogUrl: `/${name}`,
      cardImage: cardImage || 'public/bg/card-home.jpg',
      backgroundImage: bgImage || 'bg-app.jpg',
      coverImage: coverImage,
      imageLogo: coverImageLogo,
      imageAlt: coverImageAlt,
      theme: theme || PAGE.THEMES.DEFAULT
    };
  } else if (operation === PAGE.OPERATIONS.UPDATE) {
    uri = `/pages/edit`;
    information = {
      pageName: name,
      pageText: text,
      title: editTitle,
      backgroundImage: bgImage || 'bg-app.jpg',
      placeholderText: editPlaceholderText,
      theme: theme || PAGE.THEMES.DEFAULT
    }
  }

  return server.render(req, res, uri, information);
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