import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button, Avatar } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
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

  return (
    <header className={styles.navbar}>
      {/* 第一行：Logo + 搜索栏 + 用户入口 */}
      <div className={styles.topRow}>
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
              size="large"
            />
            <Button type="primary" size="large" onClick={handleSearch}>
              搜索
            </Button>
          </div>

          {/* 用户入口 */}
          <div className={styles.userArea}>
            {user ? (
              <div className={styles.userInfo} onClick={() => navigate('/profile')}>
                <Avatar
                  icon={<UserOutlined />}
                  src={user.avatar}
                  size={36}
                  className={styles.avatar}
                />
                <span className={styles.username}>{user.username}</span>
              </div>
            ) : (
              <Button type="primary" size="large" onClick={() => navigate('/auth')}>
                登录
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 第二行：分类标签 */}
      <div className={styles.categoryRow}>
        <div className={styles.container}>
          <div className={styles.categories}>
            <span
              className={`${styles.categoryTag} ${activeCategory === '' ? styles.active : ''}`}
              onClick={() => {
                setActiveCategory('');
                const params = new URLSearchParams();
                if (searchValue) params.set('keyword', searchValue);
                navigate(`/?${params.toString()}`);
              }}
            >
              全部
            </span>
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
