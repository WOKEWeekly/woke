/* eslint-disable jsdoc/require-param */
const { respondToClient } = require('../../response');
const knex = require('../../setKnex').getKnex();
const ERROR = require('../../errors');

/** Update page */
exports.updatePage = (req, res) => {
  const { page, text } = req.body;

  const query = knex('pages')
    .update({
      text: text,
      lastModified: new Date()
    })
    .where('name', page);
  query.asCallback(function (err, result) {
    if (err) return respondToClient(res, err);
    if (result === 0) err = ERROR.INVALID_PAGE_NAME(page);
    respondToClient(res, err, 200);
  });
};
