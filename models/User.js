const User = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'user',
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    { timestamps: true, freezeTableName: true }
  );
  return model;
};

module.exports = User;
