const { Product } = require('../models'); // Product 모델 불러오기

// 구매 페이지 렌더링 (GET)
exports.purchasePage = async (req, res) => {
  try {
    // Product 테이블에서 모든 데이터 가져오기
    const products = await Product.findAll();

    // 데이터를 purchaseTest.ejs로 전달
    res.render('purchaseTest', { products, currentPage: 'purchaseTest' });
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

    res.render('buyForm', { product });
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류');
  }
};
