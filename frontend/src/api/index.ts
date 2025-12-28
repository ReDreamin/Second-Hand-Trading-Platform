import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { storage } from '../utils/storage';
import type { ApiResponse } from '../types';

// 扩展 AxiosRequestConfig 类型，添加 silent 选项
declare module 'axios' {
  export interface AxiosRequestConfig {
    silent?: boolean; // 设置为 true 时不显示错误消息
  }
}

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8080/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加 token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;

    // 根据后端返回的 code 判断请求是否成功
    if (res.code !== 0 && res.code !== 200) {
      // 如果请求配置了 silent，不显示错误消息
      if (!response.config.silent) {
        message.error(res.message || '请求失败');
      }
      return Promise.reject(new Error(res.message || '请求失败'));
    }

    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // 如果请求配置了 silent，不显示错误消息
    const isSilent = error.config?.silent;

    if (error.response) {
      const { status, data, config } = error.response;
      const requestUrl = config?.url || '';

      // 判断是否是登录/注册接口
      const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      if (!isSilent) {
        switch (status) {
          case 401:
            if (isAuthRequest) {
              // 登录/注册接口返回401，显示具体错误信息
              message.error(data?.message || '用户名或密码错误');
            } else {
              // 其他接口返回401，token过期，跳转登录页
              message.error('登录已过期，请重新登录');
              storage.clearAuth();
              window.location.href = '/auth';
            }
            break;
          case 403:
            message.error('没有权限访问');
            break;
          case 404:
            message.error('请求的资源不存在');
            break;
          case 500:
            message.error('服务器错误，请稍后重试');
            break;
          default:
            message.error(data?.message || '请求失败');
        }
      } else if (status === 401 && !isAuthRequest) {
        // 即使是 silent 模式，401 也需要跳转登录页
        storage.clearAuth();
        window.location.href = '/auth';
      }
    } else if (error.request) {
      if (!isSilent) {
        message.error('网络错误，请检查网络连接');
      }
    } else {
      if (!isSilent) {
        message.error('请求配置错误');
      }
    }

    return Promise.reject(error);
  }
);

export default request;
