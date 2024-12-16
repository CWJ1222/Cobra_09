require("dotenv").config();

// config.json 에서 사용했던 정보를
// env 에 선언해서 사용
// env 왜 사용한다구요?~?
const development = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
};

module.exports = { development };
// 내보내기 한 이후에 models/index.js 에서 사용
