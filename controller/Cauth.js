const db = require('../models');
const axios = require('axios');
const { hashPassword, verifyPassword } = require('../utils/common');
require('dotenv').config();

// 세션이 있는지를 검증
exports.isSessionValid = (req, res, next) => {
  if (req.session.user) {
    // 인증된 유저인 경우
    // console.log('세션이 존재하는 유저입니다.');
    next();
  } else {
    // console.log('세션이 존재하지 않는 유저입니다.');
    // 인증안된 유저인 경우
    res.redirect('/auth/login');
  }
};

// 세션이 없는지를 검증
exports.isSessionInvalid = (req, res, next) => {
  if (!req.session.user) {
    // 인증안된 유저인 경우
    // console.log('세션이 존재하지 않는 유저입니다.');
    next();
  } else {
    // 인증된 유저인 경우
    res.redirect('/');
  }
};

// 로그인 페이지 렌더링
exports.renderLoginPage = (req, res) => {
  const redirectUrl = req.session.redirectUrl || '/'; // 세션에 저장된 URL 사용
  // console.log('컨트롤러 user 확인', user);
  res.render('login', {
    currentPage: '',
    user: req.session.user, //세션에 사용자 정보 추가
    redirectUrl, // 로그인 성공 후 이동할 URL 전달
  });
};

// 일반 로그인 처리(세션 생성)
exports.loginUser = async (req, res) => {
  const { userId: inputUserId, password: inputUserPw } = req.body;

  // 세션에서 redirectUrl 가져오기
  const redirectUrl = req.session.redirectUrl || '/'; // 기본값은 홈
  delete req.session.redirectUrl; // 사용 후 세션에서 삭제

  try {
    const resultUser = await db.User.findOne({
      where: {
        email: inputUserId,
      },
    });
    // console.log('resultUser', resultUser);

    // 404 not found
    if (!resultUser) {
      res.status(401).send({
        isSuccess: false,
        message:
          '회원 정보를 찾을 수 없습니다. 이메일, 비밀번호를 확인 또는 회원가입을 진행해주세요.',
      });
      return;
    }

    const isEqual = verifyPassword(
      inputUserPw,
      resultUser.salt,
      resultUser.password
    );
    if (isEqual) {
      // 세션에 로그인 상태 저장
      req.session.user = {
        user_pk: resultUser.user_id,
        isLogin: true, // 로그인 여부 추가
        user_type: resultUser.user_type,
      };
      // console.log('일반 로그인 후 세션:', req.session.user);

      // 200 ok
      res.status(200).send({
        isLogin: true,
        nickname: resultUser.nickname,
        redirectUrl, // 로그인 성공 후 리다이렉트할 URL
        message: '로그인 성공 했습니다.',
      });
    } else {
      // 비밀번호 불일치: 401 unauthorized
      res.status(401).send({
        isSuccess: false,
        message: '비밀번호가 일치 하지 않습니다.',
      });
    }
  } catch (err) {
    // 서버 내부 에러: 500 internal server error
    res.status(500).send({
      isSuccess: false,
      message: '서버 에러',
    });
  }
};

// 카카오 로그인 페이지로 리다이렉트
exports.redirectKakaoLogin = (req, res) => {
  res.redirect(
    `${process.env.KAKAO_AUTH_CODE_URI}?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code&prompt=login`
  );
};

// kakao 로그인 후에 서버로부터 쿼리스트링으로 인가코드를 받음
// 카카오 페이지에 등록한 리다이렉트 uri 요청에 실행되는 컨트롤러
// 서버측에서 처리하도록 변경하기
exports.getKaKaoAuthCode = (req, res, next) => {
  const isEmpty = Object.keys(req.query).length;
  if (isEmpty) {
    req.auth_code = req.query;
    // console.log('auth_code', req.auth_code);
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
      // console.log('getKaKaoToken 토큰 응답', result.data);
      const {
        access_token,
        refresh_token,
        expires_in,
        refresh_token_expires_in,
      } = result.data;
      const access_token_expire = new Date(
        new Date().getTime() + expires_in * 1000
      );
      // 엑세스 토큰 테스트용으로 만료 시간
      // const access_token_expire = new Date(new Date().getTime() + 30 * 1000);
      const refresh_token_expire = new Date(
        new Date().getTime() + refresh_token_expires_in * 1000
      );

      // console.log('getKaKaoToken에서 url 확인 1', req.session.redirectUrl);
      req.session.user = {
        ...req.session.user,
        token: {
          access_token,
          access_token_expire,
          refresh_token,
          refresh_token_expire,
        },
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
  console.log('getKakaoUserInfo에서 access_token 확인', req.session.user);
  axios({
    url: process.env.KAKAO_USERINFO_URI,
    method: 'post',
    headers: {
      Authorization: `Bearer ${req.session.user.token.access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  })
    .then((result) => {
      // console.log('카카오 로그인 회원정보', result.data);
      req.kakao_user_info = {
        nickname: result.data.properties.nickname,
        email: result.data.kakao_account.email,
        user_type: '2',
      };
      next();
    })
    .catch((err) => {
      console.log(err);
      res.send('서버 에러');
    });
};

// 카카오 로그인 처리 (세션 생성)
exports.loginKakaoUser = async (req, res, next) => {
  try {
    const findResult = await db.User.findOne({
      where: {
        email: req.kakao_user_info.email,
        user_type: req.kakao_user_info.user_type,
      },
      attributes: ['user_id', 'email', 'password', 'nickname', 'user_type'],
    });

    // console.log('서버에서 찾은 유저 결과', findResult);
    // 존재하지 않는 유저라면 가입후 로그인 처리
    if (!findResult) {
      // password는 임의값으로 생성
      const createResult = await db.User.create({
        email: req.kakao_user_info.email,
        password: 'kakao_default', // 카카오에서 얻는 정보에는 pw가 없어서 임의 값 할당 -  추후 랜덤값으로 변경
        nickname: req.kakao_user_info.nickname,
        salt: 'kakao_default',
        user_type: req.kakao_user_info.user_type, // salt 임의값
      });
      // console.log('카카오 유저 새로만든 정보', createResult);

      req.session.user = {
        ...req.session.user,
        user_pk: createResult.user_id,
        user_type: createResult.user_type,
      };
      req.token_for_msg = req.session.user.token.access_token;
      this.sendKakaoMsg({
        text: `카카오 회원가입 후 로그인 처리되었습니다.     ${new Date().toLocaleString(
          'ko-KR'
        )}`,
      })(req, res, () => {
        const redirectUrl = req.session.redirectUrl || '/';
        res.redirect(`${redirectUrl || '/'}`);
      });
    } else {
      req.session.user = {
        ...req.session.user,
        user_pk: findResult.user_id,
        user_type: findResult.user_type,
      };
      req.token_for_msg = req.session.user.token.access_token;
      this.sendKakaoMsg({
        text: `카카오 로그인 처리되었습니다.     ${new Date().toLocaleString(
          'ko-KR'
        )}`,
      })(req, res, () => {
        // console.log('최종 세션', req.session);
        const redirectUrl = req.session.redirectUrl || '/'; // 기본값은 홈
        delete req.session.redirectUrl; // 사용 후 세션에서 삭제
        res.redirect(`${redirectUrl || '/'}`);
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
    if (user_type === '1') {
      req.session.destroy((err) => {
        if (err) {
          res.status(500).send({
            isSuccess: false,
            message: '로그아웃 실패(세션 삭제 실패)',
          });
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
    res.status(400).send({
      isSuccess: false,
      message: '로그인 된 사용자를 찾을 수 없습니다.',
    });
  }
};

// 카카오 로그아웃 처리
// 사용자가 브라우저 카카오 브라우저창에서 처리한 후 리다이렉션 되는 uri api
exports.logoutKaKaoUser = (req, res, next) => {
  // console.log('카카오 유저 로그아웃 실행');
  req.token_for_msg = req.session.user.token.access_token;
  req.session.destroy((err) => {
    if (err) {
      res
        .status(500)
        .send({ isSuccess: true, message: '카카오 유저 세션 삭제 실패' });
    }

    this.sendKakaoMsg({
      text: `카카오 로그아웃 처리되었습니다.     ${new Date().toLocaleString(
        'ko-KR'
      )}`,
    })(req, res, () => {
      res.clearCookie('connect.sid');
      res.redirect('/');
      // console.log('메세지 보낸 후 동작되는 부분');
    });
  });
};

// 카카오와 애플리케이션 연결 끊기(회원탈퇴 - 동의창 새로 띄우기)
// 엑세스, 리프레쉬 토큰 만료처리(로그아웃)도 같이 됨
exports.unlinkKakaoUser = (req, res) => {
  // console.log('req.body.access_token는    ', req.body);
  axios({
    url: process.env.KAKAO_UNLINK_URI,
    method: 'post',
    headers: {
      Authorization: `Bearer ${req.body.access_token}`,
    },
  })
    .then((result) => {
      // 카카오서버의 회원 id를 응답받음
      // console.log('카카오서버의 회원 id를 응답', result.data.id);
      db.User.destroy({
        where: {
          user_id: req.body.user_pk,
        },
      })
        .then((result) => {
          // console.log('카카오 탈퇴결과', result);
          res
            .status(200)
            .send({ isSuccess: true, message: '카카오 연결 끊기 완료' });
          // res.status(200).send({ message: '회원 탈퇴가 완료되었습니다.' });
        })
        .catch((err) => {
          console.log('카카오 연결끊기 오류', err);
        });
      // res.send(result.data);
    })
    .catch((err) => {
      console.log(err);
      res.send('서버 에러');
    });
};

// access + refresh 토큰 만료 요청
exports.expireKakaoToken = (req, res) => {
  axios({
    url: process.env.KAKAO_EXPIRE_TOKEN_URI,
    method: 'post',
    headers: {
      Authorization: `Bearer ${req.session.user.token.access_token}`,
    },
  })
    .then((result) => {
      console.log(result.data);
      res.send(result.data);
    })
    .catch((err) => {
      console.log(err);
      res.send('서버 에러');
    });
};

// access 토큰 만료 검증
exports.checkExpireKakaoToken = (req, res, next) => {
  if (req.session.user?.token) {
    if (
      new Date().getTime() >=
      new Date(req.session.user.token.access_token_expire)
    ) {
      if (
        new Date().getTime() >=
        new Date(req.session.user.token.refresh_token_expire)
      ) {
        // 리프레쉬 토큰 만료시 재로그인 요청
        req.session.destroy((err) => {
          if (err) {
            res.status(500).send({
              isSuccess: false,
              message: '재로그인이 필요합니다.',
            });
          }
          res.clearCookie('connect.sid');
          res.redirect('/auth/login');
        });
      } else {
        // 리프레쉬 토큰로 엑세스 토큰 재발급
        // console.log('엑세스 토큰 재발급 요청');
        axios({
          url: process.env.KAKAO_TOKEN_URI,
          method: 'post',
          data: {
            grant_type: 'refresh_token',
            client_id: process.env.KAKAO_CLIENT_ID,
            refresh_token: req.session.user.token.refresh_token,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        })
          .then((result) => {
            const { expires_in } = result.data;
            // console.log('엑세스 토큰 재발급 요청 결과', result.data);
            req.session.user.token.access_token_expire = new Date(
              new Date().getTime() + expires_in * 1000
            );
            next();
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({
              isSuccess: false,
              message: '엑세스 토큰 재발급에 실패하였습니다.',
            });
          });
      }
    } else {
      next();
    }
  } else {
    next();
  }
};

// 카카오 메세지 보내기
exports.sendKakaoMsg = (template) => {
  const data = {
    template_object: JSON.stringify({
      object_type: 'text',
      text: template.text || '입력 텍스트가 없습니다.',
      link: {
        web_url: template.web_url || 'http://localhost:8080',
        mobile_web_url: template.web_url || 'http://localhost:8080',
      },
    }),
  };
  return (req, res, next) => {
    // console.log('메세지 보내기 함수에서의 req', req.token_for_msg);
    axios({
      url: process.env.KAKAO_SEND_MSG_URI,
      method: 'post',
      data: data,
      headers: {
        Authorization: `Bearer ${req.token_for_msg}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })
      .then((result) => {
        console.log('메시지 보내기 result', result.data);
        next();
      })
      .catch((err) => {
        console.log('메시지 보내기 err', err);
        next();
      });
  };
};
