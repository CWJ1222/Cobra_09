-- Active: 1732688614523@@127.0.0.1@3306@sesac

DROP DATABASE osh;
CREATE DATABASE cobra default CHARACTER SET utf8  default COLLATE utf8_general_ci;
show DATABASES;
show tables;

insert into user VALUES(null, "qqq", "123", "소고기",'2024-12-16 12:00:00', '2024-12-16 12:00:00');
select * from user;
use cobra;

create USER "osh"@"%" IDENTIFIED BY "1234"

GRANT ALL PRIVILEGES ON *.* TO 'osh'@'%' WITH GRANT OPTION;

FLUSH PRIVILEGES;

SELECT * FROM mysql.user;




###############################
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

desc user;
INSERT INTO Category (category_id, category_name) VALUES
(1, 'Electronics'),
(2, 'Foods'),
(3, 'Books');

INSERT INTO User (email, password, nickname,createdAt, updatedAt ) VALUES
('soo@naver.com', "1234", "soo" ,'2024-12-16 12:00:00', '2024-12-16 12:00:00'),
('jin@naver.com', '5678', "jin",'2024-12-16 12:00:00', '2024-12-16 12:00:00');

INSERT INTO Product (name, deadline, price, max_quantity, image, category_id, host_id)
VALUES
('Smartphone', '2024-12-31', 999, 100, '/images/smartphone.jpg', 1, 1),
('T-Shirt', '2024-12-25', 19, 200, '/images/tshirt.jpg', 2, 2),
('Novel', '2024-12-20', 10, 50, '/images/novel.jpg', 3, 1);

desc Product;

SELECT * from Product;

alter table Product modify COLUMN name VARCHAR(255)