const express = require('express');
const router = express.Router();

const controller = require('../controller/Cpurchase');

// 구매 페이지
router.get('/purchaseTest', controller.purchasePage);

//구매신청페이지
router.get('/buyform/:product_key', controller.buyForm);

module.exports = router;
