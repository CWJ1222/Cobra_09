const { User } = require('../models'); // User 모델 불러오기
const crypto = require('crypto');

// 비밀번호 암호화 함수
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex'); // 랜덤 salt 생성
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex'); // 해시 생성
  return { salt, hash };
}

// 비밀번호 검증 함수(탈퇴시)
function verifyPassword(password, salt, hash) {
  const newHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return newHash === hash;
}

// **1. 회원가입 페이지 렌더링 (GET)**
exports.signuppage = (req, res) => {
  try {
    res.render('signup', { currentPage: '' }); // views/signup.ejs 렌더링
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류');
  }
};

//deleteTest.ejs 렌더링
exports.deleteTest = (req, res) => {
  try {
    res.render('deleteTest'); // views/deleteTest.ejs 렌더링
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류');
  }
};

// **2. 회원가입 요청 처리 (POST)**
exports.signup = async (req, res) => {
  const { email, password, nickname } = req.body;
  //fe: 클라이언트 데이터 확인
  console.log(email, password, nickname);

  try {
    // 필수 입력값 확인
    if (!email || !password || !nickname) {
      return res
        .status(400)
        .send({ isSuccess: false, message: '모든 필드를 입력해주세요.' });
    }

    // 중복 이메일 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .send({ isSuccess: false, message: '이미 존재하는 이메일입니다.' });
    }

    // 비밀번호 암호화
    const { salt, hash } = hashPassword(password);
    // 사용자 생성
    await User.create({ email, password: hash, nickname, salt });
    res
      .status(201)
      .send({ isSuccess: true, message: '회원가입이 완료되었습니다.' });
    // res.render('myInfoTest', { email: User.email, nickname: User.nickname });
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류');
  }
};

// **3. 회원 탈퇴 요청 처리 (DELETE)**
exports.delete = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .send({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 비밀번호 검증
    const isPasswordValid = verifyPassword(password, user.salt, user.password);
    if (!isPasswordValid) {
      return res
        .status(404)
        .send({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    await User.destroy({ where: { email } });
    res.status(200).send({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: '서버 오류' });
  }
};
