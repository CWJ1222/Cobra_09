const express = require('express');
const router = express.Router();
const controller = require('../controller/Cauth');

router.get('/login', controller.isSessionInvalid, controller.renderLoginPage);
router.post('/login', controller.isSessionInvalid, controller.loginUser);
router.delete('/logout', controller.isSessionValid, controller.logoutUser);

module.exports = router;
