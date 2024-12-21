const { Op } = require('sequelize');
const { Category, Product, User, Order } = require('../models');

// GET '/' : 메인 페이지 렌더링
exports.main = (req, res) => {
  res.render('index', { title: '홈페이지', currentPage: 'home' });
};

// 사용하고 있지 않음 API -> 수정 필요
exports.purchase = (req, res) => {
  res.render('purchase', { title: '구매 페이지', currentPage: 'purchase' });
};

// 판매 페이지 -> 수정 필요
// POST '/host/register' : 공동구매 진행하고 싶은 물품 등록
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

// PUT /user -> 내 정보 수정 API
exports.postChangeUser = async (req, res) => {
  try {
    const user = req.session.user.user_pk;
    const change_email = 'change@naer.com'; // 임시 이메일 (클라이언트에서 받아오는 것)
    const change_nickname = 'change'; // 임시 닉네임 (클라이언트에서 받아오는 것)

    const result_change = await User.update(
      {
        nickname: change_nickname,
        password: change_password,
      },
      {
        where: {
          user_id: user,
        },
      }
    );
    // 성공하면 1로 받아옴!
    if (result_change[0] > 0) {
      res.status(200).send({ isSuccess: true });
    } else {
      res.status(200).send({ isSuccess: false });
    }
  } catch (err) {
    console.log('err', err);
    res.status(200).send({ isSuccess: false });
  }
};

// GET '/host/lists' -> 내가 주선한 공동구매 물품 보여주는 API
exports.getMyProducts = async (req, res) => {
  try {
    console.log(req.session.user);
    const target = req.session.user.user_pk;

    const products = await Product.findAll({
      where: { user_id: target },
      attributes: ['name', 'deadline', 'max_quantity'],
    });
    res.status(200).send({ isSuccess: true, products });
  } catch (err) {
    console.log('err', err);
    res.status(500).send({
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// GET '/join' -> 내가 구매한 물품 모두 보여주는 API
exports.getMyJoins = async (req, res) => {
  try {
    const target = req.session.user.user_pk;
    const orders = await Order.findAll({
      where: { user_id: target },
      attributes: ['quantity'],
      include: [{ model: Product, attributes: ['name', 'user_id'] }],
    });
    res.status(200).send({ isSuccess: true, orders });
  } catch (err) {
    console.log('err', err);
    res.status(500).send({
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// /user
exports.getAllUser = async (req, res) => {
  try {
    // const target = req.session.user.user_pk;
    const target = 1;
    const user = await User.findOne({
      where: { user_id: target },
      attributes: ['password', 'nickname', 'email'],
    });
    res.status(200).send({ isSuccess: true, user });
  } catch (err) {
    console.log('err', err);
    res.status(500).render('mypage', {
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// 특정 하나의 판매 물품만 가져옴 - GET /host/list/:id
exports.getProduct = async (req, res) => {
  try {
    const product_id = 1; // 임시 product_id
    const product = await Product.findOne({
      where: { product_key: product_id },
      attributes: [
        'name',
        'deadline',
        'price',
        'user_id',
        'max_quantity',
        'image',
        'category_id',
      ],
    });
    res.status(200).send({ isSuccess: true, product });
  } catch (err) {
    console.log('err', err);
    res.status(200).send({ isSuccess: false });
  }
};

// DELETE '/delete' 회원 탈퇴 (아예 삭제)
exports.deleteMyUser = async (req, res) => {
  try {
    // user_id 가져옴
    const target = req.session.user.user_pk;
    const deleteresult = await User.destroy({
      where: { user_id: target },
    });

    if (deleteresult === 0) {
      return res.status(404).send({
        isSuccess: false,
        message: '해당 사용자를 찾을 수 없습니다.',
      });
    }
    res.status(200).send({ isSuccess: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: '서버 오류가 발생했습니다.' });
  }
};
