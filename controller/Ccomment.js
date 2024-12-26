const { where } = require('sequelize');
const db = require('../models');

// 댓글 생성
exports.writeComment = async (req, res) => {
  const { content, product_key, comment_id, parent_id } = req.body;
  console.log(
    '요청 바디 내용은',
    req.body.comment_id,
    req.body.parent_id,
    req.body.content
  );
  const user_id = req.session.user.user_pk;

  try {
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
    async function getColByCommentId() {
      const commentColumn = db.Comment.findOne({
        where: {
          comment_id: comment_id,
        },
      });
      return commentColumn;
    }

    // comment_id에 해당하는 comment_group값 찾기 (대댓글 일때)
    async function orderArrange() {
      const commentIdCol = await db.Comment.findOne({
        where: {
          comment_id: comment_id,
        },
        attributes: ['comment_group', 'comment_order'],
      });
      console.log('댓글달려고 하는 기준 댓글정보', commentIdCol);

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
      // 선택한 댓글의 코멘트 id를 가지고 있는 대댓글이 있으면
      // 해당 댓글 코멘트id를 parent_id로 가지는 댓글들을 가져와서 그중에서 마지막  order값에 +1한 값을 가진다. (아직 생성안함 넣을 order값만 가지고있음)
      //
      // 해당 코멘트 id의 그룹을 가지고 있으면서 마지막 order값보다 큰 컬럼의 order값을 +1씩 증가한다.

      // 대댓글이 없으면 해당 코멘트id의 order값에 +1한 값을 가진다. (아직 생성안함 넣을 order값만 가지고있음)
      // 해당 코멘트 id의 그룹을 가지고 있으면서 코멘트id의 order보다 큰 컬럼의 order를 +1 증가한다.

      // 대댓글이 이미 존재하는지 여부 확인
      const maxGroupOrder = sameParentCol
        ? sameParentCol.dataValues.max_comment_order
        : 0;
      console.log('대대글이 존재하는지 여부는 ', maxGroupOrder);

      // 해당 comment_group의 전체 order를 재변경 +1
      const updateCommentOrder = await db.Comment.update(
        {
          comment_order: db.Sequelize.literal('comment_order + 1'),
        },
        {
          where: {
            comment_group: commentIdCol.comment_group,
            comment_order: {
              [db.Sequelize.Op.gt]: maxGroupOrder
                ? sameParentCol.dataValues.max_comment_order
                : commentIdCol.comment_order,
            },
          },
        }
      );

      return maxGroupOrder
        ? sameParentCol.dataValues.max_comment_order + 1
        : commentIdCol.comment_order + 1;
    }

    const baseComment =
      parent_id >= 0 && comment_id ? await getColByCommentId() : null;
    console.log('baseComment는', baseComment?.dataValues);

    const createResult = await db.Comment.create({
      content,
      product_key,
      user_id,
      comment_group:
        parent_id >= 0 && comment_id
          ? baseComment.comment_group
          : (await getMaxCommentGroup()) + 1,
      comment_order: parent_id >= 0 && comment_id ? await orderArrange() : 1,
      comment_depth:
        parent_id >= 0 && comment_id ? baseComment.comment_depth + 1 : 0,
      parent_id: parent_id >= 0 && comment_id ? comment_id : 0,
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
