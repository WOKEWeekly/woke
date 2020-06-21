const express = require('express');
const router = express.Router();
const { zText } = require('zavid-modules');

const { ENTITY, OPERATIONS } = require('../../../constants/strings');
const knex = require('../../singleton/knex').getKnex();
const ERROR = require('../../errors');
const { renderErrorPage } = require('../../response');
const server = require('../../singleton/server').getServer();

const columns = [
  'candidates.*',
  {
    authorName: knex.raw("CONCAT(members.firstname, ' ', members.lastname)")
  },
  { authorLevel: 'members.level' },
  { authorSlug: 'members.slug' },
  { authorImage: 'members.image' },
  { authorDescription: 'members.description' },
  { authorSocials: 'members.socials' }
];

/** #BlackExcellence page */
router.get('/blackexcellence', (req, res) => {
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

/** Individual #BlackExcellence Candidate page */
router.get('/blackexcellence/:id', (req, res) => {
  const id = req.params.id;

  const query = knex
    .columns(columns)
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
      ogUrl: `/blackexcellence/${candidate.id}`,
      cardImage: candidate.image,
      alt: candidate.label,
      backgroundImage: 'bg-blackex.jpg',
      theme: 'blackex',
      candidate
    });
  });
});

/** Add #BlackExcellence Candidate form */
router.get('/admin/candidates/add', (req, res) => {
  return server.render(req, res, '/blackexcellence/crud', {
    title: 'Add New Candidate',
    backgroundImage: 'bg-blackex.jpg',
    operation: OPERATIONS.CREATE,
    theme: 'blackex'
  });
});

/** Edit #BlackExcellence Candidate form */
router.get('/admin/candidates/edit/:id', (req, res) => {
  const id = req.params.id;

  const query = knex
    .columns(columns)
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

module.exports = router;
