const express = require('express');
const router = express.Router();

const documentsRoutes = require('./documents.routes');
const membersRoutes = require('./member.routes');

const server = require('../../singleton/server').getServer();

router.use('/documents', documentsRoutes);
router.use('/members', membersRoutes);

/** Admin page */
router.get('/', (req, res) => {
  server.render(req, res, '/_auth/admin', {
    title: 'Admin Tools | #WOKEWeekly'
  });
});

module.exports = router;
