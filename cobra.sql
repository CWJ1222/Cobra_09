/*
- notion의 DB정리 페이지 참고
- .env 파일에 mysql 연결 정보 개인에 따라 수정 필요
*/
create database cobra09; -- cobra09 데이터베이스 생성

use cobra09; -- cobra09 데이터베이스 사용

-- Category 테이블 생성
CREATE TABLE Category (
    category_id INT PRIMARY KEY, -- 카테고리 ID (Primary Key)
    category_name VARCHAR(255) NOT NULL -- 카테고리 이름
);

-- User 테이블 생성
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY, -- 사용자 ID (Primary Key)
    email VARCHAR(255) NOT NULL,            -- 사용자 이메일
    password VARCHAR(255) NOT NULL,         -- 비밀번호 (해시 저장)
    nickname VARCHAR(255) NOT NULL,         -- 사용자 닉네임
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 생성일
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- 수정일
);

-- Product 테이블 생성
CREATE TABLE Product (
    product_key INT AUTO_INCREMENT PRIMARY KEY,  -- 판매 물품 ID (Primary Key)
    name VARCHAR(255) NOT NULL,                 -- 물품 이름
    deadline DATE NOT NULL,                     -- 판매 마감 기한
    price INT NOT NULL,                         -- 판매 가격
    max_quantity INT NOT NULL,                  -- 판매 가능 최대 수량
    image VARCHAR(255) NOT NULL,                -- 물품 이미지 경로
    category_id INT NOT NULL,                   -- 카테고리 ID (Foreign Key)
    host_id INT NOT NULL,                       -- 주선자 사용자 ID (Foreign Key)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 생성일
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 수정일
    FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE CASCADE, -- 카테고리 참조
    FOREIGN KEY (host_id) REFERENCES User(user_id) ON DELETE CASCADE -- 주선자 참조
);
-- Order_item 테이블 생성
CREATE TABLE Order_item (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY, -- 주문 아이템 ID (Primary Key)
    product_key INT NOT NULL,                      -- 주문한 물품 ID (Foreign Key)
    user_id INT NOT NULL,                         -- 주문자 사용자 ID (Foreign Key)
    quantity INT NOT NULL,                        -- 주문 수량
    address VARCHAR(255) NOT NULL,                -- 주문자 주소
    phone VARCHAR(20) NOT NULL,                   -- 주문자 전화번호
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 생성일
    FOREIGN KEY (product_key) REFERENCES Product(product_key) ON DELETE CASCADE, -- 물품 참조
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE -- 사용자 참조
);

-- 테이블 잘 만들어졌는지 확인
DESC category;
DESC user;
DESC product;
DESC order_item;


-- 테스트를 위해 테이블에 데이터 삽입
/*
- 순서 중요!
- 외래키 관계에따라 올바르게 데이터를 삽입하는 것이 중요하다.
*/

-- category 테이블에 데이터 삽입
INSERT INTO Category (category_id, category_name) VALUES
(1, 'Electronics'),
(2, 'Foods'),
(3, 'Books');

-- user 테이블에 데이터 삽입
INSERT INTO User (email, password, nickname) VALUES
('soo@naver.com', "1234", "soo"),
('jin@naver.com', '5678', "jin");

-- product 테이블에 데이터 삽입
INSERT INTO Product (name, deadline, price, max_quantity, image, category_id, host_id)
VALUES
('Smartphone', '2024-12-31', 999, 100, '/images/smartphone.jpg', 1, 1),
('T-Shirt', '2024-12-25', 19, 200, '/images/tshirt.jpg', 2, 2),
('Novel', '2024-12-20', 10, 50, '/images/novel.jpg', 3, 1);

-- order_item 테이블에 데이터 삽입
INSERT INTO Order_item (
    order_item_id, 
    product_key, 
    user_id, 
    quantity, 
    address, 
    phone
) VALUES
(1, 1, 1, 2, '123 Main St, Seoul', '010-1234-5678'),
(2, 2, 2, 1, '456 Elm St, Busan', '010-5678-1234');

-- 테이블에 다 데이터 담겨있는지 확인
SELECT * FROM category;
SELECT * FROM user;
SELECT * FROM product;
SELECT * FROM order_item;
