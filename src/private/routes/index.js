const async = require('async');
const request = require('request');
const sm = require('sitemap');
const { zText } = require('zavid-modules');

const path = require('path');

const accountRoutes = require('./account.routes');
const adminRoutes = require('./admin.routes/admin.routes');
const articlesRoutes = require('./articles.routes');
const candidateRoutes = require('./candidates.routes');
const reviewsRoutes = require('./reviews.routes');
const sessionsRoutes = require('./sessions.routes');
const teamRoutes = require('./team.routes');
const topicsRoutes = require('./topics.routes');

const {
  accounts,
  cloudinary,
  domain,
  forms,
  siteDescription
} = require('../../constants/settings.js');
const { ENTITY, PAGE } = require('../../constants/strings.js');
const ERROR = require('../errors.js');
const { renderErrorPage } = require('../response.js');
const knex = require('../singleton/knex').getKnex();
const server = require('../singleton/server').getServer();

const env = process.env.NODE_ENV !== 'production' ? 'dev' : 'prod';

module.exports = function (app) {
  // Account Routes
  app.use('/', [accountRoutes, articlesRoutes, candidateRoutes]);

  // Admin Routes
  app.use('/admin', adminRoutes);

  // Reviews Routes
  app.use('/reviews', reviewsRoutes);

  // Sessions Routes
  app.use('/sessions', sessionsRoutes);

  // Team Routes
  app.use('/team', teamRoutes);

  // Topics Routes
  app.use('/topics', topicsRoutes);

  /** Home page */
  app.get(['/', '/home'], function (req, res) {
    return server.render(req, res, '/home', {
      title: '#WOKEWeekly - Awakening Through Conversation',
      description: siteDescription,
      ogUrl: '/',
      backgroundImage: 'bg-app.jpg'
    });
  });

  // /** Individual session page */
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

  app.get('/author/:slug', function (req, res) {
    const { slug } = req.params;

    const query = knex.select().from('members').where({
      level: 'Guest',
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
        ogUrl: `/author/${member.slug}`,
        cardImage: member.image,
        alt: `${member.firstname} ${member.lastname}`,
        backgroundImage: 'bg-team.jpg',
        member
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

  /** Unsubscribe page */
  app.get('/unsubscribe', function (req, res) {
    server.render(req, res, '/_auth/unsubscribe', {
      title: 'Unsubscribe | #WOKEWeekly'
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
    res.writeHead(301, {
      Location: accounts.spotify
    });
    res.end();
  });

  /** Subscribe to YouTube */
  app.get('/subscribe', function (req, res) {
    res.writeHead(301, {
      Location: accounts.youtube
    });
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
    res.writeHead(301, {
      Location: forms.recruitment
    });
    res.end();
  });

  /** Audience Review Form */
  app.get('/feedback', function (req, res) {
    res.writeHead(301, {
      Location: forms.audienceFeedback
    });
    res.end();
  });

  /** Client Review Form */
  app.get('/feedback/client', function (req, res) {
    res.writeHead(301, {
      Location: forms.clientFeedback
    });
    res.end();
  });

  /** Membership Form */
  app.get('/membership-form', function (req, res) {
    res.writeHead(301, {
      Location: forms.membership
    });
    res.end();
  });

  /***************************************************************
   * OTHER
   **************************************************************/

  /** Robots.txt page */
  app.get('/robots.txt', (req, res) =>
    res.status(200).sendFile(path.resolve('./robots.txt'), {
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      }
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
              routes.push(`/blackexcellence/${candidate.id}`)
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
          sitemap.add({
            url: route,
            changefreq: 'weekly'
          });
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
