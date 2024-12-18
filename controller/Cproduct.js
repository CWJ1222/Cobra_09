const db = require('../models');

// 전체 판매글 조회 (판매자 측)
exports.getAllProducts = (req, res) => {
  db.Product.findAll({
    attributes: [
      'product_id',
      'name',
      'deadline',
      'price',
      'max_quantity',
      'image',
    ],
  })
    .then((result) => {
      console.log('result', result);
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({
        isSuccess: false,
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
      'product_id',
      'name',
      'deadline',
      'price',
      'max_quantity',
      'image',
    ],
  })
    .then((result) => {
      console.log('result', result);
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({
        isSuccess: false,
        message: '서버 에러가 발생했습니다.',
      });
    });
};
