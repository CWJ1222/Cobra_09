const express = require('express');
const router = express.Router();
const controller = require('../controller/Cauth');

// 일반 로그인 페이지
router.get('/login', controller.renderLoginPage);

// 일반 로그인
router.post('/', controller.isSessionInvalid, controller.loginUser);

// router.delete('/', controller.isSessionValid, controller.logoutUser);

// 일반 유저 로그아웃
router.get('/logout', controller.isSessionValid, controller.logoutUser);

// 카카오 로그인창 띄우기
router.get(
  '/kakao',
  controller.isSessionInvalid,
  controller.redirectKakaoLogin
);

// 카카오 로그인 리다이렉션 처리
router.get(
  '/kakao/login',
  controller.getKaKaoAuthCode,
  controller.getKaKaoToken,
  controller.getKakaoUserInfo,
  controller.loginKakaoUser
);

// 카카오 로그아웃 리다이렉션 처리
router.get('/kakao/logout', controller.logoutKaKaoUser);
module.exports = router;

router.post('/kakao/unlink', controller.unlinkKakaoUser);
