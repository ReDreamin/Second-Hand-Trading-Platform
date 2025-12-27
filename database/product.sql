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

    -- 全文搜索向量 (中文需要配置分词器，这里用简单方案)
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
