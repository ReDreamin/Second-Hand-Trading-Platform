# NWU二手线上交易平台

## 项目简介

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
