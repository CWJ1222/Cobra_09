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

router.get('/', authController.isSessionValid, hostController.renderHostPage);
router.post(
  '/register',
  authController.isSessionValid,
  profileUpload.single('image'),
  hostController.registerProduct
);

module.exports = router;
