// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// 商品相关类型
export type ProductCategory =
  | 'clothing'      // 服装
  | 'electronics'   // 电子产品
  | 'shoes'         // 鞋子
  | 'study'         // 学习用具
  | 'daily'         // 日用品
  | 'sports'        // 运动器材
  | 'books'         // 书籍
  | 'other';        // 其他

export const CategoryLabels: Record<ProductCategory, string> = {
  clothing: '服装',
  electronics: '电子产品',
  shoes: '鞋子',
  study: '学习用具',
  daily: '日用品',
  sports: '运动器材',
  books: '书籍',
  other: '其他',
};

export interface Product {
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

export interface ProductCreateRequest {
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  images: string[];
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: ProductCategory;
  keyword?: string;
  sellerId?: number;
}

export interface ProductListResponse {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// 订单相关类型
export type OrderStatus =
  | 'pending'       // 待支付
  | 'paid'          // 已支付
  | 'shipped'       // 已发货
  | 'completed'     // 已完成
  | 'cancelled';    // 已取消

export interface Order {
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

export interface CreateOrderRequest {
  productId: number;
  quantity: number;
}

export interface PayOrderRequest {
  orderId: number;
  paymentMethod: 'alipay' | 'wechat' | 'balance';
}

// API 响应通用类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}
