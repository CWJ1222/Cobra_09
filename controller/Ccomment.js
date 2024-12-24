const db = require('../models');

// 댓글 생성
exports.writeComment = (req, res) => {
  const { content, product_id } = req.body;
  // const user_id = req.session.user.user_pk;
  const user_id = 2;

  db.Comment.create({
    content,
    product_id,
    user_id,
  })
    .then((result) => {
      // 응답 comments는 객체형태
      res.send({
        isSuccess: true,
        message: '댓글 등록 성공',
        comments: result.dataValues,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ isSuccess: false, message: '댓글 등록 실패' });
    });
};

// 댓글 삭제
exports.removeComment = (req, res) => {
  const { product_id, comment_id } = req.body;
  const user_id = req.session.user.user_pk;

  db.Comment.destroy({
    where: {
      comment_id: comment_id,
      user_id: user_id,
      product_id: product_id,
    },
  })
    .then((result) => {
      res.send({
        isSuccess: true,
        message: '댓글 삭제 성공',
      });
    })
    .catch((err) => {
      res.send({ isSuccess: false, message: '댓글 삭제 실패' });
    });
};

// 물품 전체 댓글 조회
exports.getCommentsByProduct = (req, res) => {
  const { product_id } = req.body;
  // const user_id = req.session.user.user_pk;
  const user_id = 3;

  db.Comment.findAll({
    where: {
      product_id: product_id,
    },
    attributes: ['content', 'createdAt', 'user_id'],
    include: [{ model: db.User }, { model: db.Product }],
  })
    .then((result) => {
      // 응답 comments는 배열형태
      res.send({
        isSuccess: true,
        comments: result,
        message: '물품의 댓글 조회 성공',
      });
    })
    .catch((err) => {
      res.send({
        isSuccess: false,
        message: '물품의 댓글 조회 실패',
      });
    });
};
