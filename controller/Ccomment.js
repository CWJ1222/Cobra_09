const { where } = require('sequelize');
const db = require('../models');

const {
  getMaxCommentGroup,
  getColByCommentId,
  countChildComments,
  getHighestOrder,
  arrangeOrder,
} = require('../utils/common');

exports.writeComment = async (req, res) => {
  try {
    const { content, product_key, comment_id, parent_id } = req.body;
    const user_id = req.session.user.user_pk;

    const isReplyComment = parent_id >= 0 && comment_id;
    let baseComment;
    let totalChildren;

    if (isReplyComment) {
      baseComment = await getColByCommentId(comment_id);

      if (baseComment.comment_depth > 4) {
        return res.send({
          isSuccess: false,
          message: '더 이상 답변 댓글을 추가할 수 없습니다.',
        });
      }

      totalChildren = await countChildComments(
        baseComment.comment_id,
        baseComment.comment_group
      );

      await arrangeOrder(totalChildren, baseComment, '+');
    }

    const createResult = await db.Comment.create({
      content,
      product_key,
      user_id,
      comment_group: isReplyComment
        ? baseComment.comment_group
        : (await getMaxCommentGroup()) + 1,
      comment_order: isReplyComment
        ? totalChildren + baseComment.comment_order + 1
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
    console.error('댓글 작성 에러:', err);
    res.send({ isSuccess: false, message: '댓글 등록 실패' });
  }
};

// 댓글 삭제
exports.removeComment = async (req, res) => {
  const { product_id, comment_id } = req.body;
  const user_id = req.session.user.user_pk;

  try {
    const destroyResult = await db.Comment.destroy({
      where: {
        comment_id,
        user_id,
        product_id,
      },
    });

    res.send({
      isSuccess: true,
      message: '댓글 삭제 성공',
    });
  } catch (err) {
    console.error('댓글 삭제 에러:', err);
    res.send({
      isSuccess: false,
      message: '댓글 삭제 실패',
    });
  }
};

exports.modifyComment = async (req, res) => {
  const { product_id, content, comment_id } = req.body;
  const user_id = req.session.user.user_pk;

  try {
    const result = await db.Comment.update(
      { content },
      {
        where: {
          comment_id,
          user_id,
          product_id,
        },
      }
    );

    if (result[0]) {
      res.send({ isSuccess: true, message: '댓글 수정 성공' });
    } else {
      res.send({ isSuccess: false, message: '댓글 수정 실패' });
    }
  } catch (err) {
    console.error('댓글 수정 에러:', err);
    res.send({ isSuccess: false, message: '댓글 수정 실패' });
  }
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
