const { alert } = require('components/alert.js');

const { checkCookies } = require('./cookies');
const { limits } = require('./settings');
const { ARTICLE_STATUS } = require('./strings');

/**
 * Login validation.
 * @param {object} user - User credentials to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidLogin = (user) => {
  if (
    !checkCookies(
      'We cannot allow you to log in without accepting our Cookie Policy.'
    )
  )
    return false;
  if (!ifExists(user.username, 'Enter your username or email address.'))
    return false;
  if (!ifExists(user.password, 'Enter your password.')) return false;
  return true;
};

/**
 * Registration validation.
 * @param {object} user - User information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidSignup = (user) => {
  if (!ifExists(user.firstname, 'Please enter your first name.')) return false;
  if (!ifExists(user.lastname, 'Please enter your last name.')) return false;
  if (!module.exports.isValidEmail(user.email)) return false;
  if (!module.exports.isValidUsername(user.username)) return false;
  if (!module.exports.isValidPassword(user.password1, user.password2))
    return false;
  if (
    ifTrue(!user.privacy, 'You have not read or agreed to the Privacy Policy.')
  )
    return false;

  return true;
};

/**
 * Validation of session submission or update.
 * @param {object} session - Session information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidSession = (session) => {
  if (!ifExists(session.title, 'Enter the session title.')) return false;
  if (
    !ifExists(
      session.dateHeld,
      'Select the date when the session will be held.'
    )
  )
    return false;
  if (!isValidImage(session.image, 'session')) return false;
  return true;
};

/**
 * Validation of topic submission or update.
 * @param {object} topic - Topic information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidTopic = (topic) => {
  if (!ifExists(topic.headline, 'Enter the topic headline.')) return false;
  if (!ifExists(topic.category, 'Select the topic category.')) return false;
  if (!ifExists(topic.question, 'Enter the topic question.')) return false;
  if (!ifExists(topic.type, 'Select the topic type.')) return false;

  if (topic.polarity === true) {
    if (!ifExists(topic.option1, 'Enter the first option to the question.'))
      return false;
    if (!ifExists(topic.option2, 'Enter the second option to the question.'))
      return false;
  }
  return true;
};

/**
 * Validation of article submission or update.
 * @param {object} article - Article information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidArticle = (article) => {
  const isPublish = article.status === ARTICLE_STATUS.PUBLISHED;

  if (!ifExists(article.title, 'Enter the article title.')) return false;
  if (!ifExists(article.status, 'Select the status of the article.'))
    return false;
  if (!ifExists(article.authorId, 'Select the author of this article.'))
    return false;
  if (!isValidImage(article.coverImage, 'article', { mustExist: isPublish }))
    return false;
  if (!isValidImageGroup(article.fillerImages, { reference: 'Filler image' }))
    return false;

  if (isPublish) {
    if (!ifExists(article.category, "Select the article's category."))
      return false;
    if (!ifExists(article.content, 'Write out the content of this article.'))
      return false;
    if (!ifExists(article.excerpt, "Enter the article's excerpt."))
      return false;
  }

  return true;
};

/**
 * Validation of candidate submission or update.
 * @param {object} candidate - Candidate information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidCandidate = (candidate) => {
  if (!ifExists(candidate.id, 'Please enter the ID number of the candidate.'))
    return false;
  if (
    ifTrue(
      candidate.id < 1,
      `ID number needs to be a positive non-zero number.`
    )
  )
    return false;

  if (!ifExists(candidate.name, "Enter the candidate's name.")) return false;
  if (!ifExists(candidate.birthday, "Select the candidate's date of birth."))
    return false;
  if (
    !ifExists(candidate.occupation, 'Please select an image for the session.')
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
};

/**
 * Validation of document update.
 * @param {object} document - Document information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidDocument = (document) => {
  if (!ifExists(document.title, 'Enter the document title.')) return false;
  if (!isValidDocument(document.file)) return false;
  return true;
};

/**
 * Validation of team member submission or update.
 * @param {object} member - Team member information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidMember = (member) => {
  if (!ifExists(member.level, "Select the member's level.")) return false;
  if (!ifExists(member.firstname, "Enter the member's first name."))
    return false;
  if (!ifExists(member.lastname, "Enter the member's last name.")) return false;

  const isNotGuest = member.level !== 'Guest';
  if (isNotGuest) {
    if (!ifExists(member.role, "Enter the member's role.")) return false;
    if (
      member.level !== 'Guest' &&
      !ifExists(member.birthday, "Select the member's date of birth.")
    )
      return false;
  }

  if (!isUnderFileSizeLimit(member.image)) return false;
  return true;
};

/**
 * Validation of subscriber on submission or update.
 * @param {object} subscriber - Subscriber information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidSubscriber = (subscriber) => {
  if (!ifExists(subscriber.firstname, "Enter the subscriber's first name."))
    return false;
  if (!ifExists(subscriber.lastname, "Enter the subscriber's last name.")) return false;

  const isNotSusbscribed = subscriber.subscription !== false;
  if (!ifExists(isNotSusbscribed, "Check box for subscribed.")) return false;
  if (!ifExists(subscriber.createtime, "Select the subscriber's create time.")) return false;
  return true;
};

/**
 * Validation of review submission or update.
 * @param {object} review - Review information to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidReview = (review) => {
  if (!ifExists(review.referee, 'Enter the referee of the review.'))
    return false;
  if (!ifExists(review.position, "Enter the referee's position.")) return false;
  if (ifTrue(review.rating < 1, 'Specify the review rating.')) return false;
  if (
    !ifExists(
      review.description,
      'Enter the description provided by the referee.'
    )
  )
    return false;
  return true;
};

/**
 * Ensure submitted email address is valid.
 * @param {string} email - Email address to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const valid = re.test(String(email).toLowerCase());
  if (ifTrue(!valid, 'Please enter a valid email address.')) return false;
  return true;
};

/**
 * Ensure submitted username is valid.
 * @param {string} username - Username to be validated.
 * @returns {boolean} True if valid. False with error message if invalid.
 */
exports.isValidUsername = (username) => {
  if (!ifExists(username, 'Please enter a username.')) return false;
  if (
    ifTrue(
      username.trim().length < 3,
      'Your username must be at least 3 characters long.'
    )
  )
    return false;
  return true;
};

/**
 * Check passwords match, are novel and meet requirements.
 * @param {string} password1 - The initial password input.
 * @param {string} password2 - The confirmation password input.
 * @param {string} oldPassword - The previous password.
 * @returns {boolean} True if meets requirements. If not, false.
 */
exports.isValidPassword = (password1, password2, oldPassword) => {
  if (!ifExists(password1, 'Please enter a password.')) return false;
  if (!ifExists(password2, 'Please confirm your password.')) return false;
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
};

/**
 * Ensure submitted file meets requirements.
 * @param {string} file - Base64 string of file to be uploaded.
 * @param {string} entity - The entity this file represents.
 * @param {object} [options] - Options for image validation.
 * @param {boolean} [options.mustExist] - Specifies if the image must exist. Defaults to true.
 * @returns {boolean} True if meets requirements. If not, false.
 */
const isValidImage = (file, entity, options = {}) => {
  const { mustExist = true } = options;

  if (mustExist) {
    if (!ifExists(file, `Please select an image for the ${entity}.`))
      return false;
  }

  if (!isUnderFileSizeLimit(file)) return false;
  return true;
};

/**
 * Ensure submitted document meets requirements.
 * @param {string} file - Base64 string of document to be uploaded.
 * @returns {boolean} True if meets requirements. If not, false.
 */
const isValidDocument = (file) => {
  if (!ifExists(file, `Please select a document to upload.`)) return false;
  if (!isUnderFileSizeLimit(file, { limit: limits.file })) return false;
  return true;
};

/**
 * Check if a group of similar images are valid.
 * @param {string[]} images - A list of Base64 file strings.
 * @param {object} [options] - Options for validating image group.
 * @param {string} [options.reference] - A string reference to each image.
 * @returns {boolean} True if images are valid. False if not.
 */
const isValidImageGroup = (images, options = {}) => {
  const { reference = 'Image' } = options;
  if (
    !images.every((image, key) =>
      isUnderFileSizeLimit(image, { reference: `${reference} ${key + 1}` })
    )
  )
    return false;

  return true;
};

/**
 * Ensure file size is within limit.
 * @param {string} file - Base64 string of file to be uploaded.
 * @param {object} [options] - Options for validating file size.
 * @param {number} [options.limit] - The upper size limit in MB. Defaults to 2MB.
 * @param {string} [options.reference] - A string reference to the file.
 * @returns {boolean} True if within limit. False if not.
 */
const isUnderFileSizeLimit = (file, options = {}) => {
  if (!file) return true;

  const { reference = 'The file', limit = limits.image } = options;
  const size = Buffer.from(file.substring(file.indexOf(',') + 1)).length;
  if (
    ifTrue(
      size > limit * 1024 * 1024,
      `${reference} you selected is larger than ${limit}MB. Please compress this file or use a smaller one.`
    )
  )
    return false;
  return true;
};

/**
 * Check for presence of a value.
 * @param {any} value - Value to be checked.
 * @param {string} message - Error message to be returned if value is absent.
 * @returns {boolean} True if value exists. False if not.
 */
const ifExists = (value, message) => {
  if (typeof value === 'string') {
    value = value.trim();
  }

  if (!value || value.length === 0) {
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
