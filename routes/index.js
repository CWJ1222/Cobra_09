const express = require('express');
const controller = require('../controller/Cmain');
const router = express.Router();

// GET, main : 메인 페이지 렌더링
router.get('/', controller.main);

// router.get('/purchaseTest', controller.purchasepage); // 구매 페이지 purchase로 따로 만듬

// 확인 필요
router.get('/sell', controller.sell);

// GET, getMyProducts : 내가 주선한 공동구매 물품 가져오기
router.get('/host/lists', controller.getMyProducts);

// GET, getMyJoins : 내가 구매한 물품 모두 가져오기
router.get('/join', controller.getMyJoins);

// GET, getProduct : 특정 하나의 판매 물품만 가져오기
router.get('/host/list/:product_key', controller.getProduct);
// router.get('/user/mypage', controller.getAllUser);

// 마이페이지 렌더링
router.get('/user/mypage', controller.renderMypage);

// 단일 상품 조회
router.get('/join/list', controller.getMyAllJoins);

// PUT, postChangeUser : 내 정보 수정
router.put('/user', controller.postChangeUser);

// DELETE, deleteMyUser : 탈퇴하기
router.delete('/delete', controller.deleteMyUser);

// POST, postWishlists : 찜하기 기능
router.post('/wishlist/:product_key', controller.postWishlists);

// GET, getWishlists : 내가 찜한 상품 가져오기
router.get('/wishlist/my', controller.getWishlists);
module.exports = router;
