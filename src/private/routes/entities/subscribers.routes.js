const express = require('express');
const router = express.Router();

const knex = require('../../singleton/knex').getKnex();
const server = require('../../singleton/server').getServer();

/** Page for subscribers */
router.get('/admin/subscribers', (req, res) => {
    return server.render(req, res, '/subscribers/admin', {
      title: 'Subscribers | #WOKEWeekly',
      backgroundImage: 'bg-team.jpg'
    });
  });

module.exports = router;