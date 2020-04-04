require('dotenv').config({path:'../../config.env'});

const host = "http://localhost:3000";
const axios = require('axios');
axios.defaults.baseURL = host;

module.exports = {

  /** For the assertion library */
  assert: require('chai').assert,

  /** For the JSON web token library */
  jwt: require('jsonwebtoken'),

  /**
   * Abstract function for HTTP requests.
   * @param {string} request.url - The url to make the request to.
   * @param {string} [request.method] - The method of the request. Defaults to GET.
   * @param {Object} [request.body] - The payload for the request.
   * @param {Object} [request.headers] - The headers to accompany the request.
   * @param {onSuccessCallback} request.onSuccess - Function triggered on successful request.
   * @param {onErrorCallback} request.onError - Function triggered on successful request.
   * @param {doneCallback} [request.done] - The callback to finish the test.
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
    axios({
      url,
      method,
      data: body,
      headers,
    })
    .then(response => {
      onSuccess(response);
      done();
    })
    .catch(error => {
      onError(error.response);
      done();
      // done(error);
    });
  },

  /** The header options used for valid requests */
  HEADERS: {
    TOKEN: (user) => ({
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',
    }),
    SIMPLE: {
      'Authorization': process.env.AUTH_KEY,
      'Content-Type': 'application/json',
    }
  }
}

/**
 * Function triggered on successful request.
 * @callback onSuccessCallback
 */

/**
 * The callback to finish the test.
 * @callback doneCallback
 */