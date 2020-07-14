/* eslint-disable jsdoc/require-param */
const async = require('async');

const { ENTITY } = require('../../../constants/strings');
const emails = require('../../emails');
const ERROR = require('../../errors');
const filer = require('../../filer');
const { respondToClient } = require('../../response');
const knex = require('../../singleton/knex').getKnex();

const emailsOn =
  process.env.NODE_ENV === 'production' || process.argv.includes('--emails');

const columns = [
  'articles.*',
  {
    authorName: knex.raw("CONCAT(members.firstname, ' ', members.lastname)")
  },
  { authorLevel: 'members.level' },
  { authorSlug: 'members.slug' },
  { authorImage: 'members.image' },
  { authorDescription: 'members.description' },
  { authorSocials: 'members.socials' }
];

/** Retrieve all articles */
exports.getAllArticles = (req, res) => {
  const query = knex
    .columns(columns)
    .select()
    .from('articles')
    .leftJoin('members', 'articles.authorId', 'members.id');
  query.asCallback(function (err, articles) {
    respondToClient(res, err, 200, articles);
  });
};

/** Retrieve individual article */
exports.getSingleArticle = (req, res) => {
  const { id } = req.params;
  const query = knex
    .columns(columns)
    .select()
    .from('articles')
    .leftJoin('members', 'articles.authorId', 'members.id')
    .where('articles.id', id);
  query.asCallback(function (err, [article] = []) {
    if (err) return respondToClient(res, err);
    if (!article) err = ERROR.INVALID_ENTITY_ID(ENTITY.ARTICLE, id);
    respondToClient(res, err, 200, article);
  });
};

/** Retrieve only published articles */
exports.getPublishedArticles = (req, res) => {
  const { exception, limit, order } = req.query;
  let query = knex
    .columns(columns)
    .select()
    .from('articles')
    .leftJoin('members', 'articles.authorId', 'members.id')
    .where('articles.status', 'PUBLISHED');

  if (exception) query.whereNot('articles.id', exception);
  if (limit) query = query.limit(limit);
  if (order) query = query.orderBy('datePublished', order);

  query.asCallback(function (err, articles) {
    respondToClient(res, err, 200, articles);
  });
};

/** Add new article to database */
exports.addArticle = (req, res) => {
  const { article, isPublish } = req.body;

  async.waterfall(
    [
      // Upload image to cloud
      function (callback) {
        filer.uploadArticleImages(article, true, callback);
      },
      // Add article to database
      function (article, callback) {
        const query = knex.insert(article).into('articles');
        query.asCallback(function (err, [id] = []) {
          article.id = id;
          callback(err, article);
        });
      },
      // Send emails to all subscribers if publish
      function (article, callback) {
        if (!isPublish || !emailsOn) return callback(null, article.id);
        const query = knex
          .columns(columns)
          .select('')
          .from('articles')
          .leftJoin('members', 'articles.authorId', 'members.id')
          .where('articles.id', article.id);
        query.asCallback(function (err, [article] = []) {
          emails.notifyNewArticle(article);
          callback(err, article.id);
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
  const { article, changed, isPublish } = req.body;

  async.waterfall(
    [
      // Delete old image if changed.
      function (callback) {
        const query = knex.select().from('articles').where('id', id);
        query.asCallback(function (err, [article] = []) {
          if (err) return callback(err);
          if (!article)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.ARTICLE, id));
          if (!changed) return callback(null);
          deleteArticleImages(article, callback);
        });
      },
      // Equally, upload new image if changed
      function (callback) {
        filer.uploadArticleImages(article, changed, callback);
      },
      // Update article in database
      function (article, callback) {
        const query = knex('articles').update(article).where('id', id);
        query.asCallback(function (err) {
          callback(err, article);
        });
      },
      // Send emails to all subscribers if publish
      function (article, callback) {
        if (!isPublish || !emailsOn) return callback(null, article.slug);
        const query = knex
          .columns(columns)
          .select('')
          .from('articles')
          .leftJoin('members', 'articles.authorId', 'members.id')
          .where('articles.id', id);
        query.asCallback(function (err, [article] = []) {
          emails.notifyNewArticle(article);
          callback(err, article.slug);
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

/** Increment number of claps for article */
exports.clapForArticle = (req, res) => {
  const { id } = req.params;
  async.waterfall(
    [
      function (callback) {
        // Increment claps
        const query = knex('articles').increment({ claps: 1 }).where('id', id);
        query.asCallback(function (err) {
          callback(err);
        });
      },
      function (callback) {
        // Retrieve new clap count
        const query = knex.select('claps').from('articles').where('id', id);
        query.asCallback(function (err, [claps] = []) {
          callback(err, claps);
        });
      }
    ],
    function (err, claps) {
      respondToClient(res, err, 200, { ...claps });
    }
  );
};

/** Delete the article */
exports.deleteArticle = (req, res) => {
  const { id } = req.params;

  async.waterfall(
    [
      function (callback) {
        // Delete image from cloud
        const query = knex.select().from('articles').where('id', id);
        query.asCallback(function (err, [article] = []) {
          if (err) return callback(err);
          if (!article)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.ARTICLE, id));

          deleteArticleImages(article, callback);
        });
      },
      function (callback) {
        // Delete article from database
        const query = knex('articles').where('id', id).del();
        query.asCallback(function (err) {
          callback(err);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 204);
    }
  );
};

/**
 * Delete an article's images.
 * @param {object} article - The article whose images are to be deleted.
 * @param {Function} callback - The callback.
 */
const deleteArticleImages = (article, callback) => {
  const { coverImage, fillerImages } = article;
  try {
    const images = [coverImage].concat(JSON.parse(fillerImages));
    filer.destroyMultipleImages(images, callback);
  } catch (e) {
    console.error('There was a problem deleting the article image.', e);
    callback(null);
  }
};
