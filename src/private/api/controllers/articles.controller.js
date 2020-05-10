const { respondToClient } = require('../../response');
const async = require('async');
const SQL = require('../../sql');
const conn = require('../db').getDb();
const filer = require('../../filer');
const { DIRECTORY, ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');

/** Retrieve all articles */
exports.getAllArticles = (req, res) => {
  const sql = SQL.ARTICLES.READ.ALL();
  conn.query(sql, function (err, articles) {
    respondToClient(res, err, 200, articles);
  });
};

/** Retrieve individual article */
exports.getArticle = (req, res) => {
  const id = req.params.id;
  conn.query(SQL.ARTICLES.READ.SINGLE('id'), id, function (
    err,
    [article] = []
  ) {
    if (err) return respondToClient(res, err);
    if (!article) err = ERROR.INVALID_ENTITY_ID(ENTITY.ARTICLE, id);
    respondToClient(res, err, 200, article);
  });
};

/** Retrieve only published articles */
exports.getPublishedArticles = (req, res) => {
  const { limit, order } = req.query;
  const sql = SQL.ARTICLES.READ.PUBLISHED({
    limit,
    order
  });
  conn.query(sql, function (err, articles) {
    respondToClient(res, err, 200, articles);
  });
};

/** Add new article to database */
exports.addArticle = (req, res) => {
  const article = req.body;

  async.waterfall(
    [
      function (callback) {
        // Upload image to cloud
        filer.uploadImage(article, DIRECTORY.ARTICLES, true, callback);
      },
      function (article, callback) {
        // Add article to database
        const { sql, values } = SQL.ARTICLES.CREATE(article);
        conn.query(sql, [values], function (err, result) {
          err ? callback(err) : callback(null, result.insertId);
        });
      }
    ],
    function (err, id) {
      respondToClient(res, err, 201, {
        id
      });
    }
  );
};

/** Update details of existing articles in database */
exports.updateArticle = (req, res) => {
  const id = req.params.id;
  const { article, changed } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Delete old image if changed.
        conn.query(SQL.ARTICLES.READ.SINGLE('id', 'image'), id, function (
          err,
          [article] = []
        ) {
          if (err) return callback(err);
          if (!article)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.ARTICLE, id));
          if (!changed) return callback(null);
          filer.destroyImage(article.image, callback);
        });
      },
      function (callback) {
        // Equally, upload new image if changed
        filer.uploadImage(article, DIRECTORY.ARTICLES, changed, callback);
      },
      function (article, callback) {
        // Update review in database
        const { sql, values } = SQL.ARTICLES.UPDATE(id, article, changed);
        conn.query(sql, values, function (err) {
          err ? callback(err) : callback(null, article.slug);
        });
      }
    ],
    function (err, slug) {
      respondToClient(res, err, 200, {
        slug
      });
    }
  );
};

/** Delete an existing article from database */
exports.deleteArticle = (req, res) => {
  const id = req.params.id;

  async.waterfall(
    [
      function (callback) {
        // Delete image from cloud
        conn.query(SQL.ARTICLES.READ.SINGLE('id', 'image'), id, function (
          err,
          [article] = []
        ) {
          if (err) return callback(err);
          if (!article)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.ARTICLE, id));
          filer.destroyImage(article.image, callback);
        });
      },
      function (callback) {
        // Delete article from database
        conn.query(SQL.ARTICLES.DELETE, id, function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 204);
    }
  );
};
