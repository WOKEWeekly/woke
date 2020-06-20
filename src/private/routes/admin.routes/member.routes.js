const express = require('express');
const router = express.Router();

const { ENTITY, OPERATIONS } = require('../../../constants/strings');
const knex = require('../../setKnex').getKnex();
const ERROR = require('../../errors');
const { renderErrorPage } = require('../../response');
const server = require('../../setServer').getServer();

/** Team Members page */
router.get('/', (req, res) => {
  return server.render(req, res, '/team/admin', {
    title: 'Team Members | #WOKEWeekly',
    backgroundImage: 'bg-team.jpg'
  });
});

/** Add Team Member page */
router.get('/add', (req, res) => {
  return server.render(req, res, '/team/crud', {
    title: 'Add New Member',
    operation: OPERATIONS.CREATE,
    backgroundImage: 'bg-team.jpg'
  });
});

/** Edit Team Member page */
router.get('/edit/:id', (req, res) => {
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
