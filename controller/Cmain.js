const { Op } = require('sequelize');
const { Category, Product, User, Order } = require('../models');

exports.main = (req, res) => {
  res.render('index');
};

// GET /products
exports.getAllProducts = async (req, res) => {
  try {
    const target = 1; // 세션 user_id에서 받아올 것
    // products에서 user_id에 해당하는거 모두 가져옴
    const products = await Product.findAll({
      where: { host_id: target }, // user_id == host_id 같은 의미!
      attributes: ['name', 'deadline', 'max_quantity'],

      // include :[
      //     {model : User, attributes: ['user_id']}
      // ],
    });
    res.status(200).send({ isSuccess: true, products });
  } catch (err) {
    console.log('err', err);
    res
      .status(200)
      .send({
        isSuccess: false,
        message: '공동 구매 내역을 조회하는 중 오류가 발생했습니다.',
      });
  }
};

// GET /joins
exports.getAllJoins = async (req, res) => {
  try {
    const target = 1; // 세션 user_id에서 받아올 것
    // order에서 user_id에 해당하는거 모두 가져옴
    const orders = await Order.findAll({
      where: { user_id: target }, // user_id == host_id 같은 의미!
      attributes: ['quantity'],
      include: [{ model: Product, attributes: ['name', 'host_id'] }],
    });
    res.status(200).send({ isSuccess: true, orders });
  } catch (err) {
    console.log('err', err);
    res
      .status(500)
      .send({
        isSuccess: false,
        message: '구매 내역을 조회하는 중 오류가 발생했습니다.',
      });
  }
};
