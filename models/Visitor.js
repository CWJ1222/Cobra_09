const Visitor = function (Sequelize, DataTypes) {
  const model = Sequelize.define(
    "visitor",
    {
      id: {
        // id int not null primary key auto_increment
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        // name varchar(10) not null
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      comment: {
        // comment mediumtext
        type: DataTypes.TEXT("medium"),
      },
    }, // 컬럼 정의
    {
      timestamps: false,
      // 데이터 추가/수정 컬럼을 자동으로 만들어서 기록
      // 기본값 true
      freezeTableName: true,
      // 기본값 false
      // 첫번째 인자로 전달을 해준 모델 이름 그대로
      // 테이블이름을 고정하겠다!
    },
  );

  return model;
};

module.exports = Visitor; // models/index.js 에서 사용할 예정
