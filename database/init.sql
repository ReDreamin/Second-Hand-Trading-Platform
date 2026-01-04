CREATE TABLE user_accounts (
  id BIGSERIAL PRIMARY KEY,

  username VARCHAR(64) UNIQUE,
  email VARCHAR(128) UNIQUE,
  phone VARCHAR(32) UNIQUE,

  password_hash TEXT NOT NULL,      -- 永远不存明文
  password_algo VARCHAR(32),         -- bcrypt / argon2

  status SMALLINT NOT NULL DEFAULT 1,
  -- 1: normal, 0: disabled, -1: deleted

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES user_accounts(id),

  nickname VARCHAR(64),
  avatar_url TEXT,
  gender SMALLINT,
  birthday DATE,
  bio TEXT,

  updated_at TIMESTAMP DEFAULT now()
);

-- ===================== 商品相关表 =====================

-- 商品分类表
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    parent_id INT REFERENCES categories(id),
    icon VARCHAR(128),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- 商品表
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL REFERENCES user_accounts(id),

    title VARCHAR(128) NOT NULL,
    cover_url TEXT NOT NULL,
    description TEXT,

    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),

    category_id INT REFERENCES categories(id),
    condition SMALLINT NOT NULL DEFAULT 9,
    -- 成色: 10=全新, 9=几乎全新, 8=轻微使用痕迹, 7=正常使用痕迹, 5=明显使用痕迹

    status SMALLINT NOT NULL DEFAULT 1,
    -- 状态: 1=上架中, 0=已下架, 2=已售出, -1=已删除

    location VARCHAR(128),
    view_count INT DEFAULT 0,

    -- 全文搜索字段
    search_text TEXT,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 商品图片表 (描述中的图片)
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- 索引
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);

-- 全文搜索索引 (使用 pg_trgm 扩展实现模糊搜索)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_search ON products USING gin(search_text gin_trgm_ops);

-- ===================== 订单相关表 =====================

-- 订单表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE,      -- 订单号

    product_id BIGINT NOT NULL REFERENCES products(id),
    buyer_id BIGINT NOT NULL REFERENCES user_accounts(id),
    seller_id BIGINT NOT NULL REFERENCES user_accounts(id),

    -- 商品快照（下单时记录，防止商品信息变更影响订单）
    product_title VARCHAR(128) NOT NULL,
    product_image TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,

    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,

    status SMALLINT NOT NULL DEFAULT 0,
    -- 状态: 0=待支付(pending), 1=已支付(paid), 2=已发货(shipped), 3=已完成(completed), -1=已取消(cancelled)

    -- 时间记录
    created_at TIMESTAMP DEFAULT now(),
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,

    -- 备注
    buyer_remark TEXT,
    seller_remark TEXT
);

-- 订单索引
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_order_no ON orders(order_no);

-- 初始化分类数据
INSERT INTO categories (name, parent_id, icon, sort_order) VALUES
('数码电子', NULL, 'laptop', 1),
('服饰鞋包', NULL, 'shirt', 2),
('图书教材', NULL, 'book', 3),
('生活用品', NULL, 'home', 4),
('美妆护肤', NULL, 'gift', 5),
('运动户外', NULL, 'basketball', 6),
('游戏娱乐', NULL, 'gamepad', 7),
('其他', NULL, 'more', 99);

-- 数码电子子分类
INSERT INTO categories (name, parent_id, icon, sort_order) VALUES
('手机', 1, NULL, 1),
('电脑', 1, NULL, 2),
('平板', 1, NULL, 3),
('相机', 1, NULL, 4),
('耳机音箱', 1, NULL, 5),
('其他数码', 1, NULL, 99);


-- 自动生成的模拟商品数据
-- 生成时间: 2025-12-28 04:46:10

-- 确保有测试用户 (seller_id = 1)
INSERT INTO user_accounts (id, username, email, password_hash, password_algo, status)
VALUES (1, 'test_seller', 'seller@test.com', '$argon2id$v=19$m=65536,t=3,p=1$test', 'argon2', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (user_id, nickname)
VALUES (1, '测试卖家')
ON CONFLICT (user_id) DO NOTHING;

-- 商品数据
INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '飞利浦电动牙刷', '/uploads/product_001.jpg', '这是一款飞利浦电动牙刷，购入三个月，配件齐全。

【商品详情】
- 品牌/型号：牙刷
- 购买渠道：朋友赠送
- 购买时间：2025年11月
- 使用频率：使用次数不超过10次

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
不太适合自己，转给有缘人

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 353.0, 388.36, 5, 7, 1, '武汉', 175, '飞利浦电动牙刷 这是一款飞利浦电动牙刷，购入三个月，配件齐全。

【商品详情】
- 品牌/型号：牙刷
- 购买渠道：朋友赠送
- 购买时间：2025年11月
- 使用频率：使用次数不超过10次

【商品状态】
几乎全', NOW() - INTERVAL '15 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '华为 MatePad Pro 12.6', '/uploads/product_002.jpg', '这是一款华为 MatePad Pro 12.6，购入两年，几乎全新。

【商品详情】
- 品牌/型号：平板
- 购买渠道：朋友赠送
- 购买时间：2025年05月
- 使用频率：每天使用

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

可提供购买凭证，支持验货。
', 3754.98, 4780.92, 1, 7, 1, '苏州', 224, '华为 MatePad Pro 12.6 这是一款华为 MatePad Pro 12.6，购入两年，几乎全新。

【商品详情】
- 品牌/型号：平板
- 购买渠道：朋友赠送
- 购买时间：2025年05月
- 使用频率：每天使用

【商品状态', NOW() - INTERVAL '2 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'MacBook Pro 14寸 M2芯片', '/uploads/product_003.jpg', '这是一款MacBook Pro 14寸 M2芯片，购入一个月，几乎全新。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：海外代购
- 购买时间：2024年05月
- 使用频率：每周使用1-2次

【商品状态】
外观完好无划痕，功能一切正常，电池健康度95%以上。

【出售原因】
冲动消费买多了

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

可提供购买凭证，支持验货。
', 11380.19, 15359.71, 1, 8, 1, '南京', 61, 'MacBook Pro 14寸 M2芯片 这是一款MacBook Pro 14寸 M2芯片，购入一个月，几乎全新。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：海外代购
- 购买时间：2024年05月
- 使用频率：每周使用1-2次', NOW() - INTERVAL '21 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '雀巢咖啡机 Nespresso', '/uploads/product_004.jpg', '这是一款雀巢咖啡机 Nespresso，购入半年，配件齐全。

【商品详情】
- 品牌/型号：咖啡机
- 购买渠道：海外代购
- 购买时间：2025年01月
- 使用频率：每周使用1-2次

【商品状态】
有轻微使用痕迹，不影响使用，所有功能正常。

【出售原因】
冲动消费买多了

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

原装配件齐全，盒子说明书都在。
', 527.75, 773.28, 5, 7, 1, '南京', 404, '雀巢咖啡机 Nespresso 这是一款雀巢咖啡机 Nespresso，购入半年，配件齐全。

【商品详情】
- 品牌/型号：咖啡机
- 购买渠道：海外代购
- 购买时间：2025年01月
- 使用频率：每周使用1-2次

【商品状', NOW() - INTERVAL '2 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Python编程从入门到实践', '/uploads/product_005.jpg', '这是一款Python编程从入门到实践，购入半年，配件齐全。

【商品详情】
- 品牌/型号：编程
- 购买渠道：京东自营
- 购买时间：2024年08月
- 使用频率：每天使用

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
冲动消费买多了

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

送运费险，放心购买。
', 61.22, 69.37, 7, 8, 1, '武汉', 483, 'Python编程从入门到实践 这是一款Python编程从入门到实践，购入半年，配件齐全。

【商品详情】
- 品牌/型号：编程
- 购买渠道：京东自营
- 购买时间：2024年08月
- 使用频率：每天使用

【商品状态】
几乎全', NOW() - INTERVAL '6 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Decathlon 瑜伽垫 10mm', '/uploads/product_006.jpg', '这是一款Decathlon 瑜伽垫 10mm，购入半年，配件齐全。

【商品详情】
- 品牌/型号：瑜伽垫
- 购买渠道：海外代购
- 购买时间：2025年02月
- 使用频率：使用次数不超过10次

【商品状态】
成色如图所示，实物拍摄，所见即所得。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 71.96, 86.66, 6, 10, 1, '上海', 362, 'Decathlon 瑜伽垫 10mm 这是一款Decathlon 瑜伽垫 10mm，购入半年，配件齐全。

【商品详情】
- 品牌/型号：瑜伽垫
- 购买渠道：海外代购
- 购买时间：2025年02月
- 使用频率：使用次数不超过10次
', NOW() - INTERVAL '28 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Sony WH-1000XM4 降噪耳机', '/uploads/product_007.jpg', '这是一款Sony WH-1000XM4 降噪耳机，购入半年，配件齐全。

【商品详情】
- 品牌/型号：耳机
- 购买渠道：官网购买
- 购买时间：2025年06月
- 使用频率：每天使用

【商品状态】
外观完好无划痕，功能一切正常，电池健康度95%以上。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 1745.05, 2511.43, 1, 9, 1, '杭州', 290, 'Sony WH-1000XM4 降噪耳机 这是一款Sony WH-1000XM4 降噪耳机，购入半年，配件齐全。

【商品详情】
- 品牌/型号：耳机
- 购买渠道：官网购买
- 购买时间：2025年06月
- 使用频率：每天使用

【商品状', NOW() - INTERVAL '7 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'MacBook Pro 14寸 M2芯片', '/uploads/product_008.jpg', '这是一款MacBook Pro 14寸 M2芯片，购入两个月，轻微使用痕迹。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：朋友赠送
- 购买时间：2024年04月
- 使用频率：每周使用1-2次

【商品状态】
有轻微使用痕迹，不影响使用，所有功能正常。

【出售原因】
毕业清仓，低价处理

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 13621.38, 16498.98, 1, 9, 1, '南京', 383, 'MacBook Pro 14寸 M2芯片 这是一款MacBook Pro 14寸 M2芯片，购入两个月，轻微使用痕迹。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：朋友赠送
- 购买时间：2024年04月
- 使用频率：每周使用1-', NOW() - INTERVAL '21 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '线性代数同济第六版', '/uploads/product_009.jpg', '这是一款线性代数同济第六版，购入半年，正常使用。

【商品详情】
- 品牌/型号：教材
- 购买渠道：线下专卖店
- 购买时间：2024年06月
- 使用频率：偶尔使用

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
冲动消费买多了

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 23.51, 34.99, 7, 7, 1, '南京', 341, '线性代数同济第六版 这是一款线性代数同济第六版，购入半年，正常使用。

【商品详情】
- 品牌/型号：教材
- 购买渠道：线下专卖店
- 购买时间：2024年06月
- 使用频率：偶尔使用

【商品状态】
几乎全新，买来', NOW() - INTERVAL '21 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '戴尔 XPS 15 笔记本电脑', '/uploads/product_010.jpg', '这是一款戴尔 XPS 15 笔记本电脑，购入两个月，保存完好。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：天猫旗舰店
- 购买时间：2024年01月
- 使用频率：基本闲置

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

送运费险，放心购买。
', 8401.54, 11570.04, 1, 8, 1, '成都', 8, '戴尔 XPS 15 笔记本电脑 这是一款戴尔 XPS 15 笔记本电脑，购入两个月，保存完好。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：天猫旗舰店
- 购买时间：2024年01月
- 使用频率：基本闲置

【商品状态】', NOW() - INTERVAL '24 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '优衣库羽绒服男款', '/uploads/product_011.jpg', '这是一款优衣库羽绒服男款，购入几个星期，几乎全新。

【商品详情】
- 品牌/型号：羽绒服
- 购买渠道：朋友赠送
- 购买时间：2025年11月
- 使用频率：基本闲置

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
冲动消费买多了

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 208.12, 236.4, 2, 10, 1, '南京', 261, '优衣库羽绒服男款 这是一款优衣库羽绒服男款，购入几个星期，几乎全新。

【商品详情】
- 品牌/型号：羽绒服
- 购买渠道：朋友赠送
- 购买时间：2025年11月
- 使用频率：基本闲置

【商品状态】
几乎全新，买', NOW() - INTERVAL '27 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '李宁跑步机家用款', '/uploads/product_012.jpg', '这是一款李宁跑步机家用款，购入几个星期，正常使用。

【商品详情】
- 品牌/型号：跑步机
- 购买渠道：朋友赠送
- 购买时间：2024年03月
- 使用频率：每天使用

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
冲动消费买多了

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 2522.24, 3398.49, 6, 7, 1, '杭州', 222, '李宁跑步机家用款 这是一款李宁跑步机家用款，购入几个星期，正常使用。

【商品详情】
- 品牌/型号：跑步机
- 购买渠道：朋友赠送
- 购买时间：2024年03月
- 使用频率：每天使用

【商品状态】
几乎全新，买', NOW() - INTERVAL '15 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '考研政治肖秀荣1000题', '/uploads/product_013.jpg', '这是一款考研政治肖秀荣1000题，购入几个星期，正常使用。

【商品详情】
- 品牌/型号：考研
- 购买渠道：京东自营
- 购买时间：2024年12月
- 使用频率：每天使用

【商品状态】
有轻微使用痕迹，不影响使用，所有功能正常。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 32.07, 37.37, 7, 10, 1, '北京', 481, '考研政治肖秀荣1000题 这是一款考研政治肖秀荣1000题，购入几个星期，正常使用。

【商品详情】
- 品牌/型号：考研
- 购买渠道：京东自营
- 购买时间：2024年12月
- 使用频率：每天使用

【商品状态】
有轻微', NOW() - INTERVAL '1 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'AirPods Pro 2代', '/uploads/product_014.jpg', '这是一款AirPods Pro 2代，购入一年，正常使用。

【商品详情】
- 品牌/型号：耳机
- 购买渠道：海外代购
- 购买时间：2024年05月
- 使用频率：每天使用

【商品状态】
有轻微使用痕迹，不影响使用，所有功能正常。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

原装配件齐全，盒子说明书都在。
', 1590.46, 2139.06, 1, 10, 1, '广州', 287, 'AirPods Pro 2代 这是一款AirPods Pro 2代，购入一年，正常使用。

【商品详情】
- 品牌/型号：耳机
- 购买渠道：海外代购
- 购买时间：2024年05月
- 使用频率：每天使用

【商品状态】
有轻微', NOW() - INTERVAL '18 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'iPad Air 5代 64G', '/uploads/product_015.jpg', '这是一款iPad Air 5代 64G，购入一年半，正常使用。

【商品详情】
- 品牌/型号：平板
- 购买渠道：京东自营
- 购买时间：2025年04月
- 使用频率：使用次数不超过10次

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

送运费险，放心购买。
', 3553.93, 4510.52, 1, 8, 1, '苏州', 458, 'iPad Air 5代 64G 这是一款iPad Air 5代 64G，购入一年半，正常使用。

【商品详情】
- 品牌/型号：平板
- 购买渠道：京东自营
- 购买时间：2025年04月
- 使用频率：使用次数不超过10次

【商', NOW() - INTERVAL '9 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'AirPods Pro 2代', '/uploads/product_016.jpg', '这是一款AirPods Pro 2代，购入一年，配件齐全。

【商品详情】
- 品牌/型号：耳机
- 购买渠道：京东自营
- 购买时间：2024年01月
- 使用频率：每天使用

【商品状态】
外观完好无划痕，功能一切正常，电池健康度95%以上。

【出售原因】
不太适合自己，转给有缘人

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 1379.39, 1986.07, 1, 7, 1, '西安', 478, 'AirPods Pro 2代 这是一款AirPods Pro 2代，购入一年，配件齐全。

【商品详情】
- 品牌/型号：耳机
- 购买渠道：京东自营
- 购买时间：2024年01月
- 使用频率：每天使用

【商品状态】
外观完', NOW() - INTERVAL '20 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '李宁跑步机家用款', '/uploads/product_017.jpg', '这是一款李宁跑步机家用款，购入一年半，几乎全新。

【商品详情】
- 品牌/型号：跑步机
- 购买渠道：京东自营
- 购买时间：2024年06月
- 使用频率：基本闲置

【商品状态】
有轻微使用痕迹，不影响使用，所有功能正常。

【出售原因】
不太适合自己，转给有缘人

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 2955.99, 3488.33, 6, 9, 1, '广州', 286, '李宁跑步机家用款 这是一款李宁跑步机家用款，购入一年半，几乎全新。

【商品详情】
- 品牌/型号：跑步机
- 购买渠道：京东自营
- 购买时间：2024年06月
- 使用频率：基本闲置

【商品状态】
有轻微使用痕迹', NOW() - INTERVAL '14 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '算法导论 第三版', '/uploads/product_018.jpg', '这是一款算法导论 第三版，购入三个月，轻微使用痕迹。

【商品详情】
- 品牌/型号：编程
- 购买渠道：官网购买
- 购买时间：2025年02月
- 使用频率：使用次数不超过10次

【商品状态】
有轻微使用痕迹，不影响使用，所有功能正常。

【出售原因】
换了新的，旧的闲置

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

原装配件齐全，盒子说明书都在。
', 117.05, 130.28, 7, 8, 1, '武汉', 350, '算法导论 第三版 这是一款算法导论 第三版，购入三个月，轻微使用痕迹。

【商品详情】
- 品牌/型号：编程
- 购买渠道：官网购买
- 购买时间：2025年02月
- 使用频率：使用次数不超过10次

【商品状态】
', NOW() - INTERVAL '17 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'KEEP智能哑铃', '/uploads/product_019.jpg', '这是一款KEEP智能哑铃，购入三个月，功能完好。

【商品详情】
- 品牌/型号：哑铃
- 购买渠道：海外代购
- 购买时间：2025年04月
- 使用频率：使用次数不超过10次

【商品状态】
外观完好无划痕，功能一切正常，电池健康度95%以上。

【出售原因】
不太适合自己，转给有缘人

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 552.58, 763.61, 6, 10, 1, '北京', 331, 'KEEP智能哑铃 这是一款KEEP智能哑铃，购入三个月，功能完好。

【商品详情】
- 品牌/型号：哑铃
- 购买渠道：海外代购
- 购买时间：2025年04月
- 使用频率：使用次数不超过10次

【商品状态】
外观', NOW() - INTERVAL '15 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Yonex 羽毛球拍 弓箭11', '/uploads/product_020.jpg', '这是一款Yonex 羽毛球拍 弓箭11，购入一年，几乎全新。

【商品详情】
- 品牌/型号：羽毛球拍
- 购买渠道：官网购买
- 购买时间：2024年08月
- 使用频率：每周使用1-2次

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

送运费险，放心购买。
', 1339.96, 1865.99, 6, 10, 1, '杭州', 73, 'Yonex 羽毛球拍 弓箭11 这是一款Yonex 羽毛球拍 弓箭11，购入一年，几乎全新。

【商品详情】
- 品牌/型号：羽毛球拍
- 购买渠道：官网购买
- 购买时间：2024年08月
- 使用频率：每周使用1-2次

【商品', NOW() - INTERVAL '7 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '戴尔 XPS 15 笔记本电脑', '/uploads/product_021.jpg', '这是一款戴尔 XPS 15 笔记本电脑，购入一年半，功能完好。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：天猫旗舰店
- 购买时间：2025年01月
- 使用频率：每天使用

【商品状态】
成色如图所示，实物拍摄，所见即所得。

【出售原因】
毕业清仓，低价处理

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

送运费险，放心购买。
', 6836.63, 8499.38, 1, 10, 1, '西安', 269, '戴尔 XPS 15 笔记本电脑 这是一款戴尔 XPS 15 笔记本电脑，购入一年半，功能完好。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：天猫旗舰店
- 购买时间：2025年01月
- 使用频率：每天使用

【商品状态】', NOW() - INTERVAL '24 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Adidas Ultraboost 跑步鞋', '/uploads/product_022.jpg', '这是一款Adidas Ultraboost 跑步鞋，购入三个月，配件齐全。

【商品详情】
- 品牌/型号：跑鞋
- 购买渠道：线下专卖店
- 购买时间：2025年04月
- 使用频率：偶尔使用

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 638.81, 822.17, 3, 10, 1, '北京', 55, 'Adidas Ultraboost 跑步鞋 这是一款Adidas Ultraboost 跑步鞋，购入三个月，配件齐全。

【商品详情】
- 品牌/型号：跑鞋
- 购买渠道：线下专卖店
- 购买时间：2025年04月
- 使用频率：偶尔使用

【', NOW() - INTERVAL '27 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '宜家KALLAX书架', '/uploads/product_023.jpg', '这是一款宜家KALLAX书架，购入三个月，正常使用。

【商品详情】
- 品牌/型号：书架
- 购买渠道：线下专卖店
- 购买时间：2025年02月
- 使用频率：每周使用1-2次

【商品状态】
成色如图所示，实物拍摄，所见即所得。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 251.2, 321.76, 5, 8, 1, '南京', 86, '宜家KALLAX书架 这是一款宜家KALLAX书架，购入三个月，正常使用。

【商品详情】
- 品牌/型号：书架
- 购买渠道：线下专卖店
- 购买时间：2025年02月
- 使用频率：每周使用1-2次

【商品状态】
成', NOW() - INTERVAL '5 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '高等数学同济第七版', '/uploads/product_024.jpg', '这是一款高等数学同济第七版，购入两个月，功能完好。

【商品详情】
- 品牌/型号：教材
- 购买渠道：天猫旗舰店
- 购买时间：2025年10月
- 使用频率：每周使用1-2次

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
毕业清仓，低价处理

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 28.83, 33.22, 7, 7, 1, '南京', 77, '高等数学同济第七版 这是一款高等数学同济第七版，购入两个月，功能完好。

【商品详情】
- 品牌/型号：教材
- 购买渠道：天猫旗舰店
- 购买时间：2025年10月
- 使用频率：每周使用1-2次

【商品状态】
正常', NOW() - INTERVAL '5 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Coach 托特包 真皮', '/uploads/product_025.jpg', '这是一款Coach 托特包 真皮，购入一年半，配件齐全。

【商品详情】
- 品牌/型号：包包
- 购买渠道：线下专卖店
- 购买时间：2024年01月
- 使用频率：基本闲置

【商品状态】
有轻微使用痕迹，不影响使用，所有功能正常。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

原装配件齐全，盒子说明书都在。
', 1242.96, 1495.13, 2, 10, 1, '南京', 421, 'Coach 托特包 真皮 这是一款Coach 托特包 真皮，购入一年半，配件齐全。

【商品详情】
- 品牌/型号：包包
- 购买渠道：线下专卖店
- 购买时间：2024年01月
- 使用频率：基本闲置

【商品状态】
有轻微', NOW() - INTERVAL '10 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '北面冲锋衣 Gore-Tex', '/uploads/product_026.jpg', '这是一款北面冲锋衣 Gore-Tex，购入一年半，保存完好。

【商品详情】
- 品牌/型号：冲锋衣
- 购买渠道：京东自营
- 购买时间：2024年08月
- 使用频率：每天使用

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
不太适合自己，转给有缘人

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 1007.56, 1318.93, 2, 9, 1, '西安', 93, '北面冲锋衣 Gore-Tex 这是一款北面冲锋衣 Gore-Tex，购入一年半，保存完好。

【商品详情】
- 品牌/型号：冲锋衣
- 购买渠道：京东自营
- 购买时间：2024年08月
- 使用频率：每天使用

【商品状态】
几', NOW() - INTERVAL '16 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '算法导论 第三版', '/uploads/product_027.jpg', '这是一款算法导论 第三版，购入两个月，配件齐全。

【商品详情】
- 品牌/型号：编程
- 购买渠道：天猫旗舰店
- 购买时间：2025年07月
- 使用频率：基本闲置

【商品状态】
外观完好无划痕，功能一切正常，电池健康度95%以上。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 117.86, 163.21, 7, 7, 1, '广州', 190, '算法导论 第三版 这是一款算法导论 第三版，购入两个月，配件齐全。

【商品详情】
- 品牌/型号：编程
- 购买渠道：天猫旗舰店
- 购买时间：2025年07月
- 使用频率：基本闲置

【商品状态】
外观完好无划痕', NOW() - INTERVAL '12 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '小米台灯Pro', '/uploads/product_028.jpg', '这是一款小米台灯Pro，购入几个星期，配件齐全。

【商品详情】
- 品牌/型号：台灯
- 购买渠道：官网购买
- 购买时间：2025年05月
- 使用频率：基本闲置

【商品状态】
成色如图所示，实物拍摄，所见即所得。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

原装配件齐全，盒子说明书都在。
', 131.9, 173.06, 5, 7, 1, '苏州', 197, '小米台灯Pro 这是一款小米台灯Pro，购入几个星期，配件齐全。

【商品详情】
- 品牌/型号：台灯
- 购买渠道：官网购买
- 购买时间：2025年05月
- 使用频率：基本闲置

【商品状态】
成色如图所示，实', NOW() - INTERVAL '10 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'iPad Air 5代 64G', '/uploads/product_029.jpg', '这是一款iPad Air 5代 64G，购入一周，几乎全新。

【商品详情】
- 品牌/型号：平板
- 购买渠道：官网购买
- 购买时间：2024年06月
- 使用频率：偶尔使用

【商品状态】
有轻微使用痕迹，不影响使用，所有功能正常。

【出售原因】
毕业清仓，低价处理

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 2926.5, 3458.77, 1, 10, 1, '成都', 151, 'iPad Air 5代 64G 这是一款iPad Air 5代 64G，购入一周，几乎全新。

【商品详情】
- 品牌/型号：平板
- 购买渠道：官网购买
- 购买时间：2024年06月
- 使用频率：偶尔使用

【商品状态】
有轻', NOW() - INTERVAL '6 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '线性代数同济第六版', '/uploads/product_030.jpg', '这是一款线性代数同济第六版，购入三个月，正常使用。

【商品详情】
- 品牌/型号：教材
- 购买渠道：海外代购
- 购买时间：2024年12月
- 使用频率：每周使用1-2次

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 29.96, 33.74, 7, 9, 1, '广州', 390, '线性代数同济第六版 这是一款线性代数同济第六版，购入三个月，正常使用。

【商品详情】
- 品牌/型号：教材
- 购买渠道：海外代购
- 购买时间：2024年12月
- 使用频率：每周使用1-2次

【商品状态】
几乎全', NOW() - INTERVAL '20 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '优衣库 U系列 卫衣', '/uploads/product_031.jpg', '这是一款优衣库 U系列 卫衣，购入两年，几乎全新。

【商品详情】
- 品牌/型号：卫衣
- 购买渠道：京东自营
- 购买时间：2025年10月
- 使用频率：偶尔使用

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
毕业清仓，低价处理

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 166.6, 186.77, 2, 10, 1, '上海', 334, '优衣库 U系列 卫衣 这是一款优衣库 U系列 卫衣，购入两年，几乎全新。

【商品详情】
- 品牌/型号：卫衣
- 购买渠道：京东自营
- 购买时间：2025年10月
- 使用频率：偶尔使用

【商品状态】
几乎全新，买来', NOW() - INTERVAL '15 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Nike Air Force 1 低帮板鞋', '/uploads/product_032.jpg', '这是一款Nike Air Force 1 低帮板鞋，购入一年半，功能完好。

【商品详情】
- 品牌/型号：运动鞋
- 购买渠道：线下专卖店
- 购买时间：2025年09月
- 使用频率：每周使用1-2次

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
不太适合自己，转给有缘人

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 637.4, 835.55, 3, 7, 1, '西安', 52, 'Nike Air Force 1 低帮板鞋 这是一款Nike Air Force 1 低帮板鞋，购入一年半，功能完好。

【商品详情】
- 品牌/型号：运动鞋
- 购买渠道：线下专卖店
- 购买时间：2025年09月
- 使用频率：每周使用1-', NOW() - INTERVAL '25 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'MacBook Pro 14寸 M2芯片', '/uploads/product_033.jpg', '这是一款MacBook Pro 14寸 M2芯片，购入几个星期，保存完好。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：官网购买
- 购买时间：2024年05月
- 使用频率：基本闲置

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
冲动消费买多了

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 10902.54, 14686.21, 1, 8, 1, '杭州', 361, 'MacBook Pro 14寸 M2芯片 这是一款MacBook Pro 14寸 M2芯片，购入几个星期，保存完好。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：官网购买
- 购买时间：2024年05月
- 使用频率：基本闲置

【', NOW() - INTERVAL '27 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Python编程从入门到实践', '/uploads/product_034.jpg', '这是一款Python编程从入门到实践，购入一年，功能完好。

【商品详情】
- 品牌/型号：编程
- 购买渠道：朋友赠送
- 购买时间：2024年04月
- 使用频率：偶尔使用

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
换了新的，旧的闲置

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

可提供购买凭证，支持验货。
', 55.02, 75.78, 7, 9, 1, '杭州', 83, 'Python编程从入门到实践 这是一款Python编程从入门到实践，购入一年，功能完好。

【商品详情】
- 品牌/型号：编程
- 购买渠道：朋友赠送
- 购买时间：2024年04月
- 使用频率：偶尔使用

【商品状态】
正常使', NOW() - INTERVAL '29 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Levi''s 501 经典牛仔裤', '/uploads/product_035.jpg', '这是一款Levi''s 501 经典牛仔裤，购入几个星期，保存完好。

【商品详情】
- 品牌/型号：牛仔裤
- 购买渠道：官网购买
- 购买时间：2025年08月
- 使用频率：使用次数不超过10次

【商品状态】
成色如图所示，实物拍摄，所见即所得。

【出售原因】
换了新的，旧的闲置

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

可提供购买凭证，支持验货。
', 394.08, 498.94, 2, 8, 1, '西安', 20, 'Levi''s 501 经典牛仔裤 这是一款Levi''s 501 经典牛仔裤，购入几个星期，保存完好。

【商品详情】
- 品牌/型号：牛仔裤
- 购买渠道：官网购买
- 购买时间：2025年08月
- 使用频率：使用次数不超过10次', NOW() - INTERVAL '25 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Yonex 羽毛球拍 弓箭11', '/uploads/product_036.jpg', '这是一款Yonex 羽毛球拍 弓箭11，购入三个月，正常使用。

【商品详情】
- 品牌/型号：羽毛球拍
- 购买渠道：京东自营
- 购买时间：2024年02月
- 使用频率：每天使用

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
冲动消费买多了

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 1197.91, 1788.39, 6, 7, 1, '苏州', 172, 'Yonex 羽毛球拍 弓箭11 这是一款Yonex 羽毛球拍 弓箭11，购入三个月，正常使用。

【商品详情】
- 品牌/型号：羽毛球拍
- 购买渠道：京东自营
- 购买时间：2024年02月
- 使用频率：每天使用

【商品状态】', NOW() - INTERVAL '29 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '斯伯丁NBA官方篮球', '/uploads/product_037.jpg', '这是一款斯伯丁NBA官方篮球，购入三个月，正常使用。

【商品详情】
- 品牌/型号：篮球
- 购买渠道：海外代购
- 购买时间：2024年05月
- 使用频率：基本闲置

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

同城可面交，外地顺丰到付。
', 289.2, 326.16, 6, 8, 1, '杭州', 391, '斯伯丁NBA官方篮球 这是一款斯伯丁NBA官方篮球，购入三个月，正常使用。

【商品详情】
- 品牌/型号：篮球
- 购买渠道：海外代购
- 购买时间：2024年05月
- 使用频率：基本闲置

【商品状态】
几乎全新，买', NOW() - INTERVAL '7 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Python编程从入门到实践', '/uploads/product_038.jpg', '这是一款Python编程从入门到实践，购入一个月，几乎全新。

【商品详情】
- 品牌/型号：编程
- 购买渠道：官网购买
- 购买时间：2024年02月
- 使用频率：每周使用1-2次

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 62.19, 72.05, 7, 8, 1, '杭州', 81, 'Python编程从入门到实践 这是一款Python编程从入门到实践，购入一个月，几乎全新。

【商品详情】
- 品牌/型号：编程
- 购买渠道：官网购买
- 购买时间：2024年02月
- 使用频率：每周使用1-2次

【商品状态', NOW() - INTERVAL '29 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'iPad Air 5代 64G', '/uploads/product_039.jpg', '这是一款iPad Air 5代 64G，购入一周，保存完好。

【商品详情】
- 品牌/型号：平板
- 购买渠道：朋友赠送
- 购买时间：2024年08月
- 使用频率：每周使用1-2次

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 3057.66, 3411.42, 1, 10, 1, '苏州', 28, 'iPad Air 5代 64G 这是一款iPad Air 5代 64G，购入一周，保存完好。

【商品详情】
- 品牌/型号：平板
- 购买渠道：朋友赠送
- 购买时间：2024年08月
- 使用频率：每周使用1-2次

【商品状态', NOW() - INTERVAL '16 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '戴森 V12 无线吸尘器', '/uploads/product_040.jpg', '这是一款戴森 V12 无线吸尘器，购入一周，功能完好。

【商品详情】
- 品牌/型号：吸尘器
- 购买渠道：海外代购
- 购买时间：2024年07月
- 使用频率：每天使用

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
毕业清仓，低价处理

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

送运费险，放心购买。
', 2088.54, 3003.28, 5, 7, 1, '南京', 303, '戴森 V12 无线吸尘器 这是一款戴森 V12 无线吸尘器，购入一周，功能完好。

【商品详情】
- 品牌/型号：吸尘器
- 购买渠道：海外代购
- 购买时间：2024年07月
- 使用频率：每天使用

【商品状态】
几乎全新', NOW() - INTERVAL '6 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Coach 托特包 真皮', '/uploads/product_041.jpg', '这是一款Coach 托特包 真皮，购入一周，轻微使用痕迹。

【商品详情】
- 品牌/型号：包包
- 购买渠道：线下专卖店
- 购买时间：2025年06月
- 使用频率：每周使用1-2次

【商品状态】
成色如图所示，实物拍摄，所见即所得。

【出售原因】
升级换代，闲置出售

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 1272.88, 1675.05, 2, 10, 1, '杭州', 16, 'Coach 托特包 真皮 这是一款Coach 托特包 真皮，购入一周，轻微使用痕迹。

【商品详情】
- 品牌/型号：包包
- 购买渠道：线下专卖店
- 购买时间：2025年06月
- 使用频率：每周使用1-2次

【商品状态', NOW() - INTERVAL '8 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '斯伯丁NBA官方篮球', '/uploads/product_042.jpg', '这是一款斯伯丁NBA官方篮球，购入一周，几乎全新。

【商品详情】
- 品牌/型号：篮球
- 购买渠道：朋友赠送
- 购买时间：2025年06月
- 使用频率：偶尔使用

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
换了新的，旧的闲置

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

原装配件齐全，盒子说明书都在。
', 153.22, 199.14, 6, 7, 1, '广州', 351, '斯伯丁NBA官方篮球 这是一款斯伯丁NBA官方篮球，购入一周，几乎全新。

【商品详情】
- 品牌/型号：篮球
- 购买渠道：朋友赠送
- 购买时间：2025年06月
- 使用频率：偶尔使用

【商品状态】
几乎全新，买来', NOW() - INTERVAL '16 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Adidas Ultraboost 跑步鞋', '/uploads/product_043.jpg', '这是一款Adidas Ultraboost 跑步鞋，购入三个月，配件齐全。

【商品详情】
- 品牌/型号：跑鞋
- 购买渠道：天猫旗舰店
- 购买时间：2024年04月
- 使用频率：每周使用1-2次

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
不太适合自己，转给有缘人

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 884.8, 1140.6, 3, 10, 1, '杭州', 153, 'Adidas Ultraboost 跑步鞋 这是一款Adidas Ultraboost 跑步鞋，购入三个月，配件齐全。

【商品详情】
- 品牌/型号：跑鞋
- 购买渠道：天猫旗舰店
- 购买时间：2024年04月
- 使用频率：每周使用1-2', NOW() - INTERVAL '12 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Nike Air Force 1 低帮板鞋', '/uploads/product_044.jpg', '这是一款Nike Air Force 1 低帮板鞋，购入半年，轻微使用痕迹。

【商品详情】
- 品牌/型号：运动鞋
- 购买渠道：线下专卖店
- 购买时间：2025年03月
- 使用频率：使用次数不超过10次

【商品状态】
成色如图所示，实物拍摄，所见即所得。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 456.83, 505.96, 3, 8, 1, '苏州', 230, 'Nike Air Force 1 低帮板鞋 这是一款Nike Air Force 1 低帮板鞋，购入半年，轻微使用痕迹。

【商品详情】
- 品牌/型号：运动鞋
- 购买渠道：线下专卖店
- 购买时间：2025年03月
- 使用频率：使用次数不', NOW() - INTERVAL '6 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Levi''s 501 经典牛仔裤', '/uploads/product_045.jpg', '这是一款Levi''s 501 经典牛仔裤，购入一年，配件齐全。

【商品详情】
- 品牌/型号：牛仔裤
- 购买渠道：天猫旗舰店
- 购买时间：2025年09月
- 使用频率：使用次数不超过10次

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

送运费险，放心购买。
', 255.47, 348.05, 2, 7, 1, '苏州', 357, 'Levi''s 501 经典牛仔裤 这是一款Levi''s 501 经典牛仔裤，购入一年，配件齐全。

【商品详情】
- 品牌/型号：牛仔裤
- 购买渠道：天猫旗舰店
- 购买时间：2025年09月
- 使用频率：使用次数不超过10次
', NOW() - INTERVAL '19 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '小米13 Ultra 256G', '/uploads/product_046.jpg', '这是一款小米13 Ultra 256G，购入两年，几乎全新。

【商品详情】
- 品牌/型号：手机
- 购买渠道：海外代购
- 购买时间：2025年03月
- 使用频率：使用次数不超过10次

【商品状态】
几乎全新，买来用了几次就一直放着了。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 4288.93, 5635.79, 1, 10, 1, '西安', 231, '小米13 Ultra 256G 这是一款小米13 Ultra 256G，购入两年，几乎全新。

【商品详情】
- 品牌/型号：手机
- 购买渠道：海外代购
- 购买时间：2025年03月
- 使用频率：使用次数不超过10次

【商品', NOW() - INTERVAL '2 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '飞利浦电动牙刷', '/uploads/product_047.jpg', '这是一款飞利浦电动牙刷，购入半年，几乎全新。

【商品详情】
- 品牌/型号：牙刷
- 购买渠道：海外代购
- 购买时间：2024年02月
- 使用频率：每天使用

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
毕业清仓，低价处理

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 302.74, 409.16, 5, 9, 1, '北京', 104, '飞利浦电动牙刷 这是一款飞利浦电动牙刷，购入半年，几乎全新。

【商品详情】
- 品牌/型号：牙刷
- 购买渠道：海外代购
- 购买时间：2024年02月
- 使用频率：每天使用

【商品状态】
正常使用痕迹，整体状', NOW() - INTERVAL '26 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '考研政治肖秀荣1000题', '/uploads/product_048.jpg', '这是一款考研政治肖秀荣1000题，购入一周，保存完好。

【商品详情】
- 品牌/型号：考研
- 购买渠道：线下专卖店
- 购买时间：2024年11月
- 使用频率：每天使用

【商品状态】
外观完好无划痕，功能一切正常，电池健康度95%以上。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！


', 36.79, 47.41, 7, 10, 1, '杭州', 85, '考研政治肖秀荣1000题 这是一款考研政治肖秀荣1000题，购入一周，保存完好。

【商品详情】
- 品牌/型号：考研
- 购买渠道：线下专卖店
- 购买时间：2024年11月
- 使用频率：每天使用

【商品状态】
外观完好', NOW() - INTERVAL '19 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'MacBook Pro 14寸 M2芯片', '/uploads/product_049.jpg', '这是一款MacBook Pro 14寸 M2芯片，购入三个月，功能完好。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：海外代购
- 购买时间：2025年04月
- 使用频率：每周使用1-2次

【商品状态】
正常使用痕迹，整体状态良好，无暗病。

【出售原因】
搬家不方便带走

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

可提供购买凭证，支持验货。
', 9987.16, 13555.89, 1, 9, 1, '杭州', 355, 'MacBook Pro 14寸 M2芯片 这是一款MacBook Pro 14寸 M2芯片，购入三个月，功能完好。

【商品详情】
- 品牌/型号：笔记本
- 购买渠道：海外代购
- 购买时间：2025年04月
- 使用频率：每周使用1-2次', NOW() - INTERVAL '8 days', NOW());

INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, 'Adidas Ultraboost 跑步鞋', '/uploads/product_050.jpg', '这是一款Adidas Ultraboost 跑步鞋，购入一周，保存完好。

【商品详情】
- 品牌/型号：跑鞋
- 购买渠道：海外代购
- 购买时间：2025年02月
- 使用频率：使用次数不超过10次

【商品状态】
成色如图所示，实物拍摄，所见即所得。

【出售原因】
换了新的，旧的闲置

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

急出，价格好商量！
', 509.04, 583.55, 3, 7, 1, '深圳', 97, 'Adidas Ultraboost 跑步鞋 这是一款Adidas Ultraboost 跑步鞋，购入一周，保存完好。

【商品详情】
- 品牌/型号：跑鞋
- 购买渠道：海外代购
- 购买时间：2025年02月
- 使用频率：使用次数不超过10', NOW() - INTERVAL '19 days', NOW());
