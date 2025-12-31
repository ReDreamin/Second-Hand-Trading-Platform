# NWU二手线上交易平台

## 项目简介

**作者:Yang zekun**

**学号:2023117314**

NWU二手线上交易平台是一个面向校园用户的二手商品交易系统，提供商品发布、浏览、购买等完整的交易功能。

**主要功能：**
- 用户认证：注册、登录
- 商品管理：发布、编辑、删除、浏览商品
- 商品分类：服装、电子产品、鞋子、学习用具、日用品、运动器材、书籍、其他
- 订单系统：创建订单、支付、订单状态追踪
- 个人中心：用户资料管理、我的商品、购买记录

---

## 项目启动方式

### 环境要求

- Docker Desktop（已启动）
- Node.js 18+
- npm 或 yarn

### 一键启动（推荐）

Windows系统下，双击运行 `start.bat` 即可自动完成：
1. 环境检查（Docker、Node.js）
2. 启动数据库和后端服务（Docker Compose）
3. 安装前端依赖并启动开发服务器
4. 自动打开浏览器访问

```bash
# 直接双击 start.bat 或在命令行执行
start.bat
```

启动完成后访问：
- 前端界面：http://localhost:3000
- 后端API：http://localhost:8080/api

停止服务：
```bash
docker-compose down
```

### 分开启动

#### 1. 启动数据库和后端

```bash
# 构建并启动容器
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看后端日志
docker-compose logs -f secondhand-backend
```

#### 2. 启动前端

```bash
# 进入前端目录
cd frontend

# 安装依赖（首次启动需要）
npm install

# 启动开发服务器
npm run dev
```

---


## 测试流程

### 测试账号

卖家账号：

username: yzk
password: 123456
特点:上架了大量商品

买家账号:

username: test1
password: 123456


## 项目技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3.1 | UI框架 |
| TypeScript | 5.6.2 | 开发语言 |
| Vite | 6.0.5 | 构建工具 |
| Ant Design | 6.1.2 | UI组件库 |
| React Router | 7.11.0 | 路由管理 |
| Axios | 1.13.2 | HTTP客户端 |

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 21 | 开发语言 |
| Spring Boot | 3.2.1 | 后端框架 |
| Spring Security | - | 安全框架 |
| Spring Data JPA | - | ORM框架 |
| JWT (jjwt) | 0.12.3 | 身份认证 |
| Lombok | 1.18.30 | 代码简化 |

### 数据库

| 技术 | 版本 | 说明 |
|------|------|------|
| PostgreSQL | 16 | 关系型数据库 |

### 部署

| 技术 | 说明 |
|------|------|
| Docker | 容器化 |
| Docker Compose | 容器编排 |

---

## 项目目录结构

```
Second-Hand Trading Platform/
├── frontend/                      # 前端项目
│   ├── src/
│   │   ├── api/                   # API请求封装
│   │   │   ├── auth.ts            # 认证API
│   │   │   ├── product.ts         # 商品API
│   │   │   ├── order.ts           # 订单API
│   │   │   └── index.ts           # API配置
│   │   ├── components/            # 公共组件
│   │   │   ├── Navbar/            # 导航栏
│   │   │   ├── Layout/            # 布局组件
│   │   │   ├── ProductCard/       # 商品卡片
│   │   │   └── FloatSidebar/      # 浮动侧边栏
│   │   ├── hooks/                 # 自定义Hooks
│   │   │   └── useAuth.ts         # 认证Hook
│   │   ├── pages/                 # 页面组件
│   │   │   ├── Home/              # 首页
│   │   │   ├── Auth/              # 登录/注册
│   │   │   ├── ProductDetail/     # 商品详情
│   │   │   ├── ProductUpload/     # 发布商品
│   │   │   ├── MyProducts/        # 我的商品
│   │   │   ├── Profile/           # 个人资料
│   │   │   ├── Orders/            # 订单管理
│   │   │   ├── Purchases/         # 购买记录
│   │   │   └── Payment/           # 支付页面
│   │   ├── router/                # 路由配置
│   │   ├── types/                 # TypeScript类型定义
│   │   ├── utils/                 # 工具函数
│   │   ├── App.tsx                # 应用入口
│   │   └── main.tsx               # 主入口
│   ├── package.json               # 依赖配置
│   ├── vite.config.ts             # Vite配置
│   └── tsconfig.json              # TypeScript配置
│
├── backend/                       # 后端项目
│   ├── src/main/java/com/secondhand/platform/
│   │   ├── config/                # 配置类
│   │   │   ├── SecurityConfig.java
│   │   │   └── WebConfig.java
│   │   ├── controller/            # 控制器
│   │   │   ├── AuthController.java
│   │   │   ├── ProductController.java
│   │   │   ├── CategoryController.java
│   │   │   └── UploadController.java
│   │   ├── service/               # 业务逻辑层
│   │   ├── repository/            # 数据访问层
│   │   ├── entity/                # 实体类
│   │   │   ├── User.java
│   │   │   ├── Product.java
│   │   │   ├── ProductImage.java
│   │   │   └── Category.java
│   │   ├── dto/                   # 数据传输对象
│   │   ├── exception/             # 异常处理
│   │   └── Application.java       # 启动类
│   ├── src/main/resources/
│   │   └── application.yml        # 应用配置
│   ├── uploads/                   # 上传文件存储
│   ├── pom.xml                    # Maven配置
│   └── Dockerfile                 # 后端Docker配置
│
├── database/                      # 数据库
│   ├── init.sql                   # 初始化脚本
│   ├── user.sql                   # 用户表
│   ├── product.sql                # 商品表
│   ├── mock_data.sql              # 模拟数据
│   ├── generate_mock_data.py      # 数据生成脚本
│   └── Dockerfile                 # 数据库Docker配置
│
├── docker-compose.yml             # Docker编排配置
├── start.bat                      # 一键启动脚本
└── README.md                      # 项目说明文档
```

---

## 部署架构

### Docker 网络结构

项目使用 Docker Compose 进行容器编排，所有服务运行在同一个自定义 Bridge 网络中：

```
┌─────────────────────────────────────────────────────────────────┐
│                    secondhand-network (bridge)                  │
│                                                                 │
│  ┌─────────────────────┐       ┌─────────────────────┐         │
│  │   secondhand-db     │       │  secondhand-backend │         │
│  │   (PostgreSQL 16)   │◄─────►│  (Spring Boot)      │         │
│  │                     │ JDBC  │                     │         │
│  │   Port: 5432        │       │   Port: 8080        │         │
│  └─────────────────────┘       └─────────────────────┘         │
│           │                             │                       │
└───────────┼─────────────────────────────┼───────────────────────┘
            │                             │
            ▼                             ▼
     ┌──────────────┐            ┌──────────────┐
     │ Host: 5432   │            │ Host: 8080   │
     │ (可选暴露)    │            │ (API访问)    │
     └──────────────┘            └──────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │    Frontend      │
                              │  (Vite Dev)      │
                              │  localhost:3000  │
                              │                  │
                              │  /api/* ──proxy──►│
                              └──────────────────┘
```

### 服务说明

| 服务 | 容器名 | 端口映射 | 说明 |
|------|--------|----------|------|
| PostgreSQL | secondhand-db | 5432:5432 | 数据库服务，数据持久化到 Docker Volume |
| Spring Boot | secondhand-backend | 8080:8080 | 后端API服务，依赖数据库健康检查 |
| Vite Dev Server | (本地运行) | 3000 | 前端开发服务器，代理 `/api` 到后端 |

### 服务依赖与健康检查

```yaml
启动顺序: PostgreSQL → Backend → Frontend

PostgreSQL 健康检查:
  - 命令: pg_isready -U appuser -d secondhand
  - 间隔: 10s，重试: 5次

Backend 健康检查:
  - 命令: wget http://localhost:8080/api/products
  - 间隔: 30s，启动等待: 60s
```

### 数据持久化

| 类型 | 挂载方式 | 路径 |
|------|----------|------|
| 数据库数据 | Docker Volume | `postgres_data:/var/lib/postgresql/data` |
| 上传文件 | Bind Mount | `./backend/uploads:/app/uploads` |

---

## 订单业务模型

### 订单状态流转

订单系统是整个交易平台的核心，连接买家、卖家和商品三方。订单从创建到完成经历以下状态流转：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              订单状态流转图                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐                                                  ┌──────────┐
  │  买家    │                                                  │  卖家    │
  └────┬─────┘                                                  └────┬─────┘
       │                                                              │
       │ 1. 点击购买                                                   │
       ▼                                                              │
  ┌──────────┐      ┌──────────┐                                      │
  │  pending │─────►│ cancelled│  买家取消订单                         │
  │  待支付   │      │  已取消   │                                      │
  └────┬─────┘      └──────────┘                                      │
       │                                                              │
       │ 2. 确认支付                                                   │
       │   └─► 商品状态变为 sold_out（已售出）                          │
       ▼                                                              │
  ┌──────────┐                                                        │
  │   paid   │◄───────────────────────────────────────────────────────┤
  │  已支付   │                                                        │
  │ (待发货)  │                                                        │
  └────┬─────┘                                                        │
       │                                                              │
       │ 3. 卖家发货 ◄────────────────────────────────────────────────┘
       ▼
  ┌──────────┐
  │ shipped  │
  │  已发货   │
  │ (待收货)  │
  └────┬─────┘
       │
       │ 4. 买家确认收货
       ▼
  ┌──────────┐
  │completed │
  │  已完成   │
  └──────────┘
```

### 订单状态说明

| 状态码 | 状态名 | 英文标识 | 说明 | 可执行操作 |
|--------|--------|----------|------|------------|
| 0 | 待支付 | pending | 订单已创建，等待买家支付 | 买家：支付、取消 |
| 1 | 已支付 | paid | 买家已支付，等待卖家发货 | 卖家：发货 |
| 2 | 已发货 | shipped | 卖家已发货，等待买家确认收货 | 买家：确认收货 |
| 3 | 已完成 | completed | 交易完成 | - |
| -1 | 已取消 | cancelled | 订单已取消 | - |

### 订单与商品联动

订单系统与商品系统紧密关联，确保交易的一致性：

```
┌─────────────────┐                    ┌─────────────────┐
│     商品        │                    │     订单        │
│   (Product)     │                    │    (Order)      │
├─────────────────┤                    ├─────────────────┤
│ status: on_sale │◄─── 创建订单 ─────│ status: pending │
│   (上架中)      │                    │   (待支付)      │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │                                      │ 买家支付
         ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│ status: sold_out│◄─── 支付成功 ─────│ status: paid    │
│   (已售出)      │     自动更新       │   (已支付)      │
└─────────────────┘                    └─────────────────┘
```

**关键业务规则：**
1. **商品快照**：创建订单时，将商品的标题、图片、价格等信息保存到订单中，确保即使商品信息后续变更，订单记录保持不变
2. **库存校验**：创建订单前检查商品是否仍在售（status = on_sale）
3. **状态联动**：订单支付成功后，自动将对应商品状态更新为已售出（sold_out）
4. **买家限制**：用户不能购买自己发布的商品

### API 接口

| 接口 | 方法 | 说明 | 操作者 |
|------|------|------|--------|
| `/api/orders` | POST | 创建订单 | 买家 |
| `/api/orders/my` | GET | 获取我的购买记录 | 买家 |
| `/api/orders/sales` | GET | 获取我的销售订单 | 卖家 |
| `/api/orders/{id}` | GET | 获取订单详情 | 买家/卖家 |
| `/api/orders/pay` | POST | 支付订单 | 买家 |
| `/api/orders/{id}/ship` | POST | 发货 | 卖家 |
| `/api/orders/{id}/complete` | POST | 确认收货 | 买家 |
| `/api/orders/{id}/cancel` | POST | 取消订单 | 买家 |

---

## 数据库设计

### ER 图

```
                                    ┌──────────────────┐
                                    │  user_profiles   │
                                    ├──────────────────┤
                              ┌────►│ user_id (PK,FK)  │
                              │     │ nickname         │
                              │     │ avatar_url       │
                              │     │ gender           │
                              │     │ birthday         │
                              │     │ bio              │
                              │     │ updated_at       │
                              │     └──────────────────┘
                              │ 1:1
┌──────────────────┐          │
│  user_accounts   │──────────┘
├──────────────────┤
│ id (PK)          │◄─────────────────────────────────────────────┐
│ username         │◄──────────────────────────┐                  │
│ email            │                           │                  │
│ phone            │                           │                  │
│ password_hash    │     1:N (seller)          │ 1:N (buyer)      │ 1:N (seller)
│ password_algo    │          │                │                  │
│ status           │          │                │                  │
│ created_at       │          │                │                  │
│ updated_at       │          │                │                  │
└──────────────────┘          │                │                  │
         │                    │                │                  │
         │ 1:N (seller)       │                │                  │
         ▼                    │                │                  │
┌──────────────────┐          │      ┌─────────┴──────────────────┴─────────┐
│    products      │          │      │              orders                  │
├──────────────────┤          │      ├──────────────────────────────────────┤
│ id (PK)          │◄─────────┼──────│ product_id (FK)                      │
│ seller_id (FK)   │──────────┘      │ id (PK)                              │
│ title            │                 │ order_no (UNIQUE)                    │
│ cover_url        │   ┌────────────►│ buyer_id (FK)                        │
│ description      │   │             │ seller_id (FK)                       │
│ price            │   │             │ product_title      ─┐                │
│ original_price   │   │             │ product_image       │ 商品快照       │
│ category_id (FK) │───┼───┐         │ product_price      ─┘                │
│ condition        │   │   │         │ quantity                             │
│ status           │◄──┼───┼─────────│ total_amount                         │
│ location         │   │   │ 支付后   │ status                               │
│ view_count       │   │   │ 更新为   │ created_at / paid_at                 │
│ search_text      │   │   │ sold_out │ shipped_at / completed_at            │
│ created_at       │   │   │         │ cancelled_at                         │
│ updated_at       │   │   │         │ buyer_remark / seller_remark         │
└──────────────────┘   │   │         └──────────────────────────────────────┘
         │             │   │
         │ 1:N         │   │
         ▼             │   │
┌──────────────────┐   │   │         ┌──────────────────┐
│ product_images   │   │   │         │   categories     │
├──────────────────┤   │   │         ├──────────────────┤
│ id (PK)          │   │   └────────►│ id (PK)          │
│ product_id (FK)  │   │             │ name             │
│ image_url        │   │             │ parent_id (FK)   │──┐
│ sort_order       │   │             │ icon             │  │ 自引用
│ created_at       │   │             │ sort_order       │◄─┘
└──────────────────┘   │             │ created_at       │
                       │             └──────────────────┘
                       │
             user_accounts (buyer)
```

**实体关系说明：**

| 关系 | 说明 |
|------|------|
| user_accounts ←1:1→ user_profiles | 一个用户对应一份个人资料 |
| user_accounts ←1:N→ products | 一个用户（卖家）可发布多个商品 |
| user_accounts ←1:N→ orders (buyer) | 一个用户（买家）可有多个购买订单 |
| user_accounts ←1:N→ orders (seller) | 一个用户（卖家）可有多个销售订单 |
| products ←1:N→ orders | 一个商品可对应多个订单（如取消后重新购买） |
| products ←1:N→ product_images | 一个商品可有多张图片 |
| categories ←1:N→ products | 一个分类下可有多个商品 |
| categories ←自引用→ categories | 支持多级分类结构 |

### 表结构详解

#### 1. user_accounts（用户账户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键，自增 |
| username | VARCHAR(64) | 用户名，唯一 |
| email | VARCHAR(128) | 邮箱，唯一 |
| phone | VARCHAR(32) | 手机号，唯一 |
| password_hash | TEXT | 密码哈希值（不存明文） |
| password_algo | VARCHAR(32) | 加密算法（bcrypt/argon2） |
| status | SMALLINT | 状态：1=正常, 0=禁用, -1=删除 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 2. user_profiles（用户资料表）

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | BIGINT | 主键，外键关联 user_accounts |
| nickname | VARCHAR(64) | 昵称 |
| avatar_url | TEXT | 头像URL |
| gender | SMALLINT | 性别 |
| birthday | DATE | 生日 |
| bio | TEXT | 个人简介 |
| updated_at | TIMESTAMP | 更新时间 |

#### 3. categories（商品分类表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键，自增 |
| name | VARCHAR(64) | 分类名称 |
| parent_id | INT | 父分类ID（支持层级分类） |
| icon | VARCHAR(128) | 图标标识 |
| sort_order | INT | 排序权重 |
| created_at | TIMESTAMP | 创建时间 |

**预置分类：**
- 数码电子（手机、电脑、平板、相机、耳机音箱）
- 服饰鞋包
- 图书教材
- 生活用品
- 美妆护肤
- 运动户外
- 游戏娱乐
- 其他

#### 4. products（商品表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键，自增 |
| seller_id | BIGINT | 卖家ID，外键关联 user_accounts |
| title | VARCHAR(128) | 商品标题 |
| cover_url | TEXT | 封面图URL |
| description | TEXT | 商品描述 |
| price | DECIMAL(10,2) | 售价 |
| original_price | DECIMAL(10,2) | 原价 |
| category_id | INT | 分类ID，外键关联 categories |
| condition | SMALLINT | 成色：10=全新, 9=几乎全新, 8=轻微痕迹, 7=正常痕迹, 5=明显痕迹 |
| status | SMALLINT | 状态：1=上架, 0=下架, 2=已售, -1=删除 |
| location | VARCHAR(128) | 交易地点 |
| view_count | INT | 浏览次数 |
| search_text | TEXT | 全文搜索字段 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 5. product_images（商品图片表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键，自增 |
| product_id | BIGINT | 商品ID，外键关联 products（级联删除） |
| image_url | TEXT | 图片URL |
| sort_order | INT | 排序权重 |
| created_at | TIMESTAMP | 创建时间 |

#### 6. orders（订单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键，自增 |
| order_no | VARCHAR(32) | 订单号，唯一 |
| product_id | BIGINT | 商品ID，外键关联 products |
| buyer_id | BIGINT | 买家ID，外键关联 user_accounts |
| seller_id | BIGINT | 卖家ID，外键关联 user_accounts |
| product_title | VARCHAR(128) | 商品标题快照 |
| product_image | TEXT | 商品图片快照 |
| product_price | DECIMAL(10,2) | 商品价格快照 |
| quantity | INT | 购买数量 |
| total_amount | DECIMAL(10,2) | 订单总金额 |
| status | SMALLINT | 状态：0=待支付, 1=已支付, 2=已发货, 3=已完成, -1=已取消 |
| created_at | TIMESTAMP | 创建时间 |
| paid_at | TIMESTAMP | 支付时间 |
| shipped_at | TIMESTAMP | 发货时间 |
| completed_at | TIMESTAMP | 完成时间 |
| cancelled_at | TIMESTAMP | 取消时间 |
| buyer_remark | TEXT | 买家备注 |
| seller_remark | TEXT | 卖家备注 |

### 索引设计

```sql
-- 商品查询优化索引
CREATE INDEX idx_products_seller ON products(seller_id);      -- 按卖家查询
CREATE INDEX idx_products_category ON products(category_id);  -- 按分类查询
CREATE INDEX idx_products_status ON products(status);         -- 按状态筛选
CREATE INDEX idx_products_created ON products(created_at DESC); -- 按时间排序
CREATE INDEX idx_products_price ON products(price);           -- 按价格排序

-- 全文搜索索引（pg_trgm 扩展，支持中文模糊搜索）
CREATE INDEX idx_products_search ON products USING gin(search_text gin_trgm_ops);

-- 订单查询优化索引
CREATE INDEX idx_orders_buyer ON orders(buyer_id);            -- 按买家查询
CREATE INDEX idx_orders_seller ON orders(seller_id);          -- 按卖家查询
CREATE INDEX idx_orders_product ON orders(product_id);        -- 按商品查询
CREATE INDEX idx_orders_status ON orders(status);             -- 按状态筛选
CREATE INDEX idx_orders_created ON orders(created_at DESC);   -- 按时间排序
CREATE INDEX idx_orders_order_no ON orders(order_no);         -- 按订单号查询
```
