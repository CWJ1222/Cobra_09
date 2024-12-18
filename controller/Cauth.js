const db = require('../models');
const axios = require('axios');
require('dotenv').config();

// 세션이 있는지를 검증
exports.isSessionValid = (req, res, next) => {
  if (req.session.user) {
    // 인증된 유저인 경우
    console.log('인증된 유저입니다.');
    next();
  } else {
    console.log('인증되지 않은 유저입니다.');
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
  res.render('loginTest');
};

// 로그인 처리
exports.loginUser = async (req, res) => {
  const { userId: inputUserId, password: inputUserPw } = req.body;
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

// 로그아웃 처리(세션 삭제)
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send({ message: '서버 에러 발생' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
    // res.status(200).send({ message: '로그아웃에 성공했습니다.' });
  });
};

// kakao 로그인 페이지로 리다이렉트
exports.redirectKakaoLogin = (req, res) => {
  res.redirect(
    `${process.env.KAKAO_AUTH_CODE_URI}?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`
  );
};

// kakao 로그인 후에 서버로부터 쿼리스트링으로 인가코드를 받음
// 카카오 페이지에 등록한 리다이렉트 uri 요청에 실행되는 컨트롤러
exports.getKaKaoAuthCode = (req, res, next) => {
  console.log('쿼리스트링 인가코드', req.query);
  if (req.query) {
    req.auth_code = req.query;
    console.log('auth_code', req.auth_code);
    next();
  } else {
    res.redirect('/');
  }
};

// 인가 코드를 가지고 카카오 서버로 부터 token 발급받음
exports.getKaKaoToken = (req, res) => {
  axios({
    url: process.env.KAKAO_TOKEN_URI,
    method: 'post',
    data: {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID,
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      code: req.query.code,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  })
    .then((result) => {
      console.log('토큰 응답', result);
      const { access_token, refresh_token } = result.data;

      console.log('access_token', access_token);
      console.log('refresh_token', refresh_token);
      req.session.user = {
        access_token,
        refresh_token,
      };
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
};
