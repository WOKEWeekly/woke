const express = require('express');
const router = express.Router();

const articlesRoutes = require('./articles.routes');
const candidatesRoutes = require('./candidates.routes');
const documentsRoutes = require('./documents.routes');
const membersRoutes = require('./member.routes');

const server = require('../../setServer').getServer();

router.use('/articles', articlesRoutes);
router.use('/candidates', candidatesRoutes);
router.use('/documents', documentsRoutes);
router.use('/members', membersRoutes);

/** Admin page */
router.get('/', (req, res) => {
  server.render(req, res, '/_auth/admin', {
    title: 'Admin Tools | #WOKEWeekly'
  });
});

module.exports = router;
