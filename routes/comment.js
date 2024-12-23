const express = require('express');
const router = express.Router();
const controller = require('../controller/Ccomment');

router.get('/', controller.getCommentsByProduct);
router.post('/', controller.writeComment);
router.delete('/', controller.removeComment);

module.exports = router;
