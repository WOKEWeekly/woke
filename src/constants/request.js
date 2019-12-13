
import { alert, setAlert, displayErrorMessage } from '~/components/alert.js';
import { clearUser } from '~/reducers/actions';
import configureStore from '~/reducers/store.js';
const { store } = configureStore();

export default ({url, method = 'GET', body, headers = {}, onSuccess}) => {
  if (headers) headers['User'] = store.getState().user.id;
  headers['Content-Type'] = 'application/json'
  
  fetch(url,
    {
      method,
      body,
      headers
    })
  .then(res => Promise.all([res, res.json()]))
  .then(([status, response]) => { 
    if (status.ok){
      onSuccess(response);
    } else {
      if (response.message === 'jwt'){ // If error is JWT-related
        store.dispatch(clearUser());
        setAlert({ type: 'info', message: `Your session has expired.` });
        setTimeout(() => location.href = '/', 500);
      } else {
        alert.error(response.message);
      }
    }
  }).catch(error => {
    displayErrorMessage(error);
  });
}