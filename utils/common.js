const crypto = require('crypto');
const db = require('../models');

// 비밀번호 암호화
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
}

// 비밀번호 검증
function verifyPassword(password, salt, hash) {
  const newHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return newHash === hash;
}

// comment_group 최댓값 가져오기
async function getMaxCommentGroup() {
  const maxCommentResult = await db.Comment.findOne({
    attributes: [
      [
        db.Sequelize.fn('MAX', db.Sequelize.col('comment_group')),
        'max_comment_group',
      ],
    ],
  });
  return maxCommentResult?.dataValues?.max_comment_group || 0;
}

// comment_id로 댓글 가져오기
async function getColByCommentId(comment_id) {
  return db.Comment.findOne({
    where: { comment_id },
  });
}

// 자식 댓글 수 계산 (재귀)
async function countChildComments(commentId, groupId) {
  try {
    const childComments = await db.Comment.findAll({
      where: {
        parent_id: commentId,
        comment_group: groupId,
      },
    });

    let totalChildren = childComments.length;

    for (const child of childComments) {
      totalChildren += await countChildComments(child.comment_id, groupId);
    }

    return totalChildren;
  } catch (err) {
    console.error('Error counting child comments:', err);
    return 0;
  }
}

// comment_order 최댓값 가져오기
async function getHighestOrder() {
  const maxOrder = await db.Comment.findOne({
    attributes: [
      [
        db.Sequelize.fn('MAX', db.Sequelize.col('comment_order')),
        'max_comment_order',
      ],
    ],
  });

  return maxOrder?.dataValues?.max_comment_order || 0;
}

// 댓글 순서 조정
async function arrangeOrder(maxOrder, baseComment, operation) {
  try {
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
    return updateCommentOrder;
  } catch (err) {
    console.error('Error arranging comment order:', err);
    return 0;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  getMaxCommentGroup,
  getColByCommentId,
  countChildComments,
  getHighestOrder,
  arrangeOrder,
};
