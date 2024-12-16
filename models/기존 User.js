// TODO: DB(mysql) 연결
// TODO: 모델 코드

// 0. mysql 연결
// 1. 새로운 회원 정보 데이터 등록
// 2-1. 특정 회원 정보 조회 (로그인 성공 여부를 위해id pw 비교)
// 2-2. 특정 회원 정보 조회 (특정 id 를 잦아 정보를 프론트로 보내주기 위해)
// 4. 특정 회원 정보 삭제
// 5. 특정 회원 정보 수정

const mysql = require("mysql");
const conn = mysql.createConnection({
  host: "localhost",
  user: "sesac", // 기존에 만들었던 sesac 으로 해도 되고 새롭게 만들어도 됨
  password: "4321",
  database: "sesac",
});

// 1. 특정 회원정보 등록
// POST /user/signup
exports.post_signup = (data, cb) => {
  const sql = `INSERT INTO user (userid, name, pw) 
  VALUES ('${data.userid}','${data.name}','${data.pw}')`;
  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    console.log("post_singup", rows);
    // OkPacket {
    //     fieldCount: 0,
    //     affectedRows: 1,
    //     insertId: 0,
    //     serverStatus: 2,
    //     warningCount: 0,
    //     message: '',
    //     protocol41: true,
    //     changedRows: 0
    //   }

    // View & Controller에서 회원정보 사용하지 않기 때문에
    // 데이터 보내주지 않고 응답 종료
    cb();
  });
};

// 2-1. 특정 회원정보 조회
//  userid와 password 기준으로 조회
// POST /user/signin
exports.post_signin = (data, cb) => {
  const sql = `SELECT * FROM user WHERE userid='${data.userid}' and pw='${data.pw}' LIMIT 1`;
  // LIMIT1을 걸어주는 이유
  // 회원가입시 중복 id 검사하지 않아서 겹치는 id 생길 수 있음
  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    console.log(rows); // [ {} ]
    cb(rows);
  });
};

// 2-2. 특정 회원정보 조회
// userid 기준으로 조회
// 로그인한 유저 한 명을 가져옴!
// POST /user/profile
exports.post_profile = (userid, cb) => {
  const sql = `SELECT * FROM user WHERE userid='${userid}' LIMIT 1`;
  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    console.log("Model User: ", rows); // [ {} ]
    cb(rows);
  });
};

// 3. 특정 회원정보 수정
// POST /user/profile/edit
exports.edit_profile = (data, cb) => {
  console.log(data);
  // const sql = `UPDATE user SET userid='${data.userid}', name='${data.name}', pw='${data.pw}' WHERE id='${data.id}'`;
  const sql = `UPDATE user SET name='${data.name}', pw='${data.pw}' WHERE id='${data.id}'`;
  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    console.log("Model edit profile", rows);
    // OkPacket {
    //   fieldCount: 0,
    //   affectedRows: 1,
    //   insertId: 0,
    //   serverStatus: 2,
    //   warningCount: 0,
    //   message: '(Rows matched: 1  Changed: 1  Warnings: 0',
    //   protocol41: true,
    //   changedRows: 1
    // }

    cb(); // 암것도 안보내줘도 ok
  });
};

// 4. 특정 회원정보 삭제
// POST /user/profile/delete
exports.delete_profile = (id, cb) => {
  const sql = `DELETE FROM user WHERE id='${id}'`;
  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    cb();
  });
};
