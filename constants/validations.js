import { Alert } from '~/components/alert.js';

/** Ensure valid session is added or updated */
export const isValidSession = (session) => {
  if (!ifExists(session.title.trim(), 'Enter the session title.')) return false;
  if (!ifExists(session.date, 'Select the date when the session will be held.')) return false;
  if (!ifExists(session.image, 'Please select an image for the session.')) return false;
  return true;
}

/** Ensure valid session is added or updated */
export const isValidTopic = (topic) => {
  if (!ifExists(topic.headline.trim(), 'Enter the topic headline.')) return false;
  if (!ifExists(topic.category, 'Select the topic category.')) return false;
  if (!ifExists(topic.question.trim(), 'Enter the topic question.')) return false;
  if (!ifExists(topic.type, 'Select the topic type.')) return false;
  if (topic.polarity){
    if (!ifExists(topic.option1, 'Enter the first option to the question.')) return false;
    if (!ifExists(topic.option2, 'Enter the second option to the question.')) return false;
  }
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