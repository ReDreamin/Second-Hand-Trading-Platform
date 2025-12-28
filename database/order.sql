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

-- 索引
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_order_no ON orders(order_no);
