const express = require('express');
const router = express.Router();
const productController = require('../controller/Cproduct');
const authController = require('../controller/Cauth');

// 화면 렌더링
// GET/ products
router.get('/', productController.renderProducts);

/* 필터링 버튼 데이터 불러오기 API */

// 1. 전체 상품 데이터 불러오기
// GET/ products/all
router.get(
  '/all',
  // authController.isSessionValid,
  productController.getAllProducts
);

// 2. 특정 카테고리 상품 데이터 불러오기
// GET/ products/:id
router.get(
  '/:id',
  // authController.isSessionValid,
  productController.getItemsByCategory
);

module.exports = router;
