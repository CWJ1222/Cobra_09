const db = require('../models');

// 화면 렌더링 및 전체 판매글 조회 (판매자 측)
exports.getAllProducts = (req, res) => {
  db.Product.findAll({
    attributes: [
      'product_key',
      'name',
      'deadline',
      'price',
      'max_quantity',
      'image',
    ],
  })
    .then((products) => {
      console.log('전체 상품 데이터:', products);
      res.status(200).render('purchase', {
        products,
        currentPage: 'product',
        user: req.session.user,
      });
    })
    .catch((err) => {
      res.status(500).render('purchase', {
        isSuccess: false,
        currentPage: 'product',
        products: [],
        message: '서버 에러가 발생했습니다.',
      });
    });
};

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
      console.log('result', result); // 반환 데이터 확인
      res.status(200).json(result); // 배열로 반환
    })
    .catch((err) => {
      console.error('Error fetching products by category:', err);
      res.status(500).send({
        isSuccess: false,
        message: '서버 에러가 발생했습니다.',
      });
    });
};
