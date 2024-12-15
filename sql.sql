-- Active: 1733113221858@@127.0.0.1@3306@sesac
show DATABASES;
USE SESAC;
CREATE TABLE visitor(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(10) NOT NULL,
    comment MEDIUMTEXT
);


DESC visitor;
show tables;
-- data 삽입
INSERT INTO visitor(name, comment) VALUES('홍길동','내가 왔따');
INSERT INTO visitor VALUES(null, '이찬혁','으라차차');
INSERT INTO visitor VALUES(null, '삭제예정','으라차차');

-- data 조회
SELECT * FROM visitor;

-- data 수정
UPDATE visitor SET comment="야호~~!" WHERE id=2;

-- data 삭제
DELETE FROM visitor WHERE id=3;

############# DCL 
-- MySQL 사용자 생성
CREATE USER 'sesac'@'%' IDENTIFIED BY '1234';

-- 권한 부여
GRANT ALL PRIVILEGES ON *.* TO 'sesac'@'%' WITH GRANT OPTION;

ALTER USER 'sesac'@'%' IDENTIFIED WITH mysql_native_password BY '1234';
FLUSH PRIVILEGES;

SELECT * FROM mysql.user;

show GRANTS for 'sesac'@'%';