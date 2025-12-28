import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { login, register } from '../../api/auth';
import { storage } from '../../utils/storage';
import type { LoginRequest, RegisterRequest } from '../../types';
import styles from './index.module.css';

type TabKey = 'login' | 'register';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>('login');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // 登录处理
  const handleLogin = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await login(values);
      const { token, user } = response.data.data;
      storage.setToken(token);
      storage.setUser(user);
      message.success('登录成功');
      navigate(from, { replace: true });
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  // 注册处理
  const handleRegister = async (values: RegisterRequest & { confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword: _, ...registerData } = values;
      const response = await register(registerData);
      const { token, user } = response.data.data;
      storage.setToken(token);
      storage.setUser(user);
      message.success('注册成功');
      navigate(from, { replace: true });
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          name="register"
          onFinish={handleRegister}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号（选填）" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: '请确认密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>二手交易平台</h1>
          <p className={styles.subtitle}>买卖闲置，循环利用</p>
        </div>

        <div className={styles.formWrapper}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as TabKey)}
            items={tabItems}
            centered
          />
        </div>

        <div className={styles.backHome}>
          <Button type="link" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
