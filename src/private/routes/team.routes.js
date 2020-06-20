const express = require('express');
const router = express.Router();
const { zText } = require('zavid-modules');

const { ENTITY } = require('../../constants/strings');
const knex = require('../setKnex').getKnex();
const ERROR = require('../errors');
const { renderErrorPage } = require('../response');
const server = require('../setServer').getServer();

/** Team page */
router.get('/', (req, res) => {
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
router.get('/:slug', (req, res) => {
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

module.exports = router;
