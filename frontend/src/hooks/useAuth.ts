import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { storage } from '../utils/storage';
import { login as loginApi, logout as logoutApi } from '../api/auth';
import type { User, LoginRequest } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 初始化时从 localStorage 读取用户信息
  useEffect(() => {
    const storedUser = storage.getUser<User>();
    const token = storage.getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // 登录
  const login = useCallback(async (data: LoginRequest) => {
    try {
      const response = await loginApi(data);
      const { token, user: userData } = response.data.data;

      storage.setToken(token);
      storage.setUser(userData);
      setUser(userData);

      message.success('登录成功');
      navigate('/');
      return true;
    } catch {
      return false;
    }
  }, [navigate]);

  // 退出登录
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // 即使请求失败也要清除本地状态
    }
    storage.clearAuth();
    setUser(null);
    message.success('已退出登录');
    navigate('/auth');
  }, [navigate]);

  // 检查是否已登录
  const isAuthenticated = useCallback(() => {
    return !!storage.getToken() && !!user;
  }, [user]);

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    setUser,
  };
};
