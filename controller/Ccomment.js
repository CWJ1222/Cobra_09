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

async function countChildComments(commentId, groupId, baseComment) {
  try {
    // 자식 댓글 가져오기
    console.log('commentId는', commentId);
    console.log('groupId는', groupId);

    const childComments = await db.Comment.findAll({
      where: {
        parent_id: commentId,
        comment_group: groupId,
      },
    });
    console.log('childComments는   ', childComments);
    console.log('childComments의 갯수는   ', childComments.length);

    // 자식 댓글의 수
    let totalChildren = childComments.length;
    console.log(' // 매 사이클마다 찾는 자식 댓글의 수', childComments.length);
    // 각 자식 댓글에 대해 재귀 호출하여 자식 댓글 수 누적
    for (const child of childComments) {
      totalChildren += await countChildComments(child.comment_id, groupId);
    }

    console.log(' 최종 자식댓글수', totalChildren);

    return totalChildren;
  } catch (err) {
    console.log(err);
  }
}

// comment_order 최댓값 찾기 (대댓글이 아닐때)
async function getHighestOrder() {
  try {
    const maxOrder = await db.Comment.findOne({
      attributes: [
        [
          db.Sequelize.fn('MAX', db.Sequelize.col('comment_order')),
          'max_comment_order',
        ],
      ],
    });
    console.log('대댓글이 아닌경우 max order값은   ', maxOrder);
    console.log(
      '대댓글이 아닌경우 max order값은   ',
      maxOrder.dataValues.max_comment_order
    );
    console.log(
      '대댓글이 아닌경우 max order값은   ',
      maxOrder.dataValues.max_comment_order
        ? maxOrder.dataValues.max_comment_order
        : 0
    );
    return maxOrder.dataValues.max_comment_order
      ? maxOrder.dataValues.max_comment_order
      : 0;
  } catch (err) {
    console.log(err);
  }
}

async function arrangeOrder(maxOrder, baseComment, operation) {
  try {
    // 해당 maxOrder + 1의 order를 가지는 컬럼 부터 +1증가 or -1감소
    console.log('arrangeOrder안에서 받는 baseComment는  ', baseComment);
    console.log('maxOrder는  ', maxOrder);

    const CommentOrder = await db.Comment.findAll({
      where: {
        comment_group: baseComment.comment_group,
        comment_order: {
          [db.Sequelize.Op.gt]: maxOrder + baseComment.comment_order,
        },
      },
    });
    console.log('변경하려는 댓글 모음은 ', CommentOrder);

    const updateCommentOrder = await db.Comment.update(
      {
        comment_order: db.Sequelize.literal(`comment_order ${operation} 1`),
      },
      {
        where: {
          comment_group: baseComment.comment_group,
          comment_order: {
            [db.Sequelize.Op.gt]: maxOrder + baseComment.comment_order,
          },
        },
      }
    );

    console.log('대대글이 존재할때 변경처리된 댓글의 수 ', updateCommentOrder);
  } catch (err) {
    console.log(err);
  }
}

exports.writeComment = async (req, res) => {
  try {
    const { content, product_key, comment_id, parent_id } = req.body;
    const user_id = req.session.user.user_pk;
    console.log('요청 댓글 정보 ', comment_id, parent_id);

    // 1. 대댓글인지 여부 확인
    const isReplyComment = parent_id >= 0 && comment_id;
    console.log('해당댓글은 대댓글인가요?  ', isReplyComment);

    let baseComment;
    let totalChildren;

    if (isReplyComment) {
      // 2. 선택한 댓글을 조회(group_id 값 가져옴)
      baseComment = await getColByCommentId(comment_id);

      if (baseComment.comment_depth > 4) {
        res.send({
          isSuccess: false,
          message: '더 이상 답변 댓글을 추가할 수 없습니다.',
        });
        return;
      }

      // 3. 선택한 댓글(comment_id)의 모든 자식갯수를 계산
      totalChildren = await countChildComments(
        baseComment.comment_id,
        baseComment.comment_group,
        baseComment
      );

      // baseComment 뒤로 순서 재정렬
      await arrangeOrder(totalChildren, baseComment, '+');

      console.log('선택 댓글의 전체 자식의 수는', totalChildren);
    }
    console.log('baseComment는', baseComment);
    console.log('baseComment comment_group는', baseComment?.comment_id);
    console.log('baseComment comment_group는', baseComment?.comment_group);

    // 최종 값을 생성
    const createResult = await db.Comment.create({
      content,
      product_key,
      user_id,
      comment_group: isReplyComment
        ? baseComment.comment_group
        : (await getMaxCommentGroup()) + 1,
      comment_order: isReplyComment
        ? (await countChildComments(
            baseComment.comment_id,
            baseComment.comment_group,
            baseComment
          )) +
          baseComment.comment_order +
          1
        : (await getHighestOrder()) + 1,
      comment_depth: isReplyComment ? baseComment.comment_depth + 1 : 0,
      parent_id: isReplyComment ? baseComment.comment_id : 0,
    });

    res.send({
      isSuccess: true,
      message: '댓글 등록 성공',
      comments: createResult.dataValues,
    });
  } catch (err) {
    console.log('발생에러는    ', err);
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

exports.getCommentsByProduct = async (product_key) => {
  // const product_key = req.params.id;
  // console.log(req.params);

  try {
    const comments = db.Comment.findAll({
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
    });
    return comments;
  } catch (err) {
    console.log('댓글가져오기 에러', err);
  }
};

exports.renderCommentPage = (req, res) => {
  res.render('commentTest');
};
