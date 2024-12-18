const { User } = require('../models'); // User 모델 불러오기

// **1. 회원가입 페이지 렌더링 (GET)**
exports.signuppage = (req, res) => {
  try {
    res.render('signupTest'); // views/signup.ejs 렌더링
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

  try {
    // 필수 입력값 확인
    if (!email || !password || !nickname) {
      return res.status(400).send('모든 필드를 입력해주세요.');
    }

    // 중복 이메일 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('이미 존재하는 이메일입니다.');
    }

    // 사용자 생성
    await User.create({ email, password, nickname });
    res.status(201).send('회원가입이 완료되었습니다.');
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
    // 사용자 존재 여부 확인
    const user = await User.findOne({ where: { email, password } });
    if (!user) {
      return res.status(404).send('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 사용자 삭제
    await User.destroy({ where: { email } });
    res.status(200).send('회원 탈퇴가 완료되었습니다.');
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};
