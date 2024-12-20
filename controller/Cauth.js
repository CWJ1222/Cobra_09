const db = require('../models');
const axios = require('axios');
require('dotenv').config();

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

// 세션 유무 확인
// req.sessionStatus에 boolean 값 저장
// exports.sessionCheck = (req, res, next) => {
//   if (req.session.user) {
//     req.sessionStatus = {
//       hasSession: true,
//     };
//     next();
//   } else {
//     req.sessionStatus = {
//       hasSession: false,
//     };
//     next();
//   }
// };

// 로그인 페이지 렌더링
// env 값 클라이언트 노출 시키지 않음
exports.renderLoginPage = (req, res) => {
  res.render('loginTest', {
    currentPage: 'login',
  });
};

// 일반 로그인 처리(세션 생성)
exports.loginUser = async (req, res) => {
  const { userId: inputUserId, password: inputUserPw } = req.body;
  // fe: 클라이언트 데이터 확인
  console.log('입력된 userId:', inputUserId);
  console.log('입력된 pw:', inputUserPw);
  try {
    const resultUser = await db.User.findOne({
      where: {
        email: inputUserId,
      },
    });
    console.log('resultUser', resultUser);
    if (!resultUser) {
      res.status(200).send({
        isSuccess: false,
        message: '회원이 아닙니다.',
      });
      return;
    }
    const isEqual = verifyPassword(
      inputUserPw,
      resultUser.salt,
      resultUser.password
    );
    if (isEqual) {
      req.session.user = {
        user_pk: resultUser.user_id,
      };
      res.status(200).send({
        isLogin: true,
        nickname: resultUser.nickname,
        message: '로그인 성공 했습니다.',
      });
    } else {
      res.status(200).send({
        isSuccess: false,
        message: '비밀번호가 일치 하지 않습니다.',
      });
    }
  } catch (err) {
    res.status(200).send({
      isSuccess: false,
      message: '서버 에러',
    });
  }
};

// 사용자가 kakao id,pw입력 후 처리 리다이렉트 요청 처리
exports.redirectKakaoLogin = (req, res) => {
  res.redirect(
    `${process.env.KAKAO_AUTH_CODE_URI}?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`
  );
};

// 카카오 로그인 처리 (세션 생성)
exports.loginKakaoUser = async (req, res, next) => {
  try {
    const findResult = await db.User.findOne({
      where: { email: req.kakao_user_info.email },
      attributes: ['user_id', 'email', 'password', 'nickname'],
    });

    console.log('서버에서 찾은 유저 결과', findResult);
    // 존재하지 않는 유저라면 가입후 로그인 처리
    if (!findResult) {
      // password는 임의값으로 생성
      const createResult = await db.User.create({
        email: req.kakao_user_info.email,
        password: 'kakao_default', // 카카오에서 얻는 정보에는 pw가 없어서 임의 값 할당 -  추후 랜덤값으로 변경
        nickname: req.kakao_user_info.nickname,
        salt: 'kakao_default',
        user_type: '2', // salt 임의값
      });
      req.session.user = {
        user_pk: createResult.user_id,
      };
      res.status(200).send({
        isLogin: true,
        nickname: createResult.nickname,
        message: '회원가입 후 로그인 성공',
      });
    } else {
      req.session.user = {
        user_pk: findResult.user_id,
      };
      res.status(200).send({
        isLogin: true,
        nickname: findResult.nickname,
        message: '로그인 성공',
      });
    }
  } catch (err) {
    console.log(err);
    res.send('서버 에러');
  }
};

// 로그아웃 처리(일반 로그인 + 카카오 로그인의 세션 삭제)
// 카카오 유저인 경우 get /auth/kakao/logout 으로 리다이렉트 요청됨
exports.logoutUser = async (req, res) => {
  try {
    const findResult = await db.User.findOne({
      where: { user_id: req.session.user.user_pk },
      attributes: ['user_id', 'email', 'password', 'nickname', 'user_type'],
    });
    const user_type = findResult.dataValues.user_type; // 유저 타입 구분
    if (user_type === 'normal') {
      req.session.destroy((err) => {
        if (err) {
          res.status(500).send({ isSuccess: true, message: '로그아웃 성공' });
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
      });
    } else {
      res.redirect(
        `${process.env.KAKAO_LOGOUT_URI}?client_id=${process.env.KAKAO_CLIENT_ID}&logout_redirect_uri=${process.env.KAKAO_LOGOUT_REDIRECT_URI}`
      );
    }
  } catch (err) {
    res.status(400).send({ isSuccess: false, message: '서버 에러' });
  }
};

// 카카오 로그아웃 처리
// 사용자가 브라우저 카카오 브라우저창에서 처리한 후 리다이렉션 되는 uri api
exports.logoutKaKaoUser = (req, res) => {
  console.log('카카오 유저 로그아웃 실행');
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send({ isSuccess: true, message: '서버 에러 발생' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};

// kakao 로그인 후에 서버로부터 쿼리스트링으로 인가코드를 받음
// 카카오 페이지에 등록한 리다이렉트 uri 요청에 실행되는 컨트롤러
// 서버측에서 처리하도록 변경하기
exports.getKaKaoAuthCode = (req, res, next) => {
  if (req.query) {
    req.auth_code = req.query;
    console.log('auth_code', req.auth_code);
    next();
  } else {
    res.redirect('/');
  }
};

// 카카오 로그인 유저에 대한 토큰 획득
exports.getKaKaoToken = (req, res, next) => {
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
      console.log('getKaKaoToken 토큰 응답', result.data);
      const { access_token, refresh_token } = result.data;
      req.token = {
        access_token,
        refresh_token,
      };
      next();
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/');
    });
};

// kakao 서버로부터 사용자의 정보를 가져옴
exports.getKakaoUserInfo = (req, res, next) => {
  console.log('getKakaoUserInfo에서 access_token 확인', req.token.access_token);
  axios({
    url: process.env.KAKAO_USERINFO_URI,
    method: 'post',
    headers: {
      Authorization: `Bearer ${req.token.access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  })
    .then((result) => {
      req.kakao_user_info = {
        nickname: result.data.properties.nickname,
        email: result.data.kakao_account.email,
      };
      next();
    })
    .catch((err) => {
      console.log(err);
      res.send('서버 에러');
    });
};
