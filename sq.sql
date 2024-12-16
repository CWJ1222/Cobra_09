-- Active: 1732688614523@@127.0.0.1@3306@cobra
use cobra;

show tables;

DESC order_item;
DESC product;
SHOW CREATE TABLE Order_item;




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
(1, 7, 1, 2, '123 Main St, Seoul', '010-1234-5678'), -- 첫 번째 주문
(2, 8, 2, 1, '456 Elm St, Busan', '010-5678-1234');

select * from order_item;
desc Order_item;
desc product;
SELECT * FROM product;
select * from product;

show grants for 'soo'@'%'; -- 권한 확인!