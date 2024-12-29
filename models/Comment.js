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
      comment_group: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment_depth: { type: DataTypes.INTEGER, allowNull: false },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { timestamps: true, freezeTableName: true }
  );
  return model;
};

module.exports = Comment;
