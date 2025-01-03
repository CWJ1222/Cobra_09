// const { Op } = require('sequelize');
const { Op, sequelize } = require('../models'); // sequelize 추가
const { Category, Product, User, Order, Wishlists } = require('../models');
const axios = require('axios');
const { hashPassword } = require('../utils/common');

// 메인 페이지에서 찜 많은 상품 순으로 나열
exports.main = async (req, res) => {
  try {
    // Wishlists와 Products를 조인하고, wishlist_id 기준으로 정렬
    const products = await Wishlists.findAll({
      attributes: [
        'product_key',
        [sequelize.fn('COUNT', sequelize.col('wishlist_id')), 'wishlistCount'], // wishlist_id 개수 계산
      ],
      include: [
        {
          model: Product, // Product 모델 포함
          as: 'ProductWishlists', // 관계 정의에서 사용한 별칭
          attributes: ['name', 'price', 'image', 'deadline'], // 필요한 필드만 선택
        },
      ],
      group: ['product_key'], // product_key 기준 그룹화
      order: [[sequelize.fn('COUNT', sequelize.col('wishlist_id')), 'DESC']], // wishlist_id 개수 기준 정렬
      raw: true,
      nest: true,
    });
    // console.log(products);
    // 메인 페이지 렌더링
    res.render('index', {
      title: '메인 페이지',
      user: req.session.user,
      products,
      currentPage: 'home',
    });
  } catch (error) {
    console.error('메인 페이지 오류:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};

// 사용하고 있지 않음 API -> 수정 필요
exports.purchase = (req, res) => {
  res.render('purchase', {
    title: '구매 페이지',
    user: req.session.user,
    currentPage: 'purchase',
  });
};

// 세션이 있는지를 검증
exports.isSessionValid = (req, res, next) => {
  if (req.session.user) {
    // 인증된 유저인 경우
    // console.log(req.session.user);
    next();
  } else {
    // console.log(req.session.user);
    console.log('error');
  }
};

exports.postChangeUser = async (req, res) => {
  try {
    const userId = req.session.user.user_pk; // 세션에서 사용자 ID 가져오기
    const { nickname, password } = req.body; // 클라이언트에서 닉네임과 비밀번호 받기

    // 유효성 검사: 입력된 값이 없으면 실패 응답
    if (!nickname && !password) {
      return res.status(400).send({
        isSuccess: false,
        message: '닉네임 또는 비밀번호 중 하나를 입력해주세요.',
      });
    }

    const updateData = {};

    // 닉네임이 입력된 경우 업데이트 데이터에 추가
    if (nickname) {
      updateData.nickname = nickname;
    }

    // 비밀번호가 입력된 경우 암호화 후 업데이트 데이터에 추가
    if (password) {
      const { salt, hash } = hashPassword(password);
      updateData.password = hash;
      updateData.salt = salt;
    }

    // 데이터베이스 업데이트
    const updateResult = await User.update(updateData, {
      where: { user_id: userId },
    });

    // 업데이트 결과 확인
    if (updateResult[0] > 0) {
      return res.status(200).send({
        isSuccess: true,
        message: '정보가 성공적으로 수정되었습니다.',
      });
    } else {
      return res
        .status(400)
        .send({ isSuccess: false, message: '정보 수정에 실패했습니다.' });
    }
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    return res
      .status(500)
      .send({ isSuccess: false, message: '서버 오류가 발생했습니다.' });
  }
};

// GET '/host/lists' -> 내가 주선한 공동구매 물품 보여주는 API
exports.getMyProducts = async (req, res) => {
  try {
    // console.log(req.session.user);
    const target = req.session.user.user_pk;

    const products = await Product.findAll({
      where: { user_id: target },
      attributes: [
        'name',
        'price',
        'deadline',
        'max_quantity',
        'product_key',
        'image',
      ],
    });

    res
      .status(200)
      .render('mysellpage', { isSuccess: true, products, currentPage: '' });
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
      attributes: ['quantity', 'address', 'product_key'],
      include: [
        {
          model: Product,
          attributes: ['name', 'user_id', 'price', 'deadline', 'image'],
        },
      ],
    });
    res
      .status(200)
      .render('mybuypage', { isSuccess: true, orders, currentPage: '' });
  } catch (err) {
    console.log('err', err);
    res.status(500).send({
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// GET '/user/mypage' : 마이페이지 렌더링 + 사용자 정보 조회
exports.renderMypage = async (req, res) => {
  try {
    // // 세션에서 사용자 ID 가져오기
    const userId = req.session.user.user_pk;
    if (!userId) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      return res.redirect('/auth/login');
    }
    const user = await User.findOne({
      where: { user_id: userId },
      attributes: ['email', 'nickname'], // 필요한 필드만 선택
      include: [
        {
          model: Order,
          attributes: ['product_key', 'quantity'],
          include: [
            {
              model: Product,
            },
          ],
        },
      ],
    });
    const images = user.Order_items.map((item) => item.product.image) || [];
    const products = await Product.findAll({
      where: { user_id: userId },
      attributes: [
        'product_key',
        'name',
        'deadline',
        'max_quantity',
        'price',
        'image',
      ],
    });
    const wishlists = await Wishlists.findAll({
      where: { user_id: userId },
      attributes: ['product_key'],
      include: [
        {
          model: Product,
          attributes: ['name', 'price', 'image', 'deadline'],
          as: 'ProductWishlists',
        },
      ],
    });
    const formattedWishlists = wishlists.map((wishlist) => {
      const product = wishlist.dataValues.ProductWishlists?.dataValues;
      return {
        product_key: wishlist.dataValues.product_key,
        name: product?.name,
        price: product?.price,
        image: product?.image,
        deadline: product?.deadline,
      };
    });

    res.render('mypage', {
      isSuccess: true,
      user,
      product: user.Order_items,
      order: products,
      image: images,
      wish: formattedWishlists,
      currentPage: '',
    });
  } catch (error) {
    console.error('마이페이지 렌더링 오류:', error);
    res.status(500).send('서버 오류');
  }
};

// 특정 하나의 판매 물품만 가져옴 - GET /host/list/:id
exports.getProduct = async (req, res) => {
  try {
    const product_id = req.params.product_key; // 임시 product_id
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
        'product_key',
      ],
    });
    res.status(200).render('products', { isSuccess: true, product });
  } catch (err) {
    console.log('err', err);
    res.status(200).send({ isSuccess: false });
  }
};

exports.deleteMyUser = async (req, res) => {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = req.session.user ? req.session.user.user_pk : null;

    if (!userId) {
      return res.status(400).send({
        isSuccess: false,
        message: '로그인된 사용자가 없습니다.',
      });
    }

    // 사용자 삭제
    const deleteResult = await User.destroy({
      where: { user_id: userId },
    });

    if (deleteResult === 0) {
      return res.status(404).send({
        isSuccess: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // console.log('카카오 연결끊기 유저 타입 조회 시작', req.session);
    if (req.session.user.user_type === '2') {
      // console.log('카카오 연결끊기 유저 타입 조회 시작');
      const unlinkResult = await axios({
        url: 'http://localhost:8080/auth/kakao/unlink',
        method: 'post',
        data: {
          access_token: req.session.user.token.access_token,
          user_pk: req.session.user.user_pk,
        },
      });
      // console.log('카카오 연결끊기 result 끝', unlinkResult);
    }

    // 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        console.error('세션 삭제 중 오류:', err);
        return res.status(500).send({
          isSuccess: false,
          message: '서버 오류가 발생했습니다.',
        });
      }
      res.clearCookie('connect.sid'); // 세션 쿠키 제거
      res.status(200).send({ isSuccess: true });
    });
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    res.status(500).send({
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// POST '/wishlist/:product_key' 찜하기 기능
exports.postWishlists = async (req, res) => {
  try {
    const userId = req.session.user.user_pk; // 세션에서 user_id 가져오기
    const productKey = req.params.product_key; // URL에서 product_key 가져오기

    // db에서 상태 확인
    const wishlist = await Wishlists.findOne({
      where: { user_id: userId, product_key: productKey },
    });

    if (wishlist) {
      // 위시 리스트에서 삭제
      await wishlist.destroy();
      return res.status(200).send({
        isSuccess: true,
        message: '위시 리스트에서 삭제되었습니다.',
      });
    } else {
      await Wishlists.create({
        user_id: userId,
        product_key: productKey,
      });
      return res.status(200).send({
        isSuccess: true,
        message: '위시 리스트에 추가되었습니다.',
      });
    }
  } catch (error) {
    console.log('err', error);
    return res
      .status(500)
      .send({ isSuccess: false, message: '서버 오류가 발생했습니다.' });
  }
};

exports.getWishlists = async (req, res) => {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = req.session.user ? req.session.user.user_pk : null;

    if (!userId) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      return res.redirect('/auth/login');
    }

    // 찜한 상품 가져오기
    const wishlists = await Wishlists.findAll({
      where: { user_id: userId },
      attributes: ['product_key'],
    });

    if (wishlists.length === 0) {
      return res.render('wishlist', {
        isSuccess: true,
        message: '찜한 상품이 없습니다.',
        products: [],
      });
    }

    const productKeys = wishlists.map((wishlist) => wishlist.product_key);
    const products = await Product.findAll({
      where: { product_key: productKeys },
    });

    res.render('wishlist', {
      isSuccess: true,
      message: '찜한 상품 목록입니다.',
      products,
    });
  } catch (error) {
    console.error('찜한 상품 렌더링 오류:', error);
    res.status(500).send('서버 오류');
  }
};
