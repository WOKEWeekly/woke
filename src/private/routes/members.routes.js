const express = require('express');
const router = express.Router();
const { zText } = require('zavid-modules');

const { ENTITY, OPERATIONS } = require('../../constants/strings');
const knex = require('../singleton/knex').getKnex();
const ERROR = require('../errors');
const { renderErrorPage } = require('../response');
const server = require('../singleton/server').getServer();

/** Team page */
router.get('/team', (req, res) => {
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
router.get('/team/:slug', (req, res) => {
  const { slug } = req.params;

  const query = knex
    .select()
    .from('members')
    .where({
      slug: slug,
      verified: 1
    })
    .whereNot('level', 'Guest');
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
router.get('/admin/members', (req, res) => {
  return server.render(req, res, '/team/admin', {
    title: 'Team Members | #WOKEWeekly',
    backgroundImage: 'bg-team.jpg'
  });
});

/** Add Team Member page */
router.get('/admin/members/add', (req, res) => {
  return server.render(req, res, '/team/crud', {
    title: 'Add New Member',
    operation: OPERATIONS.CREATE,
    backgroundImage: 'bg-team.jpg'
  });
});

/** Edit Team Member page */
router.get('/admin/members/edit/:id', (req, res) => {
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

module.exports = router;
