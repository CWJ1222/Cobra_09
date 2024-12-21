const express = require('express');
const session = require('express-session');

const multer = require('multer');
const path = require('path');

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

// multer 연결
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname); // .png, .pdf, ...
      const filename = path.basename(file.originalname, ext) + Date.now() + ext;
      cb(null, filename);
      //   Date.now(): 1970.01.01 0시 0분 0초부터 현재까지 경과된 밀리초
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// router 연결
const purchaseRouter = require('./routes/purchase');

const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const memberRouter = require('./routes/member');

app.use('*', (req, res, next) => {
  console.log('req.session', req.session);
  next();
});

app.use('/', purchaseRouter);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/activePurchases', productRouter);
app.use('/member', memberRouter);

app.get('*', (req, res) => {
  res.render('404');
});

sequelize
  .sync({ force: false })
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
