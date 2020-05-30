const async = require('async');
const jwt = require('jsonwebtoken');
const request = require('request');
const sm = require('sitemap');
const { zText } = require('zavid-modules');

const path = require('path');

const ERROR = require('./errors.js');
const { renderErrorPage } = require('./response.js');

const {
  accounts,
  cloudinary,
  domain,
  forms,
  siteDescription
} = require('../constants/settings.js');
const { ENTITY, OPERATIONS, PAGE } = require('../constants/strings.js');

const env = process.env.NODE_ENV !== 'production' ? 'dev' : 'prod';

let exigencies = {};

module.exports = function (app, knex, server) {
  exigencies = { knex, server };

  /** Home page */
  app.get(['/', '/home'], function (req, res) {
    return server.render(req, res, '/home', {
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: siteDescription,
      ogUrl: '/',
      backgroundImage: 'bg-app.jpg'
    });
  });

  /** Sessions page */
  app.get('/sessions', function (req, res) {
    return server.render(req, res, '/sessions', {
      title: 'Sessions | #WOKEWeekly',
      description: 'Where the magic happens...',
      ogUrl: '/sessions',
      cardImage: `public/bg/card-sessions.jpg`,
      backgroundImage: 'bg-sessions.jpg'
    });
  });

  /** Individual session page */
  app.get('/session/:slug', function (req, res) {
    const { slug } = req.params;
    const query = knex.select().from('sessions').where('slug', slug);
    query.asCallback(function (err, [session] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!session)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.SESSION),
          server
        );

      return server.render(req, res, '/sessions/single', {
        title: `${session.title} | #WOKEWeekly`,
        description: zText.extractExcerpt(session.description),
        ogUrl: `/sessions/${session.slug}`,
        cardImage: session.image,
        backgroundImage: 'bg-sessions.jpg',
        session
      });
    });
  });

  /** Add Session page */
  app.get('/sessions/add', function (req, res) {
    return server.render(req, res, '/sessions/crud', {
      title: 'Add New Session',
      operation: OPERATIONS.CREATE,
      backgroundImage: 'bg-sessions.jpg'
    });
  });

  /** Edit Session page */
  app.get('/sessions/edit/:id', function (req, res) {
    const { id } = req.params;
    const query = knex.select().from('sessions').where('id', id);
    query.asCallback(function (err, [session] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!session)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.SESSION),
          server
        );

      return server.render(req, res, '/sessions/crud', {
        title: 'Edit Session',
        backgroundImage: 'bg-sessions.jpg',
        operation: OPERATIONS.UPDATE,
        session
      });
    });
  });

  /** Topic Bank page */
  app.get('/topics', function (req, res) {
    const accessToken = req.query.access;
    knex
      .select()
      .from('tokens')
      .where('name', 'topicBank')
      .asCallback(function (err, [token] = []) {
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
  app.get('/topics/add', function (req, res) {
    return server.render(req, res, '/topics/crud', {
      title: 'Add New Topic',
      operation: OPERATIONS.CREATE,
      backgroundImage: 'bg-topics.jpg'
    });
  });

  /** Edit Topic page */
  app.get('/topics/edit/:id', function (req, res) {
    const id = req.params.id;
    const query = knex.select().from('topics').where('id', id);
    query.asCallback(function (err, [topic] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!topic)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.TOPIC),
          server
        );

      return server.render(req, res, '/topics/crud', {
        title: 'Edit Topic',
        operation: OPERATIONS.UPDATE,
        backgroundImage: 'bg-topics.jpg',
        topic
      });
    });
  });

  /** #BlackExcellence page */
  app.get('/blackexcellence', function (req, res) {
    return server.render(req, res, '/blackexcellence', {
      title: '#BlackExcellence | #WOKEWeekly',
      description:
        'Recognising the intrinsic potential in young black rising stars who are excelling in their respective fields and walks of life.',
      ogUrl: '/blackexcellence',
      backgroundImage: 'bg-blackex.jpg',
      cardImage: `public/bg/card-blackex.jpg`,
      theme: 'blackex'
    });
  });

  /** Add #BlackExcellence Candidate page */
  app.get('/blackexcellence/add', function (req, res) {
    return server.render(req, res, '/blackexcellence/crud', {
      title: 'Add New Candidate',
      backgroundImage: 'bg-blackex.jpg',
      operation: OPERATIONS.CREATE,
      theme: 'blackex'
    });
  });

  /** Edit #BlackExcellence Candidate page */
  app.get('/blackexcellence/edit/:id', function (req, res) {
    const id = req.params.id;

    const query = knex
      .columns([
        [
          'candidates.*',
          {
            authorName: knex.raw(
              "CONCAT(members.firstname, ' ', members.lastname)"
            )
          },
          { authorLevel: 'members.level' },
          { authorSlug: 'members.slug' },
          { authorImage: 'members.image' },
          { authorDescription: 'members.description' },
          { authorSocials: 'members.socials' }
        ]
      ])
      .select()
      .from('candidates')
      .leftJoin('members', 'candidates.authorId', 'members.id')
      .where('candidates.id', id);
    query.asCallback(function (err, [candidate] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!candidate)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.CANDIDATE),
          server
        );

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
  app.get('/blackexcellence/candidate/:id', function (req, res) {
    const id = req.params.id;

    const query = knex
      .columns([
        [
          'candidates.*',
          {
            authorName: knex.raw(
              "CONCAT(members.firstname, ' ', members.lastname)"
            )
          },
          { authorLevel: 'members.level' },
          { authorSlug: 'members.slug' },
          { authorImage: 'members.image' },
          { authorDescription: 'members.description' },
          { authorSocials: 'members.socials' }
        ]
      ])
      .select()
      .from('candidates')
      .leftJoin('members', 'candidates.authorId', 'members.id')
      .where('candidates.id', id);
    query.asCallback(function (err, [candidate] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!candidate)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.CANDIDATE),
          server
        );

      candidate.label = `#${candidate.id}: ${candidate.name}`;
      return server.render(req, res, '/blackexcellence/single', {
        title: `${candidate.label} | #WOKEWeekly`,
        description: zText.extractExcerpt(candidate.description),
        ogUrl: `/blackexcellence/candidate/${candidate.id}`,
        cardImage: candidate.image,
        alt: candidate.label,
        backgroundImage: 'bg-blackex.jpg',
        theme: 'blackex',
        candidate
      });
    });
  });

  /** Team page */
  app.get('/team', function (req, res) {
    return server.render(req, res, '/team', {
      title: 'The Team | #WOKEWeekly',
      description:
        'Explore the profiles of the very members who make #WOKE what it is today.',
      ogUrl: '/team',
      cardImage: 'public/bg/card-team.jpg',
      backgroundImage: 'bg-team.jpg'
    });
  });

  /** Individual team member page */
  app.get('/team/:slug', function (req, res) {
    const { slug } = req.params;

    const query = knex.select().from('members').where({
      slug: slug,
      verified: 1
    });
    query.asCallback(function (err, [member] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!member)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.MEMBER),
          server
        );

      return server.render(req, res, '/team/single', {
        title: `${member.firstname} ${member.lastname} | #WOKEWeekly`,
        description: zText.extractExcerpt(member.description),
        ogUrl: `/team/${member.slug}`,
        cardImage: member.image,
        alt: `${member.firstname} ${member.lastname}`,
        backgroundImage: 'bg-team.jpg',
        member
      });
    });
  });

  /** Team Members page */
  app.get('/admin/members', function (req, res) {
    return server.render(req, res, '/team/admin', {
      title: 'Team Members | #WOKEWeekly',
      backgroundImage: 'bg-team.jpg'
    });
  });

  /** Add Team Member page */
  app.get('/admin/members/add', function (req, res) {
    return server.render(req, res, '/team/crud', {
      title: 'Add New Member',
      operation: OPERATIONS.CREATE,
      backgroundImage: 'bg-team.jpg'
    });
  });

  /** Edit Team Member page */
  app.get('/admin/members/edit/:id', function (req, res) {
    const { id } = req.params;
    const query = knex.select().from('members').where('id', id);
    query.asCallback(function (err, [member] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!member)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.MEMBER),
          server
        );

      return server.render(req, res, '/team/crud', {
        title: 'Edit Team Member',
        operation: OPERATIONS.UPDATE,
        backgroundImage: 'bg-team.jpg',
        member
      });
    });
  });

  /** Reviews Page */
  app.get('/reviews', function (req, res) {
    return server.render(req, res, '/reviews', {
      title: 'Reviews | #WOKEWeekly',
      description: 'Read what the people have to say about us.',
      ogUrl: '/reviews',
      cardImage: `public/bg/card-reviews.jpg`
    });
  });

  /** Add Review page */
  app.get('/reviews/add', function (req, res) {
    return server.render(req, res, '/reviews/crud', {
      title: 'Add New Review',
      operation: OPERATIONS.CREATE
    });
  });

  /** Edit Review page */
  app.get('/reviews/edit/:id', function (req, res) {
    const id = req.params.id;

    const query = knex.select().from('reviews').where('id', id);
    query.asCallback(function (err, [review] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!review)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.REVIEW),
          server
        );

      server.render(req, res, '/reviews/crud', {
        title: 'Edit Review',
        operation: OPERATIONS.UPDATE,
        review
      });
    });
  });

  /** Registered users page */
  app.get('/users', function (req, res) {
    return server.render(req, res, '/users', {
      title: 'Registered Users | #WOKEWeekly'
    });
  });

  /** Registration page */
  app.get('/signup', function (req, res) {
    return server.render(req, res, '/_auth/signup', {
      title: 'Sign Up | #WOKEWeekly',
      backgroundImage: 'bg-signup.jpg',
      ogUrl: '/signup'
    });
  });

  /** Blog page */
  app.get('/blog', function (req, res) {
    return server.render(req, res, '/articles', {
      title: 'The #WOKEWeekly Blog',
      description:
        'Explore the expressions of our writers who put pen to paper over the various dimensions within our community.',
      ogUrl: '/blog',
      cardImage: `public/bg/card-sessions.jpg`, // TODO: Change while designing
      backgroundImage: 'bg-app.jpg'
    });
  });

  /** Individual blog post */
  app.get('/blog/:slug', function (req, res) {
    const slug = req.params.slug;

    const query = knex
      .columns([
        'articles.*',
        {
          authorName: knex.raw(
            "CONCAT(members.firstname, ' ', members.lastname)"
          )
        },
        { authorLevel: 'members.level' },
        { authorSlug: 'members.slug' },
        { authorImage: 'members.image' },
        { authorDescription: 'members.description' },
        { authorSocials: 'members.socials' }
      ])
      .select()
      .from('articles')
      .where('articles.slug', slug)
      .leftJoin('members', 'articles.authorId', 'members.id');
    query.asCallback(function (err, [article] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!article)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.ARTICLE),
          server
        );

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
  app.get('/admin/articles', function (req, res) {
    return server.render(req, res, '/articles/admin', {
      title: 'Blog Admin'
    });
  });

  /** Add article */
  app.get('/admin/articles/add', function (req, res) {
    return server.render(req, res, '/articles/crud', {
      title: 'Add New Article',
      operation: OPERATIONS.CREATE,
      backgroundImage: 'bg-app.jpg'
    });
  });

  /** Edit article */
  app.get('/admin/articles/edit/:id', function (req, res) {
    const { id } = req.params;

    const query = knex
      .columns([
        'articles.*',
        {
          authorName: knex.raw(
            "CONCAT(members.firstname, ' ', members.lastname)"
          )
        },
        { authorLevel: 'members.level' },
        { authorSlug: 'members.slug' },
        { authorImage: 'members.image' },
        { authorDescription: 'members.description' },
        { authorSocials: 'members.socials' }
      ])
      .select()
      .from('articles')
      .where('articles.id', id)
      .leftJoin('members', 'articles.authorId', 'members.id');
    query.asCallback(function (err, [article] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!article)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.ARTICLE),
          server
        );

      return server.render(req, res, '/articles/crud', {
        title: 'Edit Article',
        backgroundImage: 'bg-app.jpg',
        operation: OPERATIONS.UPDATE,
        article
      });
    });
  });

  /** Document admin page */
  app.get('/admin/documents', function (req, res) {
    return server.render(req, res, '/documents', {
      title: 'Document Admin'
    });
  });

  /** Add new document form */
  app.get('/admin/documents/add', function (req, res) {
    return server.render(req, res, '/documents/crud', {
      title: 'Add New Document',
      operation: OPERATIONS.CREATE
    });
  });

  /** Edit document form */
  app.get('/admin/documents/edit/:id', function (req, res) {
    const { id } = req.params;

    const query = knex.select().from('documents').where('id', id);
    query.asCallback(function (err, [document] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!document)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.DOCUMENT),
          server
        );

      return server.render(req, res, '/documents/crud', {
        title: 'Edit Document',
        operation: OPERATIONS.UPDATE,
        document
      });
    });
  });

  /** User account page */
  app.get('/account', function (req, res) {
    const token = req.query.verified;

    async.waterfall(
      [
        function (callback) {
          if (!token) return callback(null, false);
          // TODO: Sort this out
          jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
            if (err) return callback(null, false);
            callback(null, true, result.user);
          });
        }
      ],
      function (err, justVerified, user = {}) {
        if (err) return res.redirect('/');
        server.render(req, res, '/_auth/account', {
          title: 'Account | #WOKEWeekly',
          ogUrl: '/account',
          justVerified: justVerified,
          verifiedUser: user
        });
      }
    );
  });

  /** 'Forgot Password' page */
  app.get('/account/recovery', function (req, res) {
    return server.render(req, res, '/_auth/recovery', {
      title: 'Forgot Password | #WOKEWeekly',
      ogUrl: '/account/recovery'
    });
  });

  /** Reset Password page */
  app.get('/account/reset/:token', function (req, res) {
    const { token } = req.params;

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) return renderErrorPage(req, res, err, server);
      return server.render(req, res, '/_auth/reset', {
        title: 'Reset Password | #WOKEWeekly'
      });
    });
  });

  /** Admin page */
  app.get('/admin', function (req, res) {
    server.render(req, res, '/_auth/admin', {
      title: 'Admin Tools | #WOKEWeekly'
    });
  });

  app.get('/docs/:name', function (req, res) {
    const { name } = req.params;
    const query = knex.select().from('documents').where('name', name);
    query.asCallback(function (err, [document] = []) {
      if (err) return renderErrorPage(req, res, err, server);
      if (!document)
        return renderErrorPage(
          req,
          res,
          ERROR.NONEXISTENT_ENTITY(ENTITY.DOCUMENT),
          server
        );
      return renderDocument(res, document);
    });
  });

  app.get('/:page', function (req, res, next) {
    const name = req.params.page;
    knex
      .select()
      .from('pages')
      .asCallback(function (err, pages) {
        const page = pages.find((element) => element.name === name);
        if (!page) return next();
        return renderPage(req, res, page, PAGE.OPERATIONS.READ);
      });
  });

  app.get('/:page/edit', function (req, res, next) {
    const name = req.params.page;
    knex
      .select()
      .from('pages')
      .asCallback(function (err, pages) {
        const page = pages.find((element) => element.name === name);
        if (!page) return next();
        return renderPage(req, res, page, PAGE.OPERATIONS.UPDATE);
      });
  });

  /***************************************************************
   * OTHER MEDIA
   **************************************************************/

  /** Link to Spotify */
  app.get('/podcast', function (req, res) {
    res.writeHead(301, { Location: accounts.spotify });
    res.end();
  });

  /** Subscribe to YouTube */
  app.get('/subscribe', function (req, res) {
    res.writeHead(301, { Location: accounts.youtube });
    res.end();
  });

  /** Current zoom link */
  app.get('/zoom', function (req, res) {
    res.writeHead(301, {
      Location: accounts.zoom,
      'Cache-Control': 'no-cache'
    });
    res.end();
  });

  /** Join Slack workspace link */
  app.get('/slack', function (req, res) {
    res.writeHead(301, {
      Location: accounts.slack,
      'Cache-Control': 'no-cache'
    });
    res.end();
  });

  /** Join Trello team link */
  app.get('/trello', function (req, res) {
    res.writeHead(301, {
      Location: accounts.trello,
      'Cache-Control': 'no-cache'
    });
    res.end();
  });

  /***************************************************************
   * FORMS
   **************************************************************/

  /** Recruitment Form */
  app.get('/recruitment-form', function (req, res) {
    res.writeHead(301, { Location: forms.recruitment });
    res.end();
  });

  /** Audience Review Form */
  app.get('/feedback', function (req, res) {
    res.writeHead(301, { Location: forms.audienceFeedback });
    res.end();
  });

  /** Client Review Form */
  app.get('/feedback/client', function (req, res) {
    res.writeHead(301, { Location: forms.clientFeedback });
    res.end();
  });

  /** Membership Form */
  app.get('/membership-form', function (req, res) {
    res.writeHead(301, { Location: forms.membership });
    res.end();
  });

  /***************************************************************
   * OTHER
   **************************************************************/

  /** Robots.txt page */
  app.get('/robots.txt', (req, res) =>
    res.status(200).sendFile(path.resolve('./robots.txt'), {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    })
  );

  /** Sitemap generated page */
  app.get('/sitemap.xml', (req, res) => {
    const routes = [
      '/',
      '/home',
      '/sessions',
      '/blackexcellence',
      '/team',
      '/reviews',
      '/signup'
    ];

    async.parallel(
      [
        function (callback) {
          const query = knex.select('slug').from('sessions');
          query.asCallback(function (err, result) {
            if (err) return callback(err);
            result.forEach((session) =>
              routes.push(`/session/${session.slug}`)
            );
            callback(null);
          });
        },
        function (callback) {
          const query = knex.select('id').from('candidates');
          query.asCallback(function (err, result) {
            if (err) return callback(err);
            result.forEach((candidate) =>
              routes.push(`/blackexcellence/candidate/${candidate.id}`)
            );
            callback(null);
          });
        },
        function (callback) {
          const query = knex
            .select('slug')
            .from('members')
            .where('verified', 1);
          query.asCallback(function (err, result) {
            if (err) return callback(err);
            result.forEach((member) => routes.push(`/team/${member.slug}`));
            callback(null);
          });
        },
        function (callback) {
          const query = knex.select('name').from('pages');
          query.asCallback(function (err, result) {
            if (err) return callback(err);
            result.forEach((page) => routes.push(`/${page.name}`));
            callback(null);
          });
        }
      ],
      function () {
        const sitemap = sm.createSitemap({
          hostname: domain,
          cacheTime: 10 * 60 * 1000 // 10 minutes,
        });

        routes.forEach((route) => {
          sitemap.add({ url: route, changefreq: 'weekly' });
        });

        sitemap.toXML(function (err, xml) {
          if (err) return res.status(500).end();
          res.header('Content-Type', 'application/xml');
          res.send(xml);
        });
      }
    );
  });
};

/**
 * Render a document, particularly a PDF, from Cloudinary.
 * @param {object} res - The response context.
 * @param {object} document - The document object containing
 * the file and version.
 */
const renderDocument = (res, document) => {
  const { file, version } = document;
  let url;

  if (version) {
    url = `${cloudinary.url}/v${version}/${env}/documents/${file}`;
  } else {
    url = `${cloudinary.url}/${env}/documents/${file}`;
  }

  request(url).pipe(res);
};

/**
 * Dynamically render a page from the database.
 * @param {string} pageName - The name of the page.
 * @param {string} [operation] - Either 'READ' or 'UPDATE'. Defaults to 'READ'.
 */
const renderPage = (req, res, page, operation) => {
  const { server } = exigencies;

  const {
    name,
    title,
    kind,
    includeDomain,
    text,
    excerpt,
    cardImage,
    bgImage,
    coverImage,
    coverImageLogo,
    coverImageAlt,
    theme,
    editTitle,
    editPlaceholderText,
    lastModified
  } = page;

  let uri = '';
  let information = {};

  if (operation === PAGE.OPERATIONS.READ) {
    uri = `/pages/${kind.toLowerCase()}`;
    information = {
      pageName: name,
      pageText: text,
      title: includeDomain ? `${title} | #WOKEWeekly` : title,
      description: excerpt || zText.extractExcerpt(text),
      ogUrl: `/${name}`,
      cardImage: cardImage || 'public/bg/card-home.jpg',
      backgroundImage: bgImage || 'bg-app.jpg',
      coverImage: coverImage,
      imageLogo: coverImageLogo,
      imageAlt: coverImageAlt,
      theme: theme || PAGE.THEMES.DEFAULT,
      lastModified
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
    };
  }

  return server.render(req, res, uri, information);
};
