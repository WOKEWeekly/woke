const express = require('express');
const router = express.Router();
const { zText } = require('zavid-modules');

const { ENTITY, OPERATIONS } = require('../../constants/strings');
const knex = require('../singleton/knex').getKnex();
const ERROR = require('../errors');
const { renderErrorPage } = require('../response');
const server = require('../singleton/server').getServer();

/** Sessions page */
router.get('/', (req, res) => {
  return server.render(req, res, '/sessions', {
    title: 'Sessions | #WOKEWeekly',
    description: 'Where the magic happens...',
    ogUrl: '/sessions',
    cardImage: `public/bg/card-sessions.jpg`,
    backgroundImage: 'bg-sessions.jpg'
  });
});

/** Individual session page */
// router.get('/:slug)', (req, res)=>{
//   const { slug } = req.params;
//   const query = knex.select().from('sessions').where('slug', slug);
//   query.asCallback(function (err, [session] = []) {
//     if (err) return renderErrorPage(req, res, err, server);
//     if (!session)
//       return renderErrorPage(
//         req,
//         res,
//         ERROR.NONEXISTENT_ENTITY(ENTITY.SESSION),
//         server
//       );

//     return server.render(req, res, '/sessions/single', {
//       title: `${session.title} | #WOKEWeekly`,
//       description: zText.extractExcerpt(session.description),
//       ogUrl: `/sessions/${session.slug}`,
//       cardImage: session.image,
//       backgroundImage: 'bg-sessions.jpg',
//       session
//     });
//   });
// });

/** Add Session page */
router.get('/add', (req, res) => {
  return server.render(req, res, '/sessions/crud', {
    title: 'Add New Session',
    operation: OPERATIONS.CREATE,
    backgroundImage: 'bg-sessions.jpg'
  });
});

/** Edit Session page */
router.get('/edit/:id', (req, res) => {
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

module.exports = router;
