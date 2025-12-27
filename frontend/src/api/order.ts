import request from './index';
import type {
  Order,
  CreateOrderRequest,
  PayOrderRequest,
  ApiResponse,
} from '../types';

// 创建订单
export const createOrder = (data: CreateOrderRequest) => {
  return request.post<ApiResponse<Order>>('/orders', data);
};

// 获取订单详情
export const getOrderDetail = (id: number) => {
  return request.get<ApiResponse<Order>>(`/orders/${id}`);
};

// 获取我的订单列表
export const getMyOrders = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return request.get<ApiResponse<{ list: Order[]; total: number }>>('/orders/my', { params });
};

// 支付订单
export const payOrder = (data: PayOrderRequest) => {
  return request.post<ApiResponse<{ success: boolean }>>('/orders/pay', data);
};

// 取消订单
export const cancelOrder = (id: number) => {
  return request.post<ApiResponse<void>>(`/orders/${id}/cancel`);
};
