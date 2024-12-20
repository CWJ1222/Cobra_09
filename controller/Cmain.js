const { Op } = require('sequelize');
const { Category, Product, User, Order } = require('../models');

/* FE: 렌더링 */
// 홈페이지
exports.main = (req, res) => {
  res.render('index', { title: '홈페이지', currentPage: 'home' });
};
// 구매 페이지
exports.purchase = (req, res) => {
  res.render('purchase', { title: '구매 페이지', currentPage: 'purchase' });
};
// 판매 페이지
exports.sell = (req, res) => {
  res.render('sell', { title: '판매 페이지', currentPage: 'sell' });
};

// 세션이 있는지를 검증
exports.isSessionValid = (req, res, next) => {
  if (req.session.user) {
    // 인증된 유저인 경우
    console.log(req.session.user);
    next();
  } else {
    console.log(req.session.user);
    console.log('error');
  }
};

// PUT /user -> 내 정보 바꾸기 api
exports.postChangeUser = async (req, res) => {
  try{
    const user = req.session.user.user_pk;
    const change_email = 'change@naer.com' // 임시 이메일 (클라이언트에서 받아오는 것)
    const change_nickname = 'change'// 임시 닉네임 (클라이언트에서 받아오는 것)
    
    const result_change = await User.update(
      {
      nickname : change_nickname,
      email : change_email
      },
      {
        where : {
          user_id : user
        }
      }
    );
    // 성공하면 1로 받아옴!
    if (result_change[0] > 0) {
      res.status(200).send({isSuccess: true});
    } else {
      res.status(200).send({isSuccess:false})
    }
  } catch(err) {
    console.log('err', err);
    res.status(200).send({isSuccess:false});
  }
}

exports.getAllProducts = async (req, res) => {
  try {
    console.log(req.session.user);
    const target = req.session.user.user_pk; // 세션 user_id에서 받아올 것

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
    res.status(200).send({
      isSuccess: false,
      message: '공동 구매 내역을 조회하는 중 오류가 발생했습니다.',
    });
  }
};

// GET /joins
exports.getAllJoins = async (req, res) => {
  try {
    const target = req.session.user.user_pk; // 세션 user_id에서 받아올 것
    // order에서 user_id에 해당하는거 모두 가져옴
    const orders = await Order.findAll({
      where: { user_id: target }, // user_id == host_id 같은 의미!
      attributes: ['quantity'],
      include: [{ model: Product, attributes: ['name', 'user_id'] }],
    });
    res.status(200).send({ isSuccess: true, orders });
  } catch (err) {
    console.log('err', err);
    res.status(500).send({
      isSuccess: false,
      message: '구매 내역을 조회하는 중 오류가 발생했습니다.',
    });
  }
};

// /user
exports.getAllUser = async (req, res) => {
  try {
    const target = req.session.user.user_pk;
    const user = await User.findOne({
      where: { user_id: target },
      attributes: ['email', 'nickname'],
    });
    res.status(200).send({ isSuccess: true, user });
  } catch (err) {
    console.log('err', err);
    res
      .status(500)
      .send({ isSuccess: false, message: '사용자 정보가 없습니다.' });
  }
};

// 특정 하나의 판매 물품만 가져옴 - GET /host/list/:id
exports.getProduct = async (req, res) =>{
  try{
    const product_id = 1; // 임시 product_id
    const product = await Product.findOne({
      where: {product_key : product_id},
      attributes : ['name', 'deadline', 'price', 'user_id', 'max_quantity', 'image', 'category_id'],
      
    });
    res.status(200).send({isSuccess:true, product});
  } catch(err) {
    console.log('err', err);
    res.status(200).send({isSuccess: false});
  }
};

exports.login = (req, res) => {
  res.render('/login');
};
