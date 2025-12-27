import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button, Dropdown, Avatar, Space } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  ShoppingOutlined,
  PlusOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { storage } from '../../utils/storage';
import type { User, ProductCategory } from '../../types';
import { CategoryLabels } from '../../types';
import styles from './index.module.css';

const categories: ProductCategory[] = [
  'clothing',
  'electronics',
  'shoes',
  'study',
  'daily',
  'sports',
  'books',
  'other',
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | ''>('');

  useEffect(() => {
    const storedUser = storage.getUser<User>();
    setUser(storedUser);

    // 从 URL 读取搜索参数
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') as ProductCategory || '';
    setSearchValue(keyword);
    setActiveCategory(category);
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchValue) params.set('keyword', searchValue);
    if (activeCategory) params.set('category', activeCategory);
    navigate(`/?${params.toString()}`);
  };

  const handleCategoryClick = (category: ProductCategory) => {
    const newCategory = activeCategory === category ? '' : category;
    setActiveCategory(newCategory);

    const params = new URLSearchParams();
    if (searchValue) params.set('keyword', searchValue);
    if (newCategory) params.set('category', newCategory);
    navigate(`/?${params.toString()}`);
  };

  const handleLogout = () => {
    storage.clearAuth();
    setUser(null);
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'my-products',
      icon: <ShoppingOutlined />,
      label: '我的商品',
      onClick: () => navigate('/my-products'),
    },
    {
      key: 'upload',
      icon: <PlusOutlined />,
      label: '发布商品',
      onClick: () => navigate('/upload'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => navigate('/')}>
          <ShoppingOutlined className={styles.logoIcon} />
          <span className={styles.logoText}>二手市场</span>
        </div>

        {/* 搜索框 */}
        <div className={styles.search}>
          <Input
            placeholder="搜索商品..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
            className={styles.searchInput}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </div>

        {/* 分类标签 */}
        <div className={styles.categories}>
          {categories.map((category) => (
            <span
              key={category}
              className={`${styles.categoryTag} ${
                activeCategory === category ? styles.active : ''
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {CategoryLabels[category]}
            </span>
          ))}
        </div>

        {/* 用户入口 */}
        <div className={styles.userArea}>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className={styles.userInfo}>
                <Avatar icon={<UserOutlined />} src={user.avatar} />
                <span className={styles.username}>{user.username}</span>
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/auth')}>
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
