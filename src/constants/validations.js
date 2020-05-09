import { alert } from '~/components/alert.js';
import { checkCookies } from './cookies';
import { ARTICLE_STATUS } from './strings';
import { limits } from './settings';

module.exports = {
  /**
   * Login validation.
   * @param {string} user - User credentials to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidLogin: user => {
    if (
      !checkCookies(
        'We cannot allow you to log in without accepting our Cookie Policy.'
      )
    )
      return false;
    if (
      !ifExists(user.username.trim(), 'Enter your username or email address.')
    )
      return false;
    if (!ifExists(user.password.trim(), 'Enter your password.')) return false;
    return true;
  },

  /**
   * Registration validation.
   * @param {string} user - User information to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidSignup: user => {
    const {
      firstname,
      lastname,
      email,
      username,
      password1,
      password2,
      privacy,
    } = user;

    if (!ifExists(firstname.trim(), 'Please enter your first name.'))
      return false;
    if (!ifExists(lastname.trim(), 'Please enter your last name.'))
      return false;
    if (!module.exports.isValidEmail(email)) return false;
    if (!module.exports.isValidUsername(username)) return false;
    if (!module.exports.isValidPassword(password1, password2)) return false;
    if (ifTrue(!privacy, 'You have not read or agreed to the Privacy Policy.'))
      return false;

    return true;
  },

  /**
   * Validation of session submission or update.
   * @param {string} user - Session information to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidSession: session => {
    if (!ifExists(session.title.trim(), 'Enter the session title.'))
      return false;
    if (
      !ifExists(
        session.dateHeld,
        'Select the date when the session will be held.'
      )
    )
      return false;
    if (!isValidImage(session.image, 'session')) return false;
    return true;
  },

  /**
   * Validation of topic submission or update.
   * @param {string} topic - Topic information to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidTopic: topic => {
    if (!ifExists(topic.headline.trim(), 'Enter the topic headline.'))
      return false;
    if (!ifExists(topic.category, 'Select the topic category.')) return false;
    if (!ifExists(topic.question.trim(), 'Enter the topic question.'))
      return false;
    if (!ifExists(topic.type, 'Select the topic type.')) return false;
    if (topic.polarity === true) {
      if (
        !ifExists(
          topic.option1.trim(),
          'Enter the first option to the question.'
        )
      )
        return false;
      if (
        !ifExists(
          topic.option2.trim(),
          'Enter the second option to the question.'
        )
      )
        return false;
    }
    return true;
  },

  /**
   * Validation of article submission or update.
   * @param {string} article - Article information to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidArticle: article => {
    if (!ifExists(article.title.trim(), 'Enter the article title.'))
      return false;
    if (!ifExists(article.status.trim(), 'Select the status of the article.'))
      return false;
    if (ifTrue(article.authorId === 0, 'Select the author of this article.'))
      return false;
    if (article.status === ARTICLE_STATUS.PUBLISHED) {
      if (!ifExists(article.category, "Select the article's category."))
        return false;
      if (
        !ifExists(
          article.content.trim(),
          'Write out the content of this article.'
        )
      )
        return false;
      if (!ifExists(article.excerpt.trim(), "Enter the article's excerpt."))
        return false;
      if (!isValidImage(article.image, 'article')) return false;
    }

    return true;
  },

  /**
   * Validation of candidate submission or update.
   * @param {string} candidate - Candidate information to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidCandidate: candidate => {
    if (!ifExists(candidate.id, 'Please enter the ID number of the candidate.'))
      return false;
    if (
      ifTrue(
        candidate.id < 1,
        `ID number needs to be a positive non-zero number.`
      )
    )
      return false;

    if (!ifExists(candidate.name.trim(), "Enter the candidate's name."))
      return false;
    if (!ifExists(candidate.birthday, "Select the candidate's date of birth."))
      return false;
    if (
      !ifExists(
        candidate.occupation.trim(),
        'Please select an image for the session.'
      )
    )
      return false;
    if (
      ifTrue(
        candidate.authorId === 0,
        'Please select the author of this tribute.'
      )
    )
      return false;
    if (!isValidImage(candidate.image, 'candidate')) return false;
    return true;
  },

  /**
   * Validation of document update.
   * @param {string} document - Document information to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidDocument: document => {
    if (!ifExists(document.title.trim(), 'Enter the document title.'))
      return false;
    if (!isValidDocument(document.file)) return false;
    return true;
  },

  /**
   * Validation of team member submission or update.
   * @param {string} member - Team member information to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidMember: member => {
    if (!ifExists(member.firstname.trim(), "Enter the member's firstname."))
      return false;
    if (!ifExists(member.lastname.trim(), "Enter the member's lastname."))
      return false;
    if (!ifExists(member.level, "Select the member's level.")) return false;
    if (!ifExists(member.role.trim(), "Enter the candidate's role."))
      return false;
    if (!ifExists(member.birthday, "Select the candidate's date of birth."))
      return false;
    if (!isUnderFileSizeLimit(member.image)) return false;
    return true;
  },

  /**
   * Validation of review submission or update.
   * @param {string} review - Review information to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidReview: review => {
    if (!ifExists(review.referee.trim(), 'Enter the referee of the review.'))
      return false;
    if (!ifExists(review.position.trim(), "Enter the referee position's."))
      return false;
    if (ifTrue(review.rating < 1, 'Specify the review rating.')) return false;
    if (
      !ifExists(
        review.description.trim(),
        'Enter the description provided by the referee.'
      )
    )
      return false;
    return true;
  },

  /**
   * Ensure submitted email address is valid.
   * @param {string} email - Email address to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidEmail: email => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const valid = re.test(String(email).toLowerCase());
    if (ifTrue(!valid, 'Please enter a valid email address.')) return false;
    return true;
  },

  /**
   * Ensure submitted username is valid.
   * @param {string} username - Username to be validated.
   * @returns {boolean} True if valid. False with error message if invalid.
   */
  isValidUsername: username => {
    if (!ifExists(username.trim(), 'Please enter a username.')) return false;
    if (
      ifTrue(
        username.trim().length < 3,
        'Your username must be at least 3 characters long.'
      )
    )
      return false;
    return true;
  },

  /**
   * Check passwords match, are novel and meet requirements.
   * @param {string} password1 - The initial password input.
   * @param {string} password2 - The confirmation password input.
   * @param {string} oldPassword - The previous password.
   * @returns {boolean} True if meets requirements. If not: false.
   */
  isValidPassword: (password1, password2, oldPassword) => {
    if (!ifExists(password1.trim(), 'Please enter a password.')) return false;
    if (!ifExists(password2.trim(), 'Please confirm your password.'))
      return false;
    if (
      ifTrue(
        password1.trim().length < 5,
        'Your password must be at least 5 characters long.'
      )
    )
      return false;
    if (ifTrue(password1 !== password2, 'Please ensure your passwords match.'))
      return false;

    if (oldPassword) {
      if (
        ifTrue(
          oldPassword === password1,
          'Your new password cannot be the same as your current password.'
        )
      )
        return false;
    }
    return true;
  },
};

/**
 * Ensure submitted file meets requirements.
 * @param {string} file - Base64 string of file to be uploaded.
 * @param {string} entity - The entity this file represents.
 * @returns {boolean} True if meets requirements. If not: false.
 */
const isValidImage = (file, entity) => {
  if (!ifExists(file, `Please select an image for the ${entity}.`))
    return false;
  if (!isUnderFileSizeLimit(file)) return false;
  return true;
};

/**
 * Ensure submitted document meets requirements.
 * @param {string} document - Base64 string of document to be uploaded.
 * @param {string} entity - The entity this file represents.
 * @returns {boolean} True if meets requirements. If not: false.
 */
const isValidDocument = file => {
  if (!ifExists(file, `Please select a document to upload.`)) return false;
  if (!isUnderFileSizeLimit(file, limits.file)) return false;
  return true;
};

/**
 * Ensure file size is within limit.
 * @param {string} file - Base64 string of file to be uploaded.
 * @param {number} limit - The upper size limit in MB. Defaults to 2MB.
 * @returns {boolean} True if within limit. False if not.
 */
const isUnderFileSizeLimit = (file, limit = limits.image) => {
  if (!file) return true;
  const size = Buffer.from(file.substring(file.indexOf(',') + 1)).length;
  if (
    ifTrue(
      size > limit * 1024 * 1024,
      `The file you selected is larger than ${limit}MB. Please compress this file or use a smaller one.`
    )
  )
    return false;
  return true;
};

/**
 * Check for presence of a value.
 * @param {string} value - Value to be checked.
 * @param {string} message - Error message to be returned if value is absent.
 * @returns {boolean} True if value exists. False if not.
 */
const ifExists = (value, message) => {
  if (!value || value.length == 0) {
    alert.error(message);
    return false;
  } else {
    return true;
  }
};

/**
 * Check if condition is wrongly true.
 * @param {boolean} condition - Condition to be evaluated.
 * @param {string} message - Error message to be returned if value is true.
 * @returns {boolean} True if condition resolves to true. False if not.
 */
const ifTrue = (condition, message) => {
  if (condition === true) {
    alert.error(message);
    return true;
  } else {
    return false;
  }
};
