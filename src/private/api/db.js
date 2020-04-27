const assert = require("assert");

let _db;
const setDb = (DbInstance) => {
  _db = DbInstance;
  console.log("DB has been set");
};

const getDb = () => {
  assert.ok(_db, "Db has not been initialized.");
  return _db;
};

module.exports = {
  setDb: setDb,
  getDb: getDb,
};
