const express = require('express');
const router = express.Router();
const commentController = require('../controller/Ccomment');
const authController = require('../controller/Cauth');

router.get('/:id', commentController.getCommentsByProduct);
router.post('/', commentController.writeComment);
router.delete('/', commentController.removeComment);
router.patch('/', commentController.modifyComment);
module.exports = router;
