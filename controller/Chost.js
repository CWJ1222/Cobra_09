const db = require('../models');

// 판매 물품 등록 페이지 렌더링
exports.renderHostPage = async (req, res) => {
  try {
    // 데이터베이스에서 카테고리 가져오기
    const categories = await db.Category.findAll();
    res.render('hostTest', {
      title: '판매 페이지',
      categories, // 카테고리 데이터를 ejs로 전달
      currentPage: 'host',
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
};

exports.registerProduct = (req, res) => {
  try {
    db.Product.create({
      name: req.body.name,
      deadline: req.body.deadline,
      price: req.body.price,
      net_price: req.body.net_price, // net_price 추가
      max_quantity: req.body.max_quantity,
      image: req.file ? req.file.filename : null,
      category_id: req.body.category_id,
      user_id: req.session.user.user_pk,
    })
      .then(() => {
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
