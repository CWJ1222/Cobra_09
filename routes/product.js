const express = require('express');
const router = express.Router();
const productController = require('../controller/Cproduct');
const authController = require('../controller/Cauth');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getItemsByCategory);

module.exports = router;
