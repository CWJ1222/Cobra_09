const express = require('express');
const router = express.Router();
const controller = require('../controller/Cauth');

router.get('/login', controller.renderLoginPage);
router.post('/', controller.isSessionInvalid, controller.loginUser);
router.delete('/', controller.isSessionValid, controller.logoutUser);

// 카카오 로그인창 띄우기
router.get(
  '/kakao',
  controller.isSessionInvalid,
  controller.redirectKakaoLogin
);

// 카카오 로그인 처리
router.get(
  '/kakao/login',
  controller.getKaKaoAuthCode,
  controller.getKaKaoToken,
  controller.getKakaoUserInfo,
  controller.loginKakaoUser
);
// 카카오 로그아웃
router.get('/kakao/logout', controller.logoutUser);
module.exports = router;
