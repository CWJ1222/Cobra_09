// TODO: 라우트 설정
const express = require("express");
const router = express.Router();
const controller = require("../controller/Cuser");

// GET /user, 메인페이지 요청 [필요없음, 삭제]
router.get("/", controller.main);

// GET /user/signup, 회원가입 페이지 요청
router.get("/signup", controller.get_signup);
// GET /user/signin, 로그인 페이지 요청
router.get("/signin", controller.get_signin);

// ------- POST
// POST /user/signup,
// 회원가입 요청 (id 중복 등 신경쓰지 않고 DB에 input 값 넣기)
router.post("/signup", controller.post_signup);

// // POST /user/signin
// // 로그인 1. 로그인 가능한 계정인지 아닌지만 비교
router.post("/signin", controller.post_signin);

// // POST /user/profile, 로그인 버튼 클릭시 요청되는 form 전송
// // 로그인 2. 로그인 가능한 회원이라면, 회원 정보 수정 페이지 render 시켜주기
router.post("/profile", controller.post_profile);

// // POST /user/profile/edit (POST 대신 PATCH 사용 가능)
// // 회원 정보 수정 요청
router.post("/profile/edit", controller.edit_profile);

// // POST /user/profile/delete (POST 대신 DELETE 사용 가능)
// // 회원 탈퇴 요청
router.post("/profile/delete", controller.delete_profile);

// 기존 회원 정보 수정 삭제 등록
// 어차피 body 정보로 넘어오기 때문에 patch나 delete 아니고
// POST 로도 가능

module.exports = router;
