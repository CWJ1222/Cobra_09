const db = require('../models');

// 판매 물품 등록 페이지 렌더링
exports.renderHostPage = (req, res) => {
  res.render('hostTest');
};

// 공동구매 주최자 물품 등록
exports.registerProduct = (req, res) => {
  // 유저가 입력한 물품 정보
  console.log('유저가 입력한 물품 정보', req.body);
  console.log('유저가 입력한 물품 파일', req.file);

  db.Product.create({
    name: req.body.name,
    deadline: req.body.deadline,
    price: req.body.price,
    max_quantity: req.body.max_quantity,
    image: '/' + req.file.path,
    category_id: req.body.category_id,
    user_id: req.session.user.user_pk,
  })
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
  res.send('응답완료');
};
