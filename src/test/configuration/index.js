const axios = require('axios');

const { startTestServer, isStageTesting, port } = require('../../server.js');
axios.defaults.baseURL = `http://localhost:${port}`;

// Check if user is dev before running test.
if (process.env.MYSQL_USER !== 'dev') {
  console.error('Trying to run test with user that is not dev');
  process.exit(0);
}

// If staging environment, start server before running tests.
if (isStageTesting) {
  console.warn('Running service tests in staging environment.');
  before(function (done) {
    startTestServer(done);
  });
}

// Stop server / return control to terminal after running tests.
after(function () {
  setTimeout(() => process.exit(0), 2000);
});

module.exports = {
  /** For the assertion library */
  assert: require('chai').assert,

  /**
   * Abstract function for HTTP requests.
   * @param {string} request.url - The url to make the request to.
   * @param {string} [request.method] - The method of the request. Defaults to GET.
   * @param {object} [request.body] - The payload for the request.
   * @param {object} [request.headers] - The headers to accompany the request.
   * @param {Function} [request.onSuccess] - Function triggered on successful request.
   * @param {Function} [request.onError] - Function triggered on successful request.
   * @param {Function} [request.done] - The callback to finish the test.
   */
  request: ({
    url,
    method = 'GET',
    body,
    headers = {},
    onSuccess,
    onError,
    done
  }) => {
    headers['Content-Type'] = 'application/json';

    axios({
      url,
      method,
      data: body,
      headers
    })
      .then((response) => {
        if (onSuccess) onSuccess(response);
        done();
      })
      .catch((error) => {
        if (typeof onError === 'function') {
          onError(error.response);
          done();
        } else {
          done(error);
        }
      });
  },

  /** The header options used for valid requests */
  HEADERS: {
    TOKEN: (user) => ({
      Authorization: `Bearer ${user.token}`
    }),
    KEY: {
      Authorization: process.env.AUTH_KEY
    }
  }
};
