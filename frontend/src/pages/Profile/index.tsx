import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  message,
  Upload,
  Descriptions,
  Tabs,
  Modal
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  LogoutOutlined,
  LockOutlined,
  CameraOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { storage } from '../../utils/storage';
import { changePassword } from '../../api/auth';
import type { User, ChangePasswordRequest } from '../../types';
import styles from './index.module.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const storedUser = storage.getUser<User>();
    if (!storedUser) {
      navigate('/auth');
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    storage.clearAuth();
    message.success('已退出登录');
    navigate('/');
  };

  const handlePasswordChange = async (values: ChangePasswordRequest) => {
    setLoading(true);
    try {
      await changePassword(values);
      message.success('密码修改成功，请重新登录');
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
      storage.clearAuth();
      navigate('/auth');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload/image',
    headers: {
      Authorization: `Bearer ${storage.getToken()}`,
    },
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'done') {
        const avatarUrl = info.file.response?.data?.url;
        if (avatarUrl && user) {
          const updatedUser = { ...user, avatar: avatarUrl };
          setUser(updatedUser);
          storage.setUser(updatedUser);
          message.success('头像上传成功');
        }
      } else if (info.file.status === 'error') {
        message.error('头像上传失败');
      }
    },
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <Card className={styles.profileCard}>
          {/* 头像区域 */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={user.avatar}
                className={styles.avatar}
              />
              <Upload {...uploadProps}>
                <div className={styles.avatarOverlay}>
                  <CameraOutlined />
                  <span>更换头像</span>
                </div>
              </Upload>
            </div>
            <h2 className={styles.username}>{user.username}</h2>
            <p className={styles.joinDate}>
              注册时间：{new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* 信息标签页 */}
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: '基本信息',
                children: (
                  <div className={styles.infoSection}>
                    {isEditing ? (
                      <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                          username: user.username,
                          email: user.email,
                          phone: user.phone || '',
                        }}
                        onFinish={(values) => {
                          console.log('Update:', values);
                          setIsEditing(false);
                          message.success('信息已更新');
                        }}
                      >
                        <Form.Item
                          name="username"
                          label="用户名"
                          rules={[{ required: true, message: '请输入用户名' }]}
                        >
                          <Input prefix={<UserOutlined />} />
                        </Form.Item>
                        <Form.Item
                          name="email"
                          label="邮箱"
                          rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' },
                          ]}
                        >
                          <Input prefix={<MailOutlined />} />
                        </Form.Item>
                        <Form.Item name="phone" label="手机号">
                          <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            保存
                          </Button>
                          <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => setIsEditing(false)}
                          >
                            取消
                          </Button>
                        </Form.Item>
                      </Form>
                    ) : (
                      <>
                        <Descriptions column={1} bordered>
                          <Descriptions.Item label="用户名">
                            {user.username}
                          </Descriptions.Item>
                          <Descriptions.Item label="邮箱">
                            {user.email}
                          </Descriptions.Item>
                          <Descriptions.Item label="手机号">
                            {user.phone || '未设置'}
                          </Descriptions.Item>
                        </Descriptions>
                        <div className={styles.actionButtons}>
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setIsEditing(true)}
                          >
                            编辑资料
                          </Button>
                          <Button
                            icon={<LockOutlined />}
                            onClick={() => setIsPasswordModalOpen(true)}
                          >
                            修改密码
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
              {
                key: 'security',
                label: '账号安全',
                children: (
                  <div className={styles.securitySection}>
                    <div className={styles.securityItem}>
                      <div className={styles.securityInfo}>
                        <LockOutlined className={styles.securityIcon} />
                        <div>
                          <h4>登录密码</h4>
                          <p>定期修改密码可以保护账号安全</p>
                        </div>
                      </div>
                      <Button onClick={() => setIsPasswordModalOpen(true)}>
                        修改密码
                      </Button>
                    </div>
                    <div className={styles.securityItem}>
                      <div className={styles.securityInfo}>
                        <LogoutOutlined className={styles.securityIcon} />
                        <div>
                          <h4>退出登录</h4>
                          <p>退出当前账号</p>
                        </div>
                      </div>
                      <Button danger onClick={handleLogout}>
                        退出登录
                      </Button>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
