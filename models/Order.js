const Order = (sequelize, DataTypes) => {
  const order = sequelize.define(
    'Order_item',
    {
      order_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return order;
};

module.exports = Order;
