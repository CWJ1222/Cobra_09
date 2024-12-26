const express = require('express');
const router = express.Router();
const productController = require('../controller/Cproduct');

// 화면 렌더링 + 전체 상품 데이터 API
router.get('/', productController.getAllProducts);

// 특정 카테고리 상품 데이터 API
router.get('/:id', productController.getItemsByCategory);

module.exports = router;
