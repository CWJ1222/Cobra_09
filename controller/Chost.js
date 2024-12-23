const db = require('../models');

// 판매 물품 등록 페이지 렌더링
exports.renderHostPage = (req, res) => {
  res.render('hostTest');
};

// // 공동구매 주최자 물품 등록
// exports.registerProduct = (req, res) => {
//   // 유저가 입력한 물품 정보
//   console.log('유저가 입력한 물품 정보', req.body);
//   console.log('유저가 입력한 물품 파일', req.file);

//   // 파일명만 추출
//   const filename = req.file ? req.file.filename : null;

//   db.Product.create({
//     name: req.body.name,
//     deadline: req.body.deadline,
//     price: req.body.price,
//     max_quantity: req.body.max_quantity,
//     image: filename,
//     category_id: req.body.category_id,
//     user_id: req.session.user.user_pk,
//   })
//     .then((result) => console.log(result))
//     .catch((err) => console.log(err));
//   res.send('응답완료');
// };

exports.registerProduct = (req, res) => {
  try {
    // 데이터 저장 로직
    db.Product.create({
      name: req.body.name,
      deadline: req.body.deadline,
      price: req.body.price,
      max_quantity: req.body.max_quantity,
      image: req.file ? req.file.filename : null,
      category_id: req.body.category_id,
      user_id: req.session.user.user_pk,
    })
      .then(() => {
        // 저장 성공 시 홈 화면으로 리다이렉트 신호 반환
        res.status(200).json({ success: true, redirectUrl: '/' });
      })
      .catch((err) => {
        console.error(err);
        res
          .status(500)
          .json({ success: false, message: '데이터베이스 저장 실패' });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 내부 오류' });
  }
};
