const { where } = require('sequelize');
const db = require('../models');

// comment_group 최댓값 찾기 (대댓글이 아닐때)
async function getMaxCommentGroup() {
  const maxCommentResult = await db.Comment.findOne({
    attributes: [
      [
        db.Sequelize.fn('MAX', db.Sequelize.col('comment_group')),
        'max_comment_group',
      ],
    ],
  });
  return maxCommentResult.dataValues.max_comment_group;
}

// comment_id에 해당하는 comment 찾기
// 리턴 commentColumn
async function getColByCommentId(comment_id) {
  const commentColumn = db.Comment.findOne({
    where: {
      comment_id: comment_id,
    },
  });
  return commentColumn;
}

// comment_id에 해당하는 comment_group값 찾기 (대댓글 일때)
async function getArrangeOrder(baseComment, comment_id, operation) {
  const sameParentCol = await db.Comment.findOne({
    where: {
      parent_id: comment_id,
    },
    attributes: [
      [
        db.Sequelize.fn('MAX', db.Sequelize.col('comment_order')),
        'max_comment_order',
      ],
    ],
    group: ['comment_group'],
  });
  console.log('대댓글이존재할때 자식 댓글정보');
  // 대댓글이 이미 존재하는지 여부 확인
  const maxGroupOrder = sameParentCol
    ? sameParentCol.dataValues.max_comment_order
    : 0;
  console.log('대대글이 존재할때 최대 order값 ', maxGroupOrder);

  // 해당 comment_group의 전체 order를 재변경 +1
  const updateCommentOrder = await db.Comment.update(
    {
      comment_order: db.Sequelize.literal(`comment_order ${operation} 1`),
    },
    {
      where: {
        comment_group: baseComment.comment_group,
        comment_order: {
          [db.Sequelize.Op.gt]: maxGroupOrder
            ? sameParentCol.dataValues.max_comment_order
            : baseComment.comment_order,
        },
      },
    }
  );
  console.log('대대글이 존재할때 변경처리 후 값 ', updateCommentOrder);
  return maxGroupOrder
    ? sameParentCol.dataValues.max_comment_order + 1
    : baseComment.comment_order + 1;
}

// 댓글 생성
exports.writeComment = async (req, res) => {
  const { content, product_key, comment_id, parent_id } = req.body;
  const user_id = req.session.user.user_pk;
  console.log('요청 댓글 정보 ', comment_id, parent_id);

  try {
    // 대댓글인지 여부 확인
    const isReplyComment = parent_id >= 0 && comment_id;
    const baseComment = isReplyComment
      ? await getColByCommentId(comment_id)
      : null;
    console.log('baseComment는', baseComment?.dataValues);

    // 댓글 추가 부분
    const createResult = await db.Comment.create({
      content,
      product_key,
      user_id,
      comment_group: isReplyComment
        ? baseComment.comment_group
        : (await getMaxCommentGroup()) + 1,
      comment_order: isReplyComment
        ? await getArrangeOrder(baseComment, comment_id, '+')
        : 1,
      comment_depth: isReplyComment ? baseComment.comment_depth + 1 : 0,
      parent_id: isReplyComment ? comment_id : 0,
    });

    console.log('result.dataValues,', createResult);

    res.send({
      isSuccess: true,
      message: '댓글 등록 성공',
      comments: createResult.dataValues,
    });
  } catch (err) {
    console.log(err);
    res.send({ isSuccess: false, message: '댓글 등록 실패' });
  }
};

// 댓글 삭제
exports.removeComment = async (req, res) => {
  const { product_id, comment_id } = req.body;
  const user_id = req.session.user.user_pk;

  try {
    // 대댓글인지 여부 확인
    const isReplyComment = parent_id >= 0 && comment_id;
    const baseComment = isReplyComment
      ? await getColByCommentId(comment_id)
      : null;
    console.log('baseComment는', baseComment?.dataValues);

    const destroyResult = db.Comment.destroy({
      where: {
        comment_id: comment_id,
        user_id: user_id,
        product_id: product_id,
      },
    });

    res.send({
      isSuccess: true,
      message: '댓글 삭제 성공',
    });
  } catch (err) {
    res.send({
      isSuccess: false,
      message: '댓글 삭제 실패',
    });
  }

  // 대댓글이라면 해당 댓글을 삭제하고 해당 댓글 order 뒤 컬럼부터 해당 그룹에 속해있는 댓글에 한정해서 order를 1씩 줄인다 그룹에 속하는 댓글들의
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
  console.log(req.params);
  db.Comment.findAll({
    where: {
      product_key: product_key,
    },
    attributes: [
      'comment_id',
      'content',
      'comment_group',
      'comment_order',
      'comment_depth',
      'parent_id',
      'createdAt',
      'updatedAt',
    ],
    order: [
      ['comment_group', 'ASC'],
      ['comment_order', 'ASC'],
      ['comment_depth', 'ASC'],
    ],
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

exports.renderCommentPage = (req, res) => {
  res.render('commentTest');
};
