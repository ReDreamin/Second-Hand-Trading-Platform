import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Empty, Pagination } from 'antd';
import { getProductList } from '../../api/product';
import ProductCard from '../../components/ProductCard';
import type { Product, ProductCategory } from '../../types';
import styles from './index.module.css';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') as ProductCategory || undefined;

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProductList({
        page,
        pageSize,
        keyword: keyword || undefined,
        category,
      });
      setProducts(response.data.data.list);
      setTotal(response.data.data.total);
    } catch {
      // 错误已在拦截器中处理
      // 开发阶段使用模拟数据
      setProducts(getMockProducts());
      setTotal(24);
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据（开发阶段使用）
  const getMockProducts = (): Product[] => {
    const categories: ProductCategory[] = ['clothing', 'electronics', 'shoes', 'study', 'daily', 'sports', 'books', 'other'];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `商品名称 ${i + 1}`,
      category: categories[i % categories.length],
      price: Math.floor(Math.random() * 500) + 50,
      stock: Math.floor(Math.random() * 10) + 1,
      description: '这是商品描述',
      images: [`https://picsum.photos/300/200?random=${i}`],
      sellerId: 1,
      sellerName: '卖家用户',
      status: 'on_sale' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.homePage}>
      {/* 固定背景层 */}
      <div className={styles.backgroundLayer}>
        <div className={styles.backgroundContent}>
          <h1 className={styles.heroTitle}>发现好物，分享价值</h1>
          <p className={styles.heroSubtitle}>让闲置流动起来</p>
        </div>
      </div>

      {/* 滚动内容区 */}
      <div className={styles.scrollContent}>
        <div className={styles.container}>
          {/* 搜索结果提示 */}
          {(keyword || category) && (
            <div className={styles.searchInfo}>
              {keyword && <span>搜索: "{keyword}"</span>}
              {keyword && category && <span> · </span>}
              {category && <span>分类: {category}</span>}
              <span className={styles.resultCount}>（共 {total} 件商品）</span>
            </div>
          )}

          {/* 商品列表 */}
          <Spin spinning={loading}>
            {products.length > 0 ? (
              <>
                <div className={styles.productGrid}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className={styles.pagination}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                  />
                </div>
              </>
            ) : (
              !loading && (
                <Empty
                  description="暂无商品"
                  className={styles.empty}
                />
              )
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Home;
