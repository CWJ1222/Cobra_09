// TODO: 컨트롤러 코드
const models = require("../models");
// GET /user
exports.main = (req, res) => {
  res.render("index");
};

// GET /user/signup
exports.get_signup = (req, res) => {
  res.render("signup");
};

// GET /user/signin
exports.get_signin = (req, res) => {
  res.render("signin");
};

/* MODEL에게 DB 정보 요청하는 부분  */
// POST /user/signup
// 회원가입
exports.post_signup = (req, res) => {
  //   console.log(req.body);
  // [기존 controller 코드, model의 post_signup 사용하는 중]
  //   User.post_signup(req.body, () => {
  //     res.end();
  //   });

  // [sequelize 적용]
  // *** 기존 User의 post_signup 내에 있는 sql 문 ***
  /*  const sql = `INSERT INTO user (userid, name, pw) 
  VALUES ('${data.userid}','${data.name}','${data.pw}')`; */

  models.User.create({
    userid: req.body.userid,
    name: req.body.name,
    pw: req.body.pw,
  }).then((result) => {
    console.log("post_signup", result);
    // result 결과
    /*  user {
          dataValues: { id: 8, userid: 'bb', name: 'bb', pw: 'bb' }, // this is result object!
          _previousDataValues: { userid: 'bb', name: 'bb', pw: 'bb', id: 8 },   
          uniqno: 1,
          _changed: Set(0) {},
          _options: {
            isNewRecord: true,
            _schema: null,
            _schemaDelimiter: '',
            attributes: undefined,
            include: undefined,
            raw: undefined,
            silent: undefined
          },
          isNewRecord: false
        }
    result값 위와 같이 나오지만
    dataValues: 삽입된 데이터, result.id 등으로 바로 접근 가능
    */
    console.log(result.id);
    // create 의 결과인 result 객체는 테이블의 컬럼을 key로 가지고 있음
    // (User 테이블에는 id라는 컬럼이 있어서 result.id로 접근 가능하다.)
    res.end(); // 프론트에게 아무것도 보내지 않고 응답 종료
  });
};

// POST /user/signin
// 로그인 1. 로그인 가능한 계정인지 아닌지만 비교
exports.post_signin = (req, res) => {
  console.log(req.body); // { userid: ~ , pw: ~ }
  // [기존 controller 코드, model의 post_signin 사용하는 중]
  //   User.post_signin(req.body, (result) => {
  //     console.log("Controller post_sign: ", result);  // [ RowDataPacket { id: 'sean', name: 'sean', pw: '1234' } ]

  //     console.log(result.length);
  //     if (result.length > 0) {
  //       res.send(true);
  //     } else {
  //       res.send(false);
  //     }
  //   });

  // [sequelize 적용]
  // *** 기존 User의 post_signin 내에 있는 sql 문 ***
  /* const sql = `SELECT * FROM user
 WHERE userid='${data.userid}' and pw='${data.pw}' LIMIT 1`; */

  //  findOne은 가장 먼저 있는 하나의 데이터만을 찾기 때문에 LIMIT 없어도 OK
  models.User.findOne({
    where: {
      userid: req.body.userid,
      pw: req.body.pw,
    },
  }).then((result) => {
    // result: findOne을 이용해서 찾은 결과
    // 데이터를 못찾는다면 null반환
    console.log("post_signin", result);
    if (result) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
};

// POST /user/profile, 로그인 버튼 클릭시 요청되는 form 전송
// 로그인 2. 로그인 가능한 회원이라면,
// 회원 정보 수정 페이지 render 시켜주기
exports.post_profile = (req, res) => {
  // [기존 controller 코드, model의 post_profile 사용하는 중]
  /*    console.log(req.body); //{userid: ~}
    User.post_profile("req.body.userid", (result) => {
      // post_signin에서 userid가 테이블에 있을 때만
      // /user/profile에 POST 요청을 보내기 때문에 userid가 넘어오는지 아닌지는 확인하지 않아도 됨
      // 로그인 성공; views/profile.ejs 렌더링
      res.render("profile", { data: result[0] });
    }); */

  // [sequelize 적용]
  // *** 기존 User의 post_profile 내에 있는 sql 문 ***
  /*   const sql = `SELECT * FROM user 
    WHERE userid='${userid}' LIMIT 1`; */
  models.User.findOne({
    where: {
      userid: req.body.userid,
    },
  }).then((result) => {
    console.log("post_profile", result); // 찾은 결과를 {} 배열이 아닌 객체 형태로 반환함
    res.render("profile", { data: result });
  });
};

// POST /user/profile/edit
// 회원 정보 수정
exports.edit_profile = (req, res) => {
  console.log(req.body);
  // [기존 controller 코드, model의 edit_profile 사용하는 중]

  //   User.edit_profile(req.body, () => {
  //     // res.send('회원정보 수정 성공!');
  //     res.end();
  //   });
  // ====

  //   [sequelize 적용]
  // *** 기존 User의 edit_profile 내에 있는 sql 문 ***
  /* const sql = `UPDATE user 
  SET name='${data.name}', pw='${data.pw}' 
  WHERE id='${data.id}'`; */
  models.User.update(
    {
      name: req.body.name,
      pw: req.body.pw,
    },
    {
      where: {
        id: req.body.id,
      },
    },
  ).then((result) => {
    console.log(result); //수정성공 [1], 수정실패 [0]
    console.log(result[0]);
    res.end();
  });
};

// POST /user/profile/delete
// 회원 탈퇴
exports.delete_profile = (req, res) => {
  console.log(req.body);
  // [기존 controller 코드, model의 delete_profile 사용하는 중]

  /*   
  User.delete_profile(req.body.id, () => {
    // res.redirect(주소): 리다이렉트할 주소와 함께 응답 보내기!!
    // res.redirect('/user/signin');
    // res.redirect('/user');
    // res.send(true);
    res.end();
  }); */

  // [sequelize 적용]
  // *** 기존 User의 delete_profile 내에 있는 sql 문 ***
  //   const sql = `DELETE FROM user WHERE id='${id}'`;
  models.User.destroy({
    where: {
      id: req.body.id,
    },
  }).then((result) => {
    console.log("delete profile", result); //1 (성공) 0(실패)
    // 실패할 경우?
    // where조건에 해당하는 레코드를 못찾았을 때
    res.end();
  });
};
