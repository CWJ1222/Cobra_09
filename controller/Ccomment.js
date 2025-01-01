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
    const user_id = req.session.user?.user_pk;

    if (!user_id) {
      req.session.redirectUrl = `/buyform/${product_key}`;
      res.send({
        isSuccess: false,
        message: '로그인이 필요합니다.',
      });
      return;
    }

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
  ///// 댓글 삭제시 삭제된 댓글로만 표시
  const { product_key, comment_id } = req.body;
  const user_id = req.session.user?.user_pk;

  if (!user_id) {
    req.session.redirectUrl = `/buyform/${product_key}`;
    res.send({
      isSuccess: false,
      message: '로그인이 필요합니다.',
    });
    return;
  }

  try {
    const result = await db.Comment.update(
      { content: '삭제 처리된 댓글입니다.' },
      {
        where: {
          comment_id,
          user_id,
          product_key,
        },
      }
    );

    if (result[0]) {
      res.send({ isSuccess: true, message: '댓글 삭제 성공' });
    } else {
      res.send({
        isSuccess: false,
        message: '댓글을 삭제할 수 없습니다.',
      });
    }
  } catch (err) {
    res.send({ isSuccess: false, message: '서버 에러(댓글 삭제)' });
  }

  ///// 댓글 삭제시 기존 테이블에서 삭제 처리
  // const { product_id, comment_id } = req.body;
  // const user_id = req.session.user.user_pk;
  // try {
  //   const destroyResult = await db.Comment.destroy({
  //     where: {
  //       comment_id,
  //       user_id,
  //       product_id,
  //     },
  //   });
  //   res.send({
  //     isSuccess: true,
  //     message: '댓글 삭제 성공',
  //   });
  // } catch (err) {
  //   console.error('댓글 삭제 에러:', err);
  //   res.send({
  //     isSuccess: false,
  //     message: '댓글 삭제 실패',
  //   });
  // }
};

exports.modifyComment = async (req, res) => {
  const { content, product_key, comment_id } = req.body;
  const user_id = req.session.user.user_pk;

  try {
    const result = await db.Comment.update(
      { content },
      {
        where: {
          comment_id,
          user_id,
          product_key,
        },
      }
    );

    if (result[0]) {
      res.send({ isSuccess: true, message: '댓글 수정 성공' });
    } else {
      res.send({
        isSuccess: false,
        message: '댓글을 수정할 수 없습니다.',
      });
    }
  } catch (err) {
    console.error('댓글 수정 에러:', err);
    res.send({ isSuccess: false, message: '서버 에러(댓글 수정)' });
  }
};

exports.getCommentsByProduct = async (product_key) => {
  try {
    const comments = await db.Comment.findAll({
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
        {
          model: db.User,
          attributes: ['nickname', 'user_id'],
        },
      ],
    });
    for (let comment of comments) {
      if (!comment.parent_id) {
        comment.dataValues.parent_user_nickname = null;
        continue;
      }
      const parentComment = await db.Comment.findOne({
        where: {
          comment_id: comment.parent_id,
        },
        attributes: ['user_id'],
      });

      const parentNickName = await db.User.findOne({
        where: {
          user_id: parentComment.user_id,
        },
        attributes: ['nickname'],
      });

      comment.dataValues.parent_user_nickname = parentNickName.nickname;
    }
    return comments;
  } catch (err) {
    console.log('댓글가져오기 에러', err);
  }
};
