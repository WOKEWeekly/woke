const assert = require("assert");

let _db;
let _knex;

const setDb = (DbInstance) => {
  _db = DbInstance;
  console.log("DB has been set");
};

const getDb = () => {
  assert.ok(_db, "Db has not been initialized.");
  return _db;
};

const setKnex = (KnexInstance) => {
  _knex = KnexInstance;
  console.log("Knex has been set");
};

const getKnex = () => {
  assert.ok(_knex, "Knex has not been initialized.");
  return _knex;
};


module.exports = {
  setDb: setDb,
  getDb: getDb,
  setKnex: setKnex,
  getKnex: getKnex,
};
