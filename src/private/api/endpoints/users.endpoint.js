const express = require('express');
const router = express.Router();

const CLEARANCES = require('../../../constants/clearances');
const { verifyToken, validateReq } = require('../../middleware');
const UsersController = require('../controllers/users.controller');

/** GET all registered users */
router.get(
  '/',
  verifyToken(CLEARANCES.ACTIONS.USERS.VIEW),
  UsersController.getAllUsers
);

/** GET single user by ID */
router.get('/:id', validateReq, UsersController.getSingleUser);

/** POST new user */
router.post('/', validateReq, UsersController.addUser);

/** POST; authenticate user */
router.post('/login', validateReq, UsersController.loginUser);

/** PUT; change username */
router.put(
  '/:id/username',
  verifyToken(CLEARANCES.ACTIONS.USERS.CHANGE_USERNAME),
  UsersController.changeUsername
);

/** PUT; change password */
router.put(
  '/:id/password',
  verifyToken(CLEARANCES.ACTIONS.USERS.CHANGE_PASSWORD),
  UsersController.changePassword
);

/** PUT; change user clearance */
router.put(
  '/:id/clearance/:value',
  verifyToken(CLEARANCES.ACTIONS.USERS.MODIFY),
  UsersController.changeClearance
);

/** DELETE user */
router.delete(
  '/:id',
  verifyToken(CLEARANCES.ACTIONS.USERS.DELETE_OWN_ACCOUNT),
  UsersController.deleteUser
);

/** PURGE; clear all users from database */
router.purge('/', verifyToken(9), UsersController.purgeUsers);

/** NOTIFY; send user verification email */
router.notify(
  '/:id/email/verify',
  validateReq,
  UsersController.sendVerificationEmail
);

/** PATCH; verify user account */
router.patch('/:token/verify', UsersController.verifyUser);

/** NOTIFY; send account recovery email */
router.notify('/recovery', validateReq, UsersController.sendRecoveryEmail);

/** PATCH; reset user's password */
router.patch('/password/reset', UsersController.resetPassword);

module.exports = router;
