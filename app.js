const express = require('express');
const session = require('express-session');

const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 8080;

const { sequelize } = require('./models');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/static', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 세션 설정, 10분 뒤 세션 종료하도록
app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 10,
      httpOnly: true,
    },
  })
);
/*
app.post("/login", (req, res) => {
  // 로그인 여부 판단
  console.log(req.body);
  if (
    userInfo.userId === req.body.id &&
    userInfo.userPw === req.body.pw
  ) {
    // console.log("로그인 가능한 user");
    // 세션 생성
    // 세션의 user라는 키를 추가하여 userId값을 value로 전달
    req.session.user = req.body.id;
    console.log("POST /login", req.session);
    res.redirect("/");
  } else {
    // console.log("로그인 불가능한 user");
    res.send(`
      <script>
        alert("아이디 또는 비밀번호가 틀렸어요. 다시 시도하세요.");
        document.location.href="/login";
      </script>
      `);
  }
});
*/

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//       const ext = path.extname(file.originalname); // .png, .pdf, ...
//       const filename = path.basename(file.originalname, ext) + Date.now() + ext;
//       cb(null, filename);
//       //   Date.now(): 1970.01.01 0시 0분 0초부터 현재까지 경과된 밀리초
//     },
//   }),
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

const indexRouter = require('./routes');
app.use('/', indexRouter);

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
