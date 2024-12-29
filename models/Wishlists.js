const { DataTypes } = require('sequelize');
const { sequelize } = require('.');

const Wishlists = (sequelize, DataTypes) => {
  const wishlists = sequelize.define(
    'wishlists',
    {
      wishlist_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_key: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'wishlists',
      timestamps: false,
    }
  );
  return wishlists;
};

module.exports = Wishlists;
