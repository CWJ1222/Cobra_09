const express = require('express');
const controller = require('../controller/Cmain');
const router = express.Router();

router.get('/', controller.main);
router.get('/products', controller.getAllProducts);
router.get('/joins', controller.getAllJoins);


module.exports = router;