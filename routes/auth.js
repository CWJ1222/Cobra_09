const express = require('express');
const router = express.Router();
const controller = require('../controller/Cauth');

router.get('/', controller.isSessionInvalid, controller.renderLoginPage);
router.post('/', controller.isSessionInvalid, controller.loginUser);
router.delete('/', controller.isSessionValid, controller.logoutUser);

module.exports = router;
