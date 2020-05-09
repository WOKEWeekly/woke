const { isStageTesting } = require('../server.js');
const showVerboseLogs = process.argv.includes('--verbose');

module.exports = {
  /**
   * Send a response to the client.
   * @param {object} res - The response context of the service.
   * @param {Error} err - The object containing information about the error.
   * @param {number} expectedStatus - The expected status code of the response.
   * Defaults to 400.
   * @param {object} [json] - The response body to be sent back to the client.
   */
  respondToClient: (res, err, expectedStatus, json) => {
    if (err && typeof err === 'object') {
      // If there is an error...
      if (!isStageTesting) {
        const log = showVerboseLogs ? err : err.toString();
        console.error(log);
      }
      res.status(err.status || 500).json({ message: err.message });
    } else {
      res.status(expectedStatus).json(json);
    }
  },

  /**
   * Display an error page on the web client with a description of the error.
   * @param {object} req - The request information from the client.
   * @param {object} res - The response context of the service
   * @param {Error} err - The object containing information about the error.
   * @param {object} server - The server object.
   */
  renderErrorPage: (req, res, err, server) => {
    if (err) console.error(err.toString());
    const message = err ? err.message : '';
    return server.render(req, res, '/_error', { message });
  },
};
