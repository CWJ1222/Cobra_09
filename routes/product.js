const express = require('express');
const router = express.Router();
const productController = require('../controller/Cproduct');
const authController = require('../controller/Cauth');

router.get(
  '/',
  authController.isSessionValid,
  productController.getAllProducts
);
router.get(
  '/:id',
  authController.isSessionValid,
  productController.getItemsByCategory
);

module.exports = router;
