const express = require('express');
const session = require('express-session');

const multer = require('multer');
const path = require('path');

const authController = require('./controller/Cauth');

const app = express();
const PORT = process.env.PORT || 8080;

const { sequelize } = require('./models');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/public', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 세션 설정, 10분 뒤 세션 종료하도록
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 10,
      httpOnly: true,
    },
  })
);

// 세션 체크
app.use('*', (req, res, next) => {
  console.log('req.session', req.session.user);
  next();
});

// 토큰 만료 검증
app.use(authController.checkExpireKakaoToken);

// router 연결
const purchaseRouter = require('./routes/purchase');
const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const memberRouter = require('./routes/member');
const commentRouter = require('./routes/comment');
const hostRouter = require('./routes/host');

app.use('*', (req, res, next) => {
  console.log('req.session', req.session);
  next();
});

app.use('/', purchaseRouter);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/products', productRouter);
app.use('/member', memberRouter);
app.use('/comments', commentRouter);
app.use('/host', hostRouter);

app.get('*', (req, res) => {
  res.render('404');
});

sequelize
  .sync({ force: true })
  .then(() => {
    console.log('db connection success!');
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log('db connection Err!');
    console.log(err);
  });
