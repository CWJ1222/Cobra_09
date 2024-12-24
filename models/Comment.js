const Comment = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'Comment',
    {
      comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    { timestamps: true, freezeTableName: true }
  );
  return model;
};

module.exports = Comment;
