import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  UserOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import { storage } from '../../utils/storage';
import type { User } from '../../types';
import styles from './index.module.css';

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  requireAuth: boolean;
}

const menuItems: MenuItem[] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人中心',
    path: '/profile',
    requireAuth: true,
  },
  {
    key: 'my-products',
    icon: <ShoppingOutlined />,
    label: '我的商品',
    path: '/my-products',
    requireAuth: true,
  },
  {
    key: 'orders',
    icon: <FileTextOutlined />,
    label: '我的订单',
    path: '/orders',
    requireAuth: true,
  },
  {
    key: 'purchases',
    icon: <ShoppingCartOutlined />,
    label: '购买记录',
    path: '/purchases',
    requireAuth: true,
  },
  {
    key: 'upload',
    icon: <PlusCircleOutlined />,
    label: '发布商品',
    path: '/upload',
    requireAuth: true,
  },
];

const FloatSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const storedUser = storage.getUser<User>();
    setUser(storedUser);

    const handleScroll = () => {
      setShowBackTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 监听storage变化
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = storage.getUser<User>();
      setUser(storedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClick = (item: MenuItem) => {
    if (item.requireAuth && !user) {
      navigate('/auth');
      return;
    }
    navigate(item.path);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.sidebar}>
      {menuItems.map((item) => (
        <div
          key={item.key}
          className={styles.menuItem}
          onClick={() => handleClick(item)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}

      {showBackTop && (
        <>
          <div className={styles.divider} />
          <div className={styles.menuItem} onClick={scrollToTop}>
            <span className={styles.icon}><VerticalAlignTopOutlined /></span>
            <span className={styles.label}>顶部</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FloatSidebar;
