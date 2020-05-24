/* eslint-disable jsdoc/require-param */
const { respondToClient } = require('../../response');
const SQL = require('../../sql');
const conn = require('../db').getDb();
const ERROR = require('../../errors');

/** Update page */
exports.updatePage = (req, res) => {
  const { page, text } = req.body;
    const { sql, values } = SQL.PAGES.UPDATE(page, text);

    conn.query(sql, values, function (err, result) {
      if (err) return respondToClient(res, err);
      if (result.affectedRows === 0) err = ERROR.INVALID_PAGE_NAME(page);
      respondToClient(res, err, 200);
    });
};