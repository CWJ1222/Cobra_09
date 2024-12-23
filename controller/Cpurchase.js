const { Product } = require('../models'); // Product 모델 불러오기
const { Order } = require('../models');

// 구매 페이지 렌더링 (GET)
exports.purchasePage = async (req, res) => {
  try {
    // Product 테이블에서 모든 데이터 가져오기
    const products = await Product.findAll();
    // fe: 데이터 확인
    console.log('상품', products);

    // 데이터를 purchaseTest.ejs로 전달
    res.render('purchase', { products, currentPage: 'purchase' });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('서버 오류');
  }
};

//구매신청페이지
exports.buyForm = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.product_key);
    if (!product) {
      return res.status(404).send('상품을 찾을 수 없습니다.');
    }

    // 세션에서 사용자 ID 가져오기
    const userId = req.session.user ? req.session.user.user_pk : null;

    // 사용자 ID가 없으면 로그인 페이지로 리다이렉트
    // if (!userId) {
    //   return res.redirect('/auth/login');
    // }
    // 로그인 후 원래 가려 했던 페이지로 이동하기
    if (!userId) {
      // 세션에 redirectUrl 저장
      req.session.redirectUrl = `/buyform/${req.params.product_key}`;
      return res.redirect('/auth/login'); // 쿼리스트링 제거
    }

    res.render('buyForm', { product, userId });
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류');
  }
};

//구매요청라우트
exports.createOrder = async (req, res) => {
  try {
    const { product_key, user_id, quantity, address, phone } = req.body;

    // 데이터 유효성 검사
    if (!product_key || !user_id || !quantity || !address || !phone) {
      return res.status(400).send('모든 필드를 입력해주세요.');
    }

    // 주문 생성
    const newOrder = await Order.create({
      product_key,
      user_id,
      quantity,
      address,
      phone,
    });

    // 주문 생성 성공 시 리다이렉트 또는 응답
    res.status(201).send('주문이 성공적으로 생성되었습니다.');
  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};
