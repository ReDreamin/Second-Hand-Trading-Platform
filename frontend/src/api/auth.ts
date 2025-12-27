import request from './index';
import type {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  AuthResponse,
  ApiResponse,
  User,
} from '../types';

// 用户登录
export const login = (data: LoginRequest) => {
  return request.post<ApiResponse<AuthResponse>>('/auth/login', data);
};

// 用户注册
export const register = (data: RegisterRequest) => {
  return request.post<ApiResponse<AuthResponse>>('/auth/register', data);
};

// 修改密码
export const changePassword = (data: ChangePasswordRequest) => {
  return request.post<ApiResponse<void>>('/auth/change-password', data);
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get<ApiResponse<User>>('/auth/me');
};

// 退出登录
export const logout = () => {
  return request.post<ApiResponse<void>>('/auth/logout');
};
