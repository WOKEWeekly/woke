const assert = require('assert');

let _server;

const setServer = (ServerInstance) => {
  _server = ServerInstance;
  console.info('Connected to database.');
};

const getServer = () => {
  assert.ok(_server, 'Server has not been initialized.');
  return _server;
};

module.exports = {
  setServer: setServer,
  getServer: getServer
};
