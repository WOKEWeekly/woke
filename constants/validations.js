import { Alert } from '~/components/alert.js';

/** Ensure valid session is added or updated */
export const isValidSession = (session) => {
  if (!ifExists(session.title.trim(), 'Enter the session title.')) return false;
  if (!ifExists(session.date, 'Select the date when the session will be held.')) return false;
  if (!ifExists(session.description.trim(), 'Enter the session\'s description.')) return false;
  if (!ifExists(session.image, 'Please select an image for the session.')) return false;
  return true;
}


/** Check for the presence of a value */
const ifExists = (value, message) => {
  if (!value || value.length == 0){
    alert(message);
    return false;
  }

  return true;
}