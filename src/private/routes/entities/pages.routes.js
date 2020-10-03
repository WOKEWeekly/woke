/* eslint-disable jsdoc/require-returns */
const express = require('express');
const { zText } = require('zavid-modules');
const router = express.Router();

const { PAGE } = require('../../../constants/strings');
const knex = require('../../singleton/knex').getKnex();
const server = require('../../singleton/server').getServer();

router.get('/:page', function (req, res, next) {
  const name = req.params.page;
  Promise.resolve()
    .then(() => {
      return knex.select().from('pages').where('name', name);
    })
    .then(([page]) => {
      if (!page) return next();
      return renderPage(req, res, page, PAGE.OPERATIONS.READ);
    });
});

router.get('/:page/edit', function (req, res, next) {
  const name = req.params.page;
  knex
    .select()
    .from('pages')
    .asCallback(function (err, pages) {
      const page = pages.find((element) => element.name === name);
      if (!page) return next();
      return renderPage(req, res, page, PAGE.OPERATIONS.UPDATE);
    });
});

module.exports = router;

/**
 * Dynamically render a page from the database.
 * @param {string} req - The request context.
 * @param {string} res - The response context.
 * @param {string} page - The name of the page.
 * @param {string} [operation] - Either 'READ' or 'UPDATE'. Defaults to 'READ'.
 */
const renderPage = (req, res, page, operation = PAGE.OPERATIONS.READ) => {
  const {
    name,
    title,
    kind,
    includeDomain,
    text,
    excerpt,
    cardImage,
    bgImage,
    coverImage,
    coverImageLogo,
    coverImageAlt,
    theme,
    editTitle,
    editPlaceholderText,
    lastModified
  } = page;

  let uri = '';
  let information = {};

  if (operation === PAGE.OPERATIONS.READ) {
    uri = `/pages/${kind.toLowerCase()}`;
    information = {
      pageName: name,
      pageText: text,
      title: includeDomain ? `${title} | #WOKEWeekly` : title,
      description: excerpt || zText.extractExcerpt(text),
      ogUrl: `/${name}`,
      cardImage: cardImage || 'public/bg/card-home.jpg',
      backgroundImage: bgImage || 'bg-app.jpg',
      coverImage: coverImage,
      imageLogo: coverImageLogo,
      imageAlt: coverImageAlt,
      theme: theme || PAGE.THEMES.DEFAULT,
      lastModified
    };
  } else if (operation === PAGE.OPERATIONS.UPDATE) {
    uri = `/pages/edit`;
    information = {
      pageName: name,
      pageText: text,
      title: editTitle,
      backgroundImage: bgImage || 'bg-app.jpg',
      placeholderText: editPlaceholderText,
      theme: theme || PAGE.THEMES.DEFAULT
    };
  }

  return server.render(req, res, uri, information);
};
