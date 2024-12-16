const User = function (Sequelize, DataTypes) {
  // Sequelize와 DataTypes는 각각 models/index.js에서 전달받은
  // (new Sequelize()로 생성한)sequelize 객체와 (require('sequelize')를 통해 불러온) Sequelize 모듈

  // sequelize의 객체(인스턴스)는 테이블을 정의할 수 있는 define()메소드를 가지고 있음

  // Sequilize.define(param1, param2, param3) // 테이블 정의를 도와주는 sequelize 함수
  // param1: 모델(테이블) 이름 설정
  // param2: 컬럼 정의
  // param3: 모델 옵션 정의
  return Sequelize.define(
    "user", // param1: 모델 이름 설정
    {
      // id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      // userid VARCHAR(20) NOT NULL,
      userid: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      // name VARCHAR(10) NOT NULL,
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      // pw VARCHAR(20) NOT NULL
      pw: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    }, // param2: 컬럼 정의
    {
      freezeTableName: true,
      timestamps: false,
    }, // param3: 모델 옵션 정의
  );
};

module.exports = User;
