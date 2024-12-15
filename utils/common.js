// jsdocs
const crypto = require('crypto');
const constant = require('./constant.js');
/**
 * 서버 에러시 응답 및 로그를 처리해주는 함수
 * @param {Response} res 응답객체
 * @param {Error} err
 * @param {string} msg
 * @returns {void}
 *
 *  * 회원가입시 비밀번호 암호화를 해주는 함수
 * @param {string} registerPw
 * @returns {{encryptedPw, salt}} 암호화된 비밀번호, 솔트
 *
 *  * boolean 로그인시 입력된 비밀번호와 DB의 비밀번호를 비교해주는 함수
 * @param {string} inputPw 입력 비밀번호
 * @param {string} savedSalt DB에 저장된 salt
 * @param {string} savedPw DB에 저장된 비밀번호
 * @returns {boolean} 비밀번호 일치 여부(true/false)
 */
function error_log(res, err, msg = 'server error') {
  console.log(msg, err);
  res.status(500).render('500');
}

function encrypt_pw(registerPw) {
  const salt = crypto.randomBytes(16).toString('base64');
  const iterations = constant.ENCRYPT_ITERATIONS;
  const keylens = constant.ENCRYPT_KEYLEN;
  const algorithm = constant.ENCRYPT_ALGORITHM;

  const encryptedPw = crypto.pbkdf2Sync(
    registerPw,
    salt,
    iterations,
    keylens,
    algorithm
  );

  return { encryptedPw, salt };
}

function check_pw(inputPw, savedSalt, savedPw) {
  const iterations = constant.ENCRYPT_ITERATIONS;
  const keylens = constant.ENCRYPT_KEYLEN;
  const algorithm = constant.ENCRYPT_ALGORITHM;

  const encryptedInput = crypto.pbkdf2Sync(
    inputPw,
    savedSalt,
    iterations,
    keylens,
    algorithm
  );

  return encryptedInput === savedPw;
}

module.exports = {
  error_log,
  encrypt_pw,
  check_pw,
};
