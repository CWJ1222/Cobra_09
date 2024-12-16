const express = require('express');
const app = express();
const db = require('./models');
const PORT = 8000;

// 미들웨어 설정 (views, body-parser)
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// [user router 처리]
const userRouter = require('./routes/user');
app.use('/user', userRouter);

// [404]에러
app.get('*', (req, res) => {
  res.render('404');
});

//force: false => 테이블이 없으면 생성

//force: true => 테이블 무조건 생성
// (만약 DB가 있다면 데이터 모두 삭제하고 다시 생성,위험한 옵션이라서 안쓰는게 좋다.)

db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/user`);
  });
  console.log('DB 연결 성공');
});
