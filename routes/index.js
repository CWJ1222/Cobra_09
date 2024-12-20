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

module.exports = router;
