const Sequelize = require('sequelize');
// const config = require(__dirname + '/../config/config.js')['development'];
const env = process.env.NODE_ENV || 'development';
let config = require(__dirname + '/../config/config.js')[env];

const db = {};

let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// 모델 불러와서 인자로 정보 전달
const CategoryModel = require('./Category')(sequelize, Sequelize);
const ProductModel = require('./Product')(sequelize, Sequelize);
const UserModel = require('./User')(sequelize, Sequelize);
const OrderModel = require('./Order')(sequelize, Sequelize);
const WishlistsModel = require('./Wishlists')(sequelize, Sequelize);

// 1 : N 관계
CategoryModel.hasMany(ProductModel, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
});
ProductModel.belongsTo(CategoryModel, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
});

// 1 : N 관계
UserModel.hasMany(ProductModel, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ProductModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

// 1 : N 관계
UserModel.hasMany(OrderModel, { foreignKey: 'user_id', onDelete: 'CASCADE' });
OrderModel.belongsTo(UserModel, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// 1 : N 관계
ProductModel.hasMany(OrderModel, {
  foreignKey: 'product_key',
  onDelete: 'CASCADE',
});
OrderModel.belongsTo(ProductModel, {
  foreignKey: 'product_key',
  onDelete: 'CASCADE',
});

// N:M 관계
UserModel.belongsToMany(ProductModel, {
  through: WishlistsModel,
  foreignKey: 'user_id',
  otherKey: 'product_key',
});

ProductModel.belongsToMany(UserModel, {
  through: WishlistsModel,
  foreignKey: 'product_key',
  otherKey: 'user_id',
});

db.Category = CategoryModel;
db.Product = ProductModel;
db.User = UserModel;
db.Order = OrderModel;
db.Wishlists = WishlistsModel;

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;

// 연결 확인
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Mysql에 연결 성공!');
  } catch (error) {
    console.log('데이터베이스 연결 실패 ', error);
  }
})();
