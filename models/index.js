"use strict";

const Sequelize = require("sequelize");
// const config = require(__dirname + "/../config/config.json")["development"];

// dotenv 사용하는 경우, 다음과 같이 설정 가능 (with,config.js)
const config = require(__dirname + "/../config/config.js")["development"];
console.log("config >>", config);

const db = {};

/* sequelize 객체 선언,
매개변수로 DB명, 사용자, 비밀번호, 정보전체를 받음
*/
let sequelize = new Sequelize(config.database, config.username, config.password, config);

/* 비어있던 db객체에 두 개의 key를 추가하는 작업
 db={"sequelize":sequelize, "Sequelize":Sequelize}
*/
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 새로운 모델 만들 때마다 sequeilze 인스턴스 및 Sequelize 모듈 전달
db.User = require("./User")(sequelize, Sequelize);

module.exports = db;

// db라는 변수를 내보냄
// sequelize 객체를 만들고 module로써 내보내고
// "다른 파일에서 모두 같은 객체를 사용할 수 있게" 됨.
// (만약에 다른 파일에서 sequelize를 쓰고 싶으면 각각의 파일에서 다시 만들어야 함.
// 그렇다면 각각의 파일에서 다른 객체를 사용하고 있게 되는 것.)
