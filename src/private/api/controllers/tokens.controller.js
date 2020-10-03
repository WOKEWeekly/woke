/* eslint-disable jsdoc/require-param */
const { respondToClient } = require('../../response');
const knex = require('../../singleton/knex').getKnex();

/** Update page */
exports.updateZoomLink = (req, res) => {
  const { value } = req.body;

  Promise.resolve()
    .then(() => {
      return knex('tokens')
        .update({
          value,
          lastUpdated: new Date()
        })
        .where('name', 'zoomLink');
    })
    .then(() => {
      respondToClient(res, null, 200);
    })
    .catch((err) => {
      respondToClient(res, err);
    });
};
