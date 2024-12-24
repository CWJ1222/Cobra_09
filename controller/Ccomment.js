const db = require('../models');

// 댓글 생성
exports.writeComment = (req, res) => {
  const { content, product_key } = req.body;
  const user_id = req.session.user.user_pk;

  db.Comment.create({
    content,
    product_key,
    user_id,
  })
    .then((result) => {
      // 응답 comments는 객체형태
      console.log('result.dataValues,', result);
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
      // 성공 1 / 실패 0
      if (result) {
        res.send({
          isSuccess: true,
          message: '댓글 삭제 성공',
        });
      } else {
        res.send({
          isSuccess: false,
          message: '댓글 삭제 실패',
        });
      }
    })
    .catch((err) => {
      res.send({ isSuccess: false, message: '서버 에러(댓글 삭제)' });
    });
};

// 댓글 수정
exports.modifyComment = (req, res) => {
  const { product_id, content, comment_id } = req.body;
  const user_id = req.session.user.user_pk;

  db.Comment.update(
    { content: content },
    {
      where: {
        comment_id: comment_id,
        user_id: user_id,
        product_id: product_id,
      },
    }
  )
    .then((result) => {
      // 성공 1 / 실패 0
      if (result[0]) {
        res.send({ isSuccess: true, message: '댓글 수정 성공' });
      } else {
        res.send({ isSuccess: false, message: '댓글 수정 실패' });
      }
    })
    .catch((err) => {
      res.send({ isSuccess: false, message: '서버 에러(댓글 수정)' });
    });
};

// 물품 전체 댓글 조회
exports.getCommentsByProduct = (req, res) => {
  const product_key = req.params.id;

  db.Comment.findAll({
    where: {
      product_key: product_key,
    },
    attributes: ['comment_id', 'content', 'createdAt', 'updatedAt'],
    include: [
      { model: db.User, attributes: ['nickname', 'user_id'] },
      { model: db.Product, attributes: ['product_key'] },
    ],
  })
    .then((result) => {
      // 응답 comments는 배열형태
      if (result.length) {
        res.send({
          isSuccess: true,
          comments: result,
          message: '해당 물품의 전체 댓글 조회 성공',
        });
      } else {
        res.send({
          isSuccess: false,
          comments: null,
          message: '해당 물품의 댓글이 존재하지 않습니다.',
        });
      }
    })
    .catch((err) => {
      res.send({
        isSuccess: false,
        message: '서버 에러(해당 물품의 전체 댓글 조회)',
      });
    });
};
