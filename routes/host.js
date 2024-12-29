const express = require('express');
const router = express.Router();
const hostController = require('../controller/Chost');
const authController = require('../controller/Cauth');
const multer = require('multer');
const path = require('path');

const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => {
      done(null, 'uploads/');
    },
    filename: (req, file, done) => {
      const extension = path.extname(file.originalname);
      done(
        null,
        path.basename(file.originalname, extension) + Date.now() + extension
      );
    },
  }),
  limits: {
    fieldSize: 5 * 1024 * 1024,
  },
});

// 판매 페이지 접근 시 세션 확인
router.get('/', (req, res) => {
  if (!req.session || !req.session.user) {
    // 세션이 없을 경우 JSON으로 응답
    return res.status(401).json({
      isLoggedIn: false,
      // message: '로그인 후 이용하세요.',
    });
  }

  // 세션이 있는 경우 판매 페이지 렌더링
  hostController.renderHostPage(req, res);
});

router.post(
  '/register',
  authController.isSessionValid,
  profileUpload.single('image'),
  hostController.registerProduct
);

module.exports = router;
