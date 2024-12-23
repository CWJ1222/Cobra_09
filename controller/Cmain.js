const { Op } = require('sequelize');
const { Category, Product, User, Order, Wishlists } = require('../models');

// GET '/' : 메인 페이지 렌더링
exports.main = (req, res) => {
  res.render('index', { title: '홈페이지', currentPage: 'home' });
};

// 사용하고 있지 않음 API -> 수정 필요
exports.purchase = (req, res) => {
  res.render('purchase', { title: '구매 페이지', currentPage: 'purchase' });
};

// 판매 페이지 -> 수정 필요
// POST '/host/register' : 공동구매 진행하고 싶은 물품 등록
exports.sell = (req, res) => {
  res.render('sell', { title: '판매 페이지', currentPage: 'sell' });
};

// 세션이 있는지를 검증
exports.isSessionValid = (req, res, next) => {
  if (req.session.user) {
    // 인증된 유저인 경우
    console.log(req.session.user);
    next();
  } else {
    console.log(req.session.user);
    console.log('error');
  }
};

// PUT /user -> 내 정보 수정 API
// exports.postChangeUser = async (req, res) => {
//   try {
//     const user = req.session.user.user_pk;
//     const change_email = 'change@naer.com'; // 임시 이메일 (클라이언트에서 받아오는 것)
//     const change_nickname = 'change'; // 임시 닉네임 (클라이언트에서 받아오는 것)

//     const result_change = await User.update(
//       {
//         nickname: change_nickname,
//         password: change_password,
//       },
//       {
//         where: {
//           user_id: user,
//         },
//       }
//     );
//     // 성공하면 1로 받아옴!
//     if (result_change[0] > 0) {
//       res.status(200).send({ isSuccess: true });
//     } else {
//       res.status(200).send({ isSuccess: false });
//     }
//   } catch (err) {
//     console.log('err', err);
//     res.status(200).send({ isSuccess: false });
//   }
// };
const crypto = require('crypto'); // 암호화를 위한 crypto 모듈

// 비밀번호 암호화 함수
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex'); // 랜덤 salt 생성
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex'); // 해시 생성
  return { salt, hash };
}
exports.postChangeUser = async (req, res) => {
  try {
    const userId = req.session.user.user_pk; // 세션에서 사용자 ID 가져오기
    const { nickname, password } = req.body; // 클라이언트에서 닉네임과 비밀번호 받기

    // 유효성 검사: 입력된 값이 없으면 실패 응답
    if (!nickname && !password) {
      return res.status(400).send({
        isSuccess: false,
        message: '닉네임 또는 비밀번호 중 하나를 입력해주세요.',
      });
    }

    const updateData = {};

    // 닉네임이 입력된 경우 업데이트 데이터에 추가
    if (nickname) {
      updateData.nickname = nickname;
    }

    // 비밀번호가 입력된 경우 암호화 후 업데이트 데이터에 추가
    if (password) {
      const { salt, hash } = hashPassword(password);
      updateData.password = hash;
      updateData.salt = salt;
    }

    // 데이터베이스 업데이트
    const updateResult = await User.update(updateData, {
      where: { user_id: userId },
    });

    // 업데이트 결과 확인
    if (updateResult[0] > 0) {
      return res.status(200).send({
        isSuccess: true,
        message: '정보가 성공적으로 수정되었습니다.',
      });
    } else {
      return res
        .status(400)
        .send({ isSuccess: false, message: '정보 수정에 실패했습니다.' });
    }
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    return res
      .status(500)
      .send({ isSuccess: false, message: '서버 오류가 발생했습니다.' });
  }
};

// GET '/host/lists' -> 내가 주선한 공동구매 물품 보여주는 API
exports.getMyProducts = async (req, res) => {
  try {
    console.log(req.session.user);
    const target = req.session.user.user_pk;

    const products = await Product.findAll({
      where: { user_id: target },
      attributes: ['name', 'deadline', 'max_quantity'],
    });
    res.status(200).send({ isSuccess: true, products });
  } catch (err) {
    console.log('err', err);
    res.status(500).send({
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// GET '/join' -> 내가 구매한 물품 모두 보여주는 API
exports.getMyJoins = async (req, res) => {
  try {
    const target = req.session.user.user_pk;
    const orders = await Order.findAll({
      where: { user_id: target },
      attributes: ['quantity'],
      include: [{ model: Product, attributes: ['name', 'user_id'] }],
    });
    res.status(200).send({ isSuccess: true, orders });
  } catch (err) {
    console.log('err', err);
    res.status(500).send({
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// /user
// exports.getAllUser = async (req, res) => {
//   try {
//     // const target = req.session.user.user_pk;
//     const target = 1;
//     const user = await User.findOne({
//       where: { user_id: target },
//       attributes: ['password', 'nickname', 'email'],
//     });
//     res.status(200).render('mypage', { isSuccess: true, user });
//   } catch (err) {
//     console.log('err', err);
//     res.status(500).render('mypage', {
//       isSuccess: false,
//       message: '서버 오류가 발생했습니다.',
//     });
//   }
// };

exports.renderMypage = async (req, res) => {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = req.session.user ? req.session.user.user_pk : null;

    if (!userId) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      return res.redirect('/auth/login');
    }

    // 데이터베이스에서 사용자 정보 조회
    const target = req.session.user.user_pk;
    const user = await User.findOne({
      where: { user_id: target },
      attributes: ['email', 'nickname'], // 필요한 필드만 선택
    });
    if (!user) {
      return res.status(404).send('사용자를 찾을 수 없습니다.');
    }

    // mypage.ejs로 사용자 정보 전달
    res.render('mypage', { user });
  } catch (error) {
    console.error('마이페이지 렌더링 오류:', error);
    res.status(500).send('서버 오류');
  }
};

// 특정 하나의 판매 물품만 가져옴 - GET /host/list/:id
exports.getProduct = async (req, res) => {
  try {
    const product_id = 1; // 임시 product_id
    const product = await Product.findOne({
      where: { product_key: product_id },
      attributes: [
        'name',
        'deadline',
        'price',
        'user_id',
        'max_quantity',
        'image',
        'category_id',
      ],
    });
    res.status(200).send({ isSuccess: true, product });
  } catch (err) {
    console.log('err', err);
    res.status(200).send({ isSuccess: false });
  }
};

// DELETE '/delete' 회원 탈퇴 (아예 삭제)
// exports.deleteMyUser = async (req, res) => {
//   try {
//     // user_id 가져옴
//     const target = req.session.user.user_pk;
//     const deleteresult = await User.destroy({
//       where: { user_id: target },
//     });

//     if (deleteresult === 0) {
//       return res.status(404).send({
//         isSuccess: false,
//         message: '해당 사용자를 찾을 수 없습니다.',
//       });
//     }
//     res.status(200).send({ isSuccess: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: '서버 오류가 발생했습니다.' });
//   }
// };
exports.deleteMyUser = async (req, res) => {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = req.session.user ? req.session.user.user_pk : null;

    if (!userId) {
      return res.status(400).send({
        isSuccess: false,
        message: '로그인된 사용자가 없습니다.',
      });
    }

    // 사용자 삭제
    const deleteResult = await User.destroy({
      where: { user_id: userId },
    });

    if (deleteResult === 0) {
      return res.status(404).send({
        isSuccess: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        console.error('세션 삭제 중 오류:', err);
        return res.status(500).send({
          isSuccess: false,
          message: '서버 오류가 발생했습니다.',
        });
      }
      res.clearCookie('connect.sid'); // 세션 쿠키 제거
      res.status(200).send({ isSuccess: true });
    });
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    res.status(500).send({
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// POST '/wishlist/:product_key' 찜하기 기능
exports.postWishlists = async (req, res) => {
  try {
    // const userId = req.session.user_pk;
    const userId = 2; // 임시
    const productKey = 2; // 임시

    // db에서 상태 확인
    const wishlist = await Wishlists.findOne({
      where: { user_id: userId, product_key: productKey },
    });

    if (wishlist) {
      // 위시 리스트에서 삭제
      await wishlist.destroy();
      return res.status(200).send({
        isSuccess: true,
        message: '위시 리스트에서 삭제되었습니다.',
      });
    } else {
      await Wishlists.create({
        user_id: userId,
        product_key: productKey,
      });
      return res.status(200).send({
        isSuccess: true,
        message: '위시 리스트에 추가되었습니다.',
      });
    }
  } catch (error) {
    console.log('err', error);
    return res
      .status(500)
      .send({ isSuccess: false, message: '서버 오류가 발생했습니다.' });
  }
};

// GET /wishlist/my : 마이페이지에서 찜한 상품 가져오기
exports.getWishlists = async (req, res) => {
  try {
    // user_id 가져오기
    // const target = req.session.user.user_pk;
    // 임시 user_id
    const target = 2;
    // user_id에 해당하는 모든 찜한 상품 가져오기
    const wishlists = await Wishlists.findAll({
      where: { user_id: target },
      attributes: ['product_key'],
    });
    // 만약에 찜한 상품이 없다면
    if (wishlists.length === 0) {
      return res.status(404).send({
        isSuccess: true,
        message: '찜한 상품이 없습니다.',
        data: [],
      });
    }
    // 찜한 상품이 있다면
    const productkeys = wishlists.map((wishlist) => wishlist.product_key);

    // product 테이블에서 해당하는 상품 조회
    const products = await Product.findAll({
      where: {
        product_key: productkeys,
      },
    });
    return res.status(200).send({
      isSuccess: true,
      message: '찜한 상품이 있습니다.',
      data: products,
    });
  } catch (error) {
    console.log('err', error);
    res.status(500)({ isSuccess: false, massage: '서버 오류가 발생했습니다.' });
  }
};
