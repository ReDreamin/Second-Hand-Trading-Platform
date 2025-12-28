import request from './index';
import type {
  Order,
  CreateOrderRequest,
  PayOrderRequest,
  ApiResponse,
} from '../types';

// 注：订单相关接口后端尚未实现，前端使用模拟数据处理
// 所有请求设置 silent: true 以禁用自动错误提示

// 创建订单
export const createOrder = (data: CreateOrderRequest) => {
  return request.post<ApiResponse<Order>>('/orders', data, { silent: true });
};

// 获取订单详情
export const getOrderDetail = (id: number) => {
  return request.get<ApiResponse<Order>>(`/orders/${id}`, { silent: true });
};

// 获取我的订单列表
export const getMyOrders = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return request.get<ApiResponse<{ list: Order[]; total: number }>>('/orders/my', { params, silent: true });
};

// 支付订单
export const payOrder = (data: PayOrderRequest) => {
  return request.post<ApiResponse<{ success: boolean }>>('/orders/pay', data, { silent: true });
};

// 取消订单
export const cancelOrder = (id: number) => {
  return request.post<ApiResponse<void>>(`/orders/${id}/cancel`, null, { silent: true });
};
