const db = require('../models');

// 세션이 있는지를 검증
exports.isSessionValid = (req, res, next) => {
  if (req.session.user) {
    // 인증된 유저인 경우
    next();
  } else {
    // 인증안된 유저인 경우
    res.redirect('/');
  }
};

// 세션이 없는지를 검증
exports.isSessionInvalid = (req, res, next) => {
  if (!req.session.user) {
    // 인증안된 유저인 경우
    next();
  } else {
    // 인증된 유저인 경우
    res.redirect('/');
  }
};

// 로그인 페이지 렌더링
exports.renderLoginPage = (req, res) => {
  res.render('login', { currentPage: 'login' });
};

// 로그인 처리
exports.loginUser = async (req, res) => {
  const { userId: inputUserId, password: inputUserPw } = req.body;
  // fe: 클라이언트 데이터 확인
  console.log('입력된 userId:', inputUserId);
  console.log('입력된 pw:', inputUserPw);

  // TODO : 입력한 패스워드를 암호화한 후에 비교 처리 부분 추가
  const result = await db.User.findOne({
    where: {
      email: inputUserId,
      password: inputUserPw,
    },
    attributes: ['user_id', 'email', 'password', 'nickname'],
  });

  if (result) {
    req.session.user = {
      //user 테이블의 pk값 저장
      user_pk: result.user_id,
    };
    res.status(200).send({
      isLogin: true,
      nickname: result.nickname,
      message: '로그인 성공 했습니다.',
    });
  } else {
    res.status(200).send({
      isSuccess: false,
      message: '로그인 실패 했습니다.',
    });
  }
};

// 로그아웃 처리
exports.logoutUser = (req, res) => {
  // 로그인 된 유저인지 확인
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send({ message: '서버 에러 발생' });
    }
    res.clearCookie('connect.sid');
    res.status(200).send({ message: '로그아웃에 성공했습니다.' });
  });
};
