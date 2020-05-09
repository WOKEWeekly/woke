import { alert, setAlert } from '~/components/alert.js';
import { clearUser } from '~/reducers/actions';
import configureStore from '~/reducers/store.js';
const { store } = configureStore();

const axios = require('axios');

/**
 * Abstract function for HTTP requests.
 * @param {string} request.url - The url to make the request to.
 * @param {string} [request.method] - The method of the request. Defaults to GET.
 * @param {Object} [request.body] - The payload for the request.
 * @param {Object} [request.headers] - The headers to accompany the request.
 * @param {Function} request.onSuccess - Function triggered on successful request.
 * @param {Function} request.onError - Function triggered on successful request.
 * @param {Function} [request.done] - The callback to finish the test.
 */
export default ({ url, method = 'GET', body, headers = {}, onSuccess }) => {
  headers['User'] = store.getState().user.id;
  headers['Content-Type'] = 'application/json';

  axios({
    url,
    method,
    data: body,
    headers
  })
    .then(({ data }) => {
      onSuccess(data);
    })
    .catch((error) => {
      if (error.message === 'jwt') {
        // If error is JWT-related
        store.dispatch(clearUser());
        setAlert({ type: 'info', message: `Your session has expired.` });
        setTimeout(() => (location.href = '/'), 500);
      } else {
        alert.error(error.message);
      }
    });
};
