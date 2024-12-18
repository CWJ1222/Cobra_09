-- Active: 1732688614523@@127.0.0.1@3306@cobra
use cobra;

show tables;

DESC order_item;
DESC product;
SHOW CREATE TABLE Order_item;

INSERT INTO Category (category_id, category_name) VALUES
(1, 'Electronics'),
(2, 'Foods'),
(3, 'Books');

INSERT INTO User (email, password, nickname) VALUES
('soo@naver.com', "1234", "soo"),
('jin@naver.com', '5678', "jin");

INSERT INTO Product (name, deadline, price, max_quantity, image, category_id, host_id)
VALUES
('Smartphone', '2024-12-31', 999, 100, '/images/smartphone.jpg', 1, 1),
('T-Shirt', '2024-12-25', 19, 200, '/images/tshirt.jpg', 2, 2),
('Novel', '2024-12-20', 10, 50, '/images/novel.jpg', 3, 1);


SELECT * FROM user;
select * from product;

INSERT INTO Order_item (
    order_item_id, 
    product_id, 
    user_id, 
    quantity, 
    address, 
    phone
) VALUES
(1, 1, 1, 2, '123 Main St, Seoul', '010-1234-5678'), -- 첫 번째 주문
(2, 2, 2, 1, '456 Elm St, Busan', '010-5678-1234');

select * from order_item;
desc Order_item;
desc product;
SELECT * FROM product;
select * from product;

show grants for 'soo'@'%'; -- 권한 확인!