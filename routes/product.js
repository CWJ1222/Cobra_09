const express = require('express');
const router = express.Router();
const controller = require('../controller/Cproduct');

router.get('/', controller.getAllProducts);
router.get('/:id', controller.getItemsByCategory);

module.exports = router;
