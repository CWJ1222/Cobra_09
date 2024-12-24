const express = require('express');
const router = express.Router();
const commentController = require('../controller/Ccomment');
const authController = require('../controller/Cauth');

router.get('/', commentController.getCommentsByProduct);
router.post('/', commentController.writeComment);
router.delete(
  '/',
  authController.isSessionValid,
  commentController.removeComment
);

module.exports = router;
