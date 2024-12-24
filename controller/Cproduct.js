const db = require('../models');

// 화면 렌더링
exports.renderProducts = (req, res) => {
  res.status(200).render('purchase', { currentPage: 'product' });
};

// 전체 판매글 조회 (판매자 측)
exports.getAllProducts = (req, res) => {
  db.Product.findAll({
    attributes: [
      'category_id',
      'product_key',
      'name',
      'deadline',
      'price',
      'max_quantity',
      'image',
    ],
  })
    .then((result) => {
      // console.log('컨트롤러 전체 상품 데이터:', products);
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({
        isSuccess: false,
        message: '서버 에러가 발생했습니다.',
      });
    });
};

// 특정 카테고리 상품 데이터 조회
exports.getItemsByCategory = (req, res) => {
  const categoryId = req.params.id;
  db.Product.findAll({
    where: {
      category_id: categoryId,
    },
    attributes: [
      'product_key',
      'name',
      'deadline',
      'price',
      'max_quantity',
      'image',
    ],
  })
    .then((result) => {
      console.log('특정 카테고리 상품 데이터', result);
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).send({
        isSuccess: false,
        message: '서버 에러가 발생했습니다.',
      });
    });
};
