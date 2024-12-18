const express = require('express');
const router = express.Router();
const controller = require('../controller/Cauth');

router.get('/login', controller.renderLoginPage);
router.post('/', controller.isSessionInvalid, controller.loginUser);
router.delete('/', controller.isSessionValid, controller.logoutUser);
router.get(
  '/kakao',
  controller.isSessionInvalid,
  controller.redirectKakaoLogin
);
// router.get('/kakao/auth-code', controller.handleAuthCode);
router.get(
  '/kakao/auth-code',
  controller.getKaKaoAuthCode,
  controller.getKaKaoToken
);
router.get('/kakao/logout', controller.logoutUser);
module.exports = router;
