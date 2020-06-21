const express = require('express');
const router = express.Router();

const { ENTITY, OPERATIONS } = require('../../../constants/strings');
const knex = require('../../singleton/knex').getKnex();
const ERROR = require('../../errors');
const { renderErrorPage } = require('../../response');
const server = require('../../singleton/server').getServer();

/** Add #BlackExcellence Candidate page */
router.get('/add', (req, res) => {
  return server.render(req, res, '/blackexcellence/crud', {
    title: 'Add New Candidate',
    backgroundImage: 'bg-blackex.jpg',
    operation: OPERATIONS.CREATE,
    theme: 'blackex'
  });
});

/** Edit #BlackExcellence Candidate page */
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;

  const query = knex
    .columns([
      'candidates.*',
      {
        authorName: knex.raw("CONCAT(members.firstname, ' ', members.lastname)")
      },
      { authorLevel: 'members.level' },
      { authorSlug: 'members.slug' },
      { authorImage: 'members.image' },
      { authorDescription: 'members.description' },
      { authorSocials: 'members.socials' }
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

module.exports = router;
