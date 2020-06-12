/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */
const async = require('async');
const bcrypt = require('bcryptjs');
const validator = require('email-validator');
const jwt = require('jsonwebtoken');

const { ENTITY } = require('../../../constants/strings');
const emails = require('../../emails');
const ERROR = require('../../errors');
const { respondToClient } = require('../../response');
const knex = require('../knex').getKnex();

const emailsOn =
  process.env.NODE_ENV === 'production' || process.argv.includes('--emails');
console.warn(`Emails are turned ${emailsOn ? 'on' : 'off'}.`);

const safeFields = [
  'id',
  'firstname',
  'lastname',
  'clearance',
  'username',
  'email',
  'createTime',
  'lastActive'
];

/** Retrieve all users */
exports.getAllUsers = (req, res) => {
  const query = knex.columns(safeFields).select().from('users');
  query.asCallback(function (err, users) {
    respondToClient(res, err, 200, users);
  });
};

/** Retrieve individual user */
exports.getSingleUser = (req, res) => {
  // TODO: Differentiate between self-reading and admin-reading.
  const id = req.params.id;
  const query = knex.columns(safeFields).select().from('users').where('id', id);
  query.asCallback(function (err, [user] = []) {
    if (err) return respondToClient(res, err);
    if (!user) err = ERROR.INVALID_ENTITY_ID(ENTITY.USER, id);
    respondToClient(res, err, 200, user);
  });
};

/** Add or register a new user */
exports.addUser = (req, res) => {
  const {
    firstname,
    lastname,
    email,
    username,
    password1,
    password2,
    subscribe
  } = req.body;

  if (!validator.validate(email))
    return respondToClient(res, ERROR.INVALID_EMAIL_ADDRESS());
  if (password1 !== password2)
    return respondToClient(res, ERROR.PASSWORD_MISMATCH());

  async.waterfall(
    [
      // Hash entered password
      function (callback) {
        bcrypt.hash(password1, 8, function (err, hash) {
          callback(err, hash);
        });
      },
      // Insert new user into database
      function (hash, callback) {
        const query = knex
          .insert({
            firstname,
            lastname,
            clearance: 1,
            email,
            username,
            password: hash
          })
          .into('users');
        query.asCallback(function (err, [id] = []) {
          callback(err, {
            id,
            firstname,
            lastname,
            username,
            email,
            clearance: 1
          });
        });
      },
      // Add user to subscribers if opted in
      function (user, callback) {
        if (subscribe) {
          const { firstname, lastname, email } = user;
          const query = knex
            .insert({
              firstname,
              lastname,
              email,
              subscriptions: {
                articles: true
              }
            })
            .into('subscribers');
          query.asCallback(function (err) {
            if (err) console.error(err);
          });
        }
        callback(null, user);
      },
      // Generate verification token to be sent via email
      function (user, callback) {
        jwt.sign(
          { user },
          process.env.JWT_SECRET,
          { expiresIn: '24h' },
          (err, token) => {
            if (err) return callback(err);
            if (emailsOn) emails.sendWelcomeEmail(user, token);
            callback(null, user);
          }
        );
      },
      // Pass authenticated user information to client with access token
      function (user, callback) {
        jwt.sign(
          { user },
          process.env.JWT_SECRET,
          { expiresIn: '2h' },
          (err, token) => {
            callback(err, { ...user, token });
          }
        );
      }
    ],
    function (err, user) {
      if (err && err.code === ERROR.SQL_DUP_CODE) {
        if (err.sqlMessage.includes('email')) {
          err = ERROR.DUPLICATE_EMAIL_ADDRESS();
        } else if (err.sqlMessage.includes('username')) {
          err = ERROR.DUPLICATE_USERNAME();
        }
      }
      respondToClient(res, err, 201, user);
    }
  );
};

/* Log in / authenticate user */
exports.loginUser = (req, res) => {
  const { username, password, remember } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Attempt to retrieve user
        const query = knex
          .select()
          .from('users')
          .where('username', username)
          .orWhere('email', username);
        query.asCallback(function (err, [user] = []) {
          if (err) return callback(err);
          if (!user) return callback(ERROR.NONEXISTENT_CREDENTIALS());

          const passwordIsIncorrect =
            !bcrypt.compareSync(password, user.password) &&
            !(user.password == password);
          if (passwordIsIncorrect)
            return callback(ERROR.NONEXISTENT_CREDENTIALS());

          callback(null, user);
        });
      },
      function (user, callback) {
        // Assign access token to user
        jwt.sign(
          { user },
          process.env.JWT_SECRET,
          { expiresIn: remember ? '30d' : '2h' },
          (err, token) => {
            if (err) return callback(err);
            user.token = token;
            callback(null, user);
          }
        );
      }
    ],
    function (err, user) {
      respondToClient(res, err, 200, user);
    }
  );
};

/** Change user's username in database */
exports.changeUsername = (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  const query = knex('users').update({ username }).where('id', id);
  query.asCallback(function (err, result) {
    if (err) {
      const duplicateUsername =
        err.code === ERROR.SQL_DUP_CODE && err.sqlMessage.includes('username');
      if (duplicateUsername)
        return respondToClient(res, ERROR.DUPLICATE_USERNAME());
      return respondToClient(res, err);
    }
    if (result.affectedRows === 0)
      return respondToClient(res, ERROR.INVALID_ENTITY_ID(ENTITY.USER, id));

    respondToClient(res, err, 200);
  });
};

/** Change user's password in database */
exports.changePassword = (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Get current password of user
        const query = knex.select().from('users').where('id', id);
        query.asCallback(function (err, [user] = []) {
          if (err) return callback(err);
          if (!user) return callback(ERROR.INVALID_ENTITY_ID(ENTITY.USER, id));
          callback(null, user.password);
        });
      },
      function (password, callback) {
        // Verify that current password is valid
        const passwordIsValid = !(
          bcrypt.compareSync(oldPassword, password) || oldPassword === password
        );
        callback(passwordIsValid ? ERROR.INCORRECT_PASSWORD() : null);
      },
      function (callback) {
        // Hash new password
        bcrypt.hash(newPassword, 8, function (err, hash) {
          callback(err, hash);
        });
      },
      function (hash, callback) {
        // Store new hashed password
        const query = knex('users').update({ password: hash }).where('id', id);
        query.asCallback(function (err) {
          callback(err);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 200);
    }
  );
};

/** Change user's clearance */
exports.changeClearance = (req, res) => {
  const { id, value } = req.params;
  const query = knex('users').update({ clearance: value }).where('id', id);
  query.asCallback(function (err) {
    respondToClient(res, err, 200);
  });
};

/** Delete a user */
exports.deleteUser = (req, res) => {
  // TODO: Differentiate between self-deletion and admin-deletion.
  const id = req.params.id;
  const query = knex('users').where('id', id).del();
  query.asCallback(function (err, result) {
    if (err) return respondToClient(res, err);
    if (result.affectedRows === 0)
      err = ERROR.INVALID_ENTITY_ID(ENTITY.USER, id);
    respondToClient(res, err, 204);
  });
};

/** Purge added users */
exports.purgeUsers = (req, res) => {
  if (process.env.NODE_ENV === 'production')
    return respondToClient(res, ERROR.UNAUTHORIZED_REQUEST());
  const query = knex('users').where('id', '>', '2').del();
  query.asCallback(function (err) {
    respondToClient(res, err, 204);
  });
};

/** Resend the verification email to user's email address */
exports.sendVerificationEmail = (req, res) => {
  const { id } = req.params;

  async.waterfall(
    [
      function (callback) {
        // Retrieve user from database
        const query = knex
          .columns(safeFields)
          .select()
          .from('users')
          .where('id', id);
        query.asCallback(function (err, [user] = []) {
          if (err) return callback(err);
          if (!user) return callback(ERROR.INVALID_ENTITY_ID());
          callback(null, user);
        });
      },
      function (user, callback) {
        // Generate verification token to send via email
        jwt.sign(
          { user },
          process.env.JWT_SECRET,
          { expiresIn: '30m' },
          (err, token) => {
            if (err) return callback(err);
            if (!emailsOn) return callback(null, { token });
            emails.resendVerificationEmail(user, token, callback);
          }
        );
      }
    ],
    function (err, token) {
      respondToClient(res, err, 200, token);
    }
  );
};

/** Verify a user's account */
exports.verifyUser = (req, res) => {
  const { token } = req.params;

  async.waterfall(
    [
      function (callback) {
        // Verify the given token
        jwt.verify(token, process.env.JWT_SECRET, (err, { user } = {}) => {
          callback(err, user);
        });
      },
      function (user, callback) {
        // Change user's clearance to indicate verification
        if (user.clearance > 1) {
          return callback(ERROR.VERIFICATION_NOT_REQUIRED());
        }
        const query = knex('users')
          .update({ clearance: 2 })
          .where('id', user.id);
        query.asCallback(function (err) {
          if (err) return callback(err);
          user.clearance = 2;
          callback(null, user);
        });
      }
    ],
    function (err, user) {
      respondToClient(res, err, 200, user);
    }
  );
};

/** Send account recovery email */
exports.sendRecoveryEmail = (req, res) => {
  const { email } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Retrieve user using email address
        const query = knex
          .columns(safeFields)
          .select()
          .from('users')
          .where('email', email);
        query.asCallback(function (err, [user] = []) {
          if (err) return callback(err);
          if (!user) return callback(ERROR.NONEXISTENT_EMAIL_ADDRESS());
          callback(null, user);
        });
      },
      function (user, callback) {
        // Generate recovery token to be sent via email
        jwt.sign(
          { user },
          process.env.JWT_SECRET,
          { expiresIn: '30m' },
          (err, token) => {
            if (err) return callback(err);
            if (!emailsOn) return callback(null, { token });
            emails.sendAccountRecoveryEmail(user, token, callback);
          }
        );
      }
    ],
    function (err, token) {
      respondToClient(res, err, 200, token);
    }
  );
};

/** Change a user's password from reset */
exports.resetPassword = (req, res) => {
  const { token, password } = req.body;
  async.waterfall(
    [
      function (callback) {
        // Verify the given token
        jwt.verify(token, process.env.JWT_SECRET, (err, { user }) => {
          callback(err, user);
        });
      },
      function (user, callback) {
        // Hash new password
        bcrypt.hash(password, 8, function (err, hash) {
          callback(err, user.id, hash);
        });
      },
      function (id, hash, callback) {
        // Update user's password in database
        const query = knex('users').update({ password: hash }).where('id', id);
        query.asCallback(function (err, result) {
          if (err) return callback(err);
          if (result.affectedRows === 0)
            err = ERROR.INVALID_ENTITY_ID(ENTITY.USER, id);
          callback(err);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 200);
    }
  );
};
