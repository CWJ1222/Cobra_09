const express = require('express');
const router = express.Router();

const controller = require('../controller/Cpurchase');

// 구매 페이지
router.get('/purchase', controller.purchasePage);

//구매신청페이지
router.get('/buyform/:product_key', controller.buyForm);

//구매요청라우트
router.post('/purchase', controller.createOrder);

module.exports = router;
