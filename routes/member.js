const express = require('express');
const controller = require('../controller/Cmember');
const router = express.Router();

router.get('/signup', controller.signuppage);

router.post('/signup', controller.signup);

module.exports = router;
