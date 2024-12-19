const User = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(63),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(63),
        allowNull: false,
      },
      salt: {
        type: DataTypes.STRING(255), // salt 저장 필드 추가
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return user;
};

module.exports = User;
