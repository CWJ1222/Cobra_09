const express = require('express');
const controller = require('../controller/Cmain');
const router = express.Router();

// FE: 메인페이지 뷰 테스트
router.get('/', controller.main); //홈페이지

// router.get('/purchaseTest', controller.purchasepage); // 구매 페이지 purchase로 따로 만듬

router.get('/sell', controller.sell); //판매 페이지

router.get('/products', controller.getAllProducts);
router.get('/joins', controller.getAllJoins);
router.get('/auth', controller.login);

// 특정 물품 정보 가져오기
router.get('/host/list/:id', controller.getProduct);
router.get('/user/mypage', controller.getAllUser);

// 내 정보 수정
router.put('/user', controller.postChangeUser);

module.exports = router;
