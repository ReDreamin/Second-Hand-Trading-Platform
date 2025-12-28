import request from './index';
import type {
  Order,
  CreateOrderRequest,
  PayOrderRequest,
  ApiResponse,
} from '../types';

// 订单列表响应类型
interface OrderPageResponse {
  content: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// 创建订单
export const createOrder = (data: CreateOrderRequest) => {
  return request.post<ApiResponse<Order>>('/orders', data);
};

// 获取订单详情
export const getOrderDetail = (id: number) => {
  return request.get<ApiResponse<Order>>(`/orders/${id}`);
};

// 获取我的购买订单列表
export const getMyOrders = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return request.get<ApiResponse<OrderPageResponse>>('/orders/my', { params });
};

// 获取我的销售订单列表
export const getMySalesOrders = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return request.get<ApiResponse<OrderPageResponse>>('/orders/sales', { params });
};

// 支付订单
export const payOrder = (data: PayOrderRequest) => {
  return request.post<ApiResponse<Order>>('/orders/pay', data);
};

// 发货
export const shipOrder = (id: number) => {
  return request.post<ApiResponse<Order>>(`/orders/${id}/ship`);
};

// 确认收货
export const completeOrder = (id: number) => {
  return request.post<ApiResponse<Order>>(`/orders/${id}/complete`);
};

// 取消订单
export const cancelOrder = (id: number) => {
  return request.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
};
