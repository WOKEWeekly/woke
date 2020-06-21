const express = require('express');
const router = express.Router();

const server = require('../../singleton/server').getServer();

/** Admin page */
router.get('/', (req, res) => {
  server.render(req, res, '/_auth/admin', {
    title: 'Admin Tools | #WOKEWeekly'
  });
});

module.exports = router;
