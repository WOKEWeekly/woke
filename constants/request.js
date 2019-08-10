
import { alert, setAlert, displayErrorMessage } from '~/components/alert.js';
import { clearUser } from '~/reducers/actions';
import configureStore from '~/reducers/store.js';
const { store } = configureStore();

export default ({url, method, headers, onSuccess}) => {
  fetch(url, { method, headers })
  .then(res => Promise.all([res, res.json()]))
  .then(([status, response]) => { 
    if (status.ok){
      onSuccess(response);
    } else {
      if (response.message === 'jwt'){
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