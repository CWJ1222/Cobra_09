const express = require('express');
const controller = require('../controller/Cmain');
const router = express.Router();

// 문제 확인하기! 합칠때 유의해야할 듯!

router.get('/', controller.main);
router.get('/products', controller.isSessionValid, controller.getAllProducts);
router.get('/joins', controller.isSessionValid,controller.getAllJoins);
router.get('/auth', controller.login);



module.exports = router;