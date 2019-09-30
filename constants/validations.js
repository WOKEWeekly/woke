import { alert } from '~/components/alert.js';
import { checkCookies } from './cookies';


/** Ensure valid login credentials */
export const isValidLogin = (user) => {
  if (!checkCookies('We cannot allow you to log in without accepting our Cookie Policy.')) return false;
  if (!ifExists(user.username.trim(), 'Enter your username or email address.')) return false;
  if (!ifExists(user.password.trim(), 'Enter your password.')) return false;
  return true;
}

/** Ensure valid registration credentials */
export const isValidSignup = (user) => {
  const { firstname, lastname, email, username, password1, password2, privacy } = user;

  if (!ifExists(firstname.trim(), 'Please enter your first name.')) return false;
  if (!ifExists(lastname.trim(), 'Please enter your last name.')) return false;
  if (!isValidEmail(email)) return false;
  if (!isValidUsername(username)) return false;
  if (!isValidPassword(password1, password2)) return false;
  if (!privacy){ alert.error('You have not read or agreed to the Privacy Policy.'); return false; }

  return true;
}

/** Ensure valid session is added or updated */
export const isValidSession = (session) => {
  if (!ifExists(session.title.trim(), 'Enter the session title.')) return false;
  if (!ifExists(session.date, 'Select the date when the session will be held.')) return false;
  if (!isValidFile(session.image, 'session')) return false;
  return true;
}

/** Ensure valid topic is added or updated */
export const isValidTopic = (topic) => {
  if (!ifExists(topic.headline.trim(), 'Enter the topic headline.')) return false;
  if (!ifExists(topic.category, 'Select the topic category.')) return false;
  if (!ifExists(topic.question.trim(), 'Enter the topic question.')) return false;
  if (!ifExists(topic.type, 'Select the topic type.')) return false;
  if (topic.polarity){
    if (!ifExists(topic.option1.trim(), 'Enter the first option to the question.')) return false;
    if (!ifExists(topic.option2.trim(), 'Enter the second option to the question.')) return false;
  }
  return true;
}

/** Ensure valid candidate is added or updated */
export const isValidCandidate = (candidate) => {
  if (!ifExists(candidate.id, 'Please enter the ID number of the candidate.')) return false;
  if (candidate.id < 1) return alert.error(`ID number needs to be a positive non-zero number.`);

  if (!ifExists(candidate.name.trim(), 'Enter the candidate\'s name.')) return false;
  if (!ifExists(candidate.birthday, 'Select the candidate\'s date of birth.')) return false;
  if (!ifExists(candidate.occupation.trim(), 'Please select an image for the session.')) return false;
  if (candidate.authorId === 0){ alert.error('Please select the author of this tribute.'); return false; }
  if (!isValidFile(candidate.image, 'candidate')) return false;
  return true;
}

/** Ensure valid team member is added or updated */
export const isValidMember = (member) => {
  if (!ifExists(member.firstname.trim(), 'Enter the member\'s firstname.')) return false;
  if (!ifExists(member.lastname.trim(), 'Enter the member\'s lastname.')) return false;
  if (!ifExists(member.level, 'Select the member\'s level.')) return false;
  if (!ifExists(member.role.trim(), 'Enter the candidate\'s role.')) return false;
  if (!ifExists(member.birthday, 'Select the candidate\'s date of birth.')) return false;
  return true;
}

/** Ensure valid review is added or updated */
export const isValidReview = (review) => {
  if (!ifExists(review.referee.trim(), 'Enter the referee of the review.')) return false;
  if (!ifExists(review.position.trim(), 'Enter the referee position\'s.')) return false;
  if (review.rating === 0) return alert.error('Provided the review rating.');
  if (!ifExists(review.description.trim(), 'Enter the description provided by the referee.')) return false;
  return true;
}

/** Ensure a valid email address */
export const isValidEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const valid = re.test(String(email).toLowerCase());
  if (!valid) { alert.error('Please enter a valid email address.'); return false; }
  return true;
}

/** Ensure a valid username */
export const isValidUsername = (username) => {
  if (!ifExists(username.trim(), 'Please enter a username.')) return false;
  if (username.trim().length < 3){ alert.error('Your username must be at least 3 characters long.'); return false; }
  return true;
}

/** Check passwords */
export const isValidPassword = (password1, password2, oldPassword) => {
  if (!ifExists(password1.trim(), 'Please enter a password.')) return false;
  if (!ifExists(password2.trim(), 'Please confirm your password.')) return false;
  if (password1.trim().length < 5) return alert.error('Your password must be at least 5 characters long.');
  if (password1 !== password2) return alert.error('Please ensure your passwords match.');

  if (oldPassword){
    if (oldPassword === password1) return alert.error('Your new password cannot be the same as your current password.');
  }
  return true;
}

/** Ensure a valid file */
export const isValidFile = (file, entity) => {
  if (!ifExists(file, `Please select an image for the ${entity}.`)) return false;
  if (file.size > 5 * 1024 * 1024) return alert.error('The image you selected is too large.');
  return true;
}

/** Check for the presence of a value */
const ifExists = (value, message) => {
  if (!value || value.length == 0){
    alert.error(message);
    return false;
  } else {
    return true;
  }
}