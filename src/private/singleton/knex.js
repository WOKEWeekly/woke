const assert = require('assert');

let _knex;

const setKnex = (KnexInstance) => {
  _knex = KnexInstance;
  console.info('Connected to database.');
};

const getKnex = () => {
  assert.ok(_knex, 'Knex has not been initialized.');
  return _knex;
};

module.exports = {
  setKnex: setKnex,
  getKnex: getKnex
};
