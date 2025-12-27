# 二手交易平台 - 技术文档

## 1. 项目概述

本项目是一个基于 React 的二手交易平台前端应用，使用现代化的技术栈构建。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vite | 6.x | 构建工具 |
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型系统 |
| React Router | 7.x | 路由管理 |
| Ant Design | 6.x | UI 组件库 |
| Axios | 1.x | HTTP 请求 |

---

## 2. 项目结构

```
frontend/
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── index.ts            # axios 实例和拦截器配置
│   │   ├── auth.ts             # 认证相关接口
│   │   ├── product.ts          # 商品相关接口
│   │   └── order.ts            # 订单相关接口
│   ├── components/             # 通用组件
│   │   ├── Layout/             # 页面布局组件
│   │   ├── Navbar/             # 导航栏组件
│   │   └── ProductCard/        # 商品卡片组件
│   ├── pages/                  # 页面组件
│   │   ├── Home/               # 首页
│   │   ├── Auth/               # 认证页面
│   │   ├── ProductDetail/      # 商品详情
│   │   ├── ProductUpload/      # 商品发布
│   │   ├── MyProducts/         # 我的商品
│   │   └── Payment/            # 支付页面
│   ├── router/                 # 路由配置
│   │   ├── index.tsx           # 路由定义
│   │   └── ProtectedRoute.tsx  # 守护路由组件
│   ├── hooks/                  # 自定义 Hooks
│   │   └── useAuth.ts          # 认证 Hook
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                  # 工具函数
│   │   └── storage.ts          # localStorage 封装
│   ├── App.tsx                 # 应用入口
│   ├── main.tsx                # 渲染入口
│   └── index.css               # 全局样式
├── docs/
│   └── TECHNICAL.md            # 技术文档
└── package.json
```

---

## 3. 路由设计

### 3.1 路由列表

| 路径 | 组件 | 说明 | 需要认证 |
|------|------|------|----------|
| `/` | Home | 首页，展示商品列表 | 否 |
| `/auth` | Auth | 登录/注册/修改密码 | 否 |
| `/product/:id` | ProductDetail | 商品详情页 | 否 |
| `/upload` | ProductUpload | 发布商品 | 是 |
| `/my-products` | MyProducts | 我的商品管理 | 是 |
| `/payment/:orderId` | Payment | 支付页面 | 是 |

### 3.2 守护路由实现

```tsx
// src/router/ProtectedRoute.tsx
const ProtectedRoute = ({ children }) => {
  const token = storage.getToken();

  if (!token) {
    // 未登录时重定向到登录页，并保存原目标路径
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### 3.3 认证流程

1. 用户访问需要认证的路由
2. ProtectedRoute 检查 localStorage 中的 JWT token
3. 无 token 则重定向至 `/auth`，并将原路径保存在 state 中
4. 登录成功后，从 state 中读取原路径并重定向

---

## 4. 后端接口开发规范

### 4.1 API 基础配置

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

### 4.2 请求头规范

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 4.3 响应格式规范

所有 API 响应应遵循以下格式：

```typescript
interface ApiResponse<T> {
  code: number;      // 状态码，0 或 200 表示成功
  message: string;   // 状态消息
  data: T;           // 响应数据
}
```

**示例响应：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "商品名称"
  }
}
```

### 4.4 接口列表

#### 4.4.1 认证模块 (`/api/auth`)

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| POST | `/auth/login` | 用户登录 | `{ username, password }` | `{ token, user }` |
| POST | `/auth/register` | 用户注册 | `{ username, password, email, phone? }` | `{ token, user }` |
| POST | `/auth/change-password` | 修改密码 | `{ oldPassword, newPassword }` | - |
| GET | `/auth/me` | 获取当前用户 | - | `User` |
| POST | `/auth/logout` | 退出登录 | - | - |

**User 对象结构：**
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}
```

#### 4.4.2 商品模块 (`/api/products`)

| 方法 | 路径 | 说明 | 参数/请求体 | 响应 |
|------|------|------|-------------|------|
| GET | `/products` | 获取商品列表 | `?page&pageSize&category&keyword` | `{ list, total, page, pageSize }` |
| GET | `/products/:id` | 获取商品详情 | - | `Product` |
| POST | `/products` | 创建商品 | `ProductCreateRequest` | `Product` |
| PUT | `/products/:id` | 更新商品 | `Partial<ProductCreateRequest>` | `Product` |
| DELETE | `/products/:id` | 删除商品 | - | - |
| GET | `/products/my` | 获取我的商品 | `?page&pageSize` | `{ list, total }` |

**Product 对象结构：**
```typescript
interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  images: string[];
  sellerId: number;
  sellerName: string;
  status: 'on_sale' | 'off_sale' | 'sold_out';
  createdAt: string;
  updatedAt: string;
}

type ProductCategory =
  | 'clothing'      // 服装
  | 'electronics'   // 电子产品
  | 'shoes'         // 鞋子
  | 'study'         // 学习用具
  | 'daily'         // 日用品
  | 'sports'        // 运动器材
  | 'books'         // 书籍
  | 'other';        // 其他
```

**ProductCreateRequest 结构：**
```typescript
interface ProductCreateRequest {
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  images: string[];  // 图片 URL 数组
}
```

#### 4.4.3 文件上传 (`/api/upload`)

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| POST | `/upload/image` | 上传图片 | `FormData { file }` | `{ url: string }` |

**请求格式：**
- Content-Type: `multipart/form-data`
- 字段名: `file`

#### 4.4.4 订单模块 (`/api/orders`)

| 方法 | 路径 | 说明 | 参数/请求体 | 响应 |
|------|------|------|-------------|------|
| POST | `/orders` | 创建订单 | `{ productId, quantity }` | `Order` |
| GET | `/orders/:id` | 获取订单详情 | - | `Order` |
| GET | `/orders/my` | 获取我的订单 | `?page&pageSize&status` | `{ list, total }` |
| POST | `/orders/pay` | 支付订单 | `{ orderId, paymentMethod }` | `{ success: boolean }` |
| POST | `/orders/:id/cancel` | 取消订单 | - | - |

**Order 对象结构：**
```typescript
interface Order {
  id: number;
  orderNo: string;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  buyerId: number;
  sellerId: number;
  createdAt: string;
  paidAt?: string;
}

type OrderStatus =
  | 'pending'       // 待支付
  | 'paid'          // 已支付
  | 'shipped'       // 已发货
  | 'completed'     // 已完成
  | 'cancelled';    // 已取消
```

### 4.5 错误码规范

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（token 无效或过期） |
| 403 | 禁止访问（无权限） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 4.6 分页规范

分页请求参数：
- `page`: 页码，从 1 开始
- `pageSize`: 每页条数，默认 10

分页响应格式：
```typescript
{
  list: T[];        // 数据列表
  total: number;    // 总条数
  page: number;     // 当前页码
  pageSize: number; // 每页条数
}
```

---

## 5. 本地开发

### 5.1 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 5.2 构建项目

```bash
npm run build
```

### 5.3 预览构建结果

```bash
npm run preview
```

---

## 6. 环境配置

开发环境下，API 请求会通过 Vite 代理转发到后端服务器：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // 后端服务地址
        changeOrigin: true,
      },
    },
  },
});
```

---

## 7. 主题配置

项目使用橙色/黑色/灰色主题：

```css
:root {
  --color-primary: #FF6B00;      /* 主色-橙色 */
  --color-primary-hover: #FF8C38;
  --color-dark: #1A1A1A;         /* 黑色 */
  --color-gray-dark: #333333;
  --color-gray: #666666;
  --color-gray-light: #999999;
  --color-bg: #F5F5F5;           /* 背景色 */
  --color-white: #FFFFFF;
}
```

Ant Design 主题通过 ConfigProvider 配置：

```tsx
const theme = {
  token: {
    colorPrimary: '#FF6B00',
    colorLink: '#FF6B00',
    borderRadius: 8,
  },
};
```
