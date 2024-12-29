const { User } = require('../models'); // User 모델 불러오기
const crypto = require('crypto');
const { hashPassword, verifyPassword } = require('../utils/common'); // common.js에서 가져오기

// **1. 회원가입 페이지 렌더링 (GET)**
exports.signuppage = (req, res) => {
  try {
    res.render('signup', { currentPage: '', user: req.session.user }); // views/signup.ejs 렌더링
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류');
  }
};

// **2. 회원가입 요청 처리 (POST)**
exports.signup = async (req, res) => {
  const { email, password, nickname } = req.body;

  try {
    if (!email || !password || !nickname) {
      console.error('필수 입력값 누락:', { email, password, nickname });
      return res
        .status(400)
        .send({ isSuccess: false, message: '모든 필드를 입력해주세요.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error('이미 존재하는 이메일:', email);
      return res
        .status(400)
        .send({ isSuccess: false, message: '이미 존재하는 이메일입니다.' });
    }

    const existingNickname = await User.findOne({ where: { nickname } });
    if (existingNickname) {
      console.error('이미 존재하는 닉네임:', nickname);
      return res
        .status(400)
        .send({ isSuccess: false, message: '이미 존재하는 닉네임입니다.' });
    }

    const { salt, hash } = hashPassword(password);
    await User.create({
      email,
      password: hash,
      nickname,
      salt,
      user_type: '1',
    });

    res
      .status(201)
      .send({ isSuccess: true, message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('서버 오류 발생:', error);
    res
      .status(500)
      .send({ isSuccess: false, message: '서버 오류가 발생했습니다.' });
  }
};
