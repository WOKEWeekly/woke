// Express
const express = require('express');
const router = express.Router();

// Controllers
const UsersController = require('../controllers/users.controller');
const CLEARANCES = require('../../../constants/clearances');

// Middleware
const {
    verifyToken,
    validateReq
} = require('../../middleware');

// Routes /users 

// GET all user
router.get('/', verifyToken(CLEARANCES.ACTIONS.VIEW_USERS), UsersController.getAllUsers);
// GET user by id
router.get('/:id', validateReq, UsersController.getUser);
// POST new user
router.post('/', validateReq, UsersController.addUser);
// POST login user
router.post('/login', validateReq, UsersController.loginUser);
// PUT update username
router.put('/:id/username', verifyToken(CLEARANCES.ACTIONS.CHANGE_ACCOUNT), UsersController.changeUsername);
// PUT update password
router.put('/:id/password', verifyToken(CLEARANCES.ACTIONS.CHANGE_ACCOUNT), UsersController.changePassword);
// PUT update user clearance
router.put('/:id/clearance/:value', verifyToken(CLEARANCES.ACTIONS.CRUD_USERS), UsersController.changeClearance);
// DELETE user
router.delete('/:id', verifyToken(CLEARANCES.ACTIONS.DELETE_ACCOUNT), UsersController.deleteUser);
// PURGE add users
router.purge('/', verifyToken(9), UsersController.purgeAddUsers);
// NOTIFY send user verification email
router.notify('/:id/email/verify', validateReq, UsersController.sendVerificationEmail);
// PATCH verify user
router.patch('/:token/verify', UsersController.verifyUser);
// NOTIFY send user recovery email
router.notify('/recovery', validateReq, UsersController.sendRecoveryEmail);
//PATCH reset user's password
router.patch('/password/reset', UsersController.resetPassword)

module.exports = router;