import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Tag,
  InputNumber,
  Spin,
  Image,
  Descriptions,
  message,
} from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getProductDetail } from '../../api/product';
import { createOrder } from '../../api/order';
import { storage } from '../../utils/storage';
import type { Product } from '../../types';
import { CategoryLabels } from '../../types';
import styles from './index.module.css';

const API_BASE = 'http://localhost:8080';

const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    setLoading(true);
    try {
      const response = await getProductDetail(productId);
      setProduct(response.data.data);
    } catch {
      // 错误已在拦截器中处理
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    const token = storage.getToken();
    if (!token) {
      message.warning('请先登录');
      navigate('/auth', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    if (!product) return;

    setBuying(true);
    try {
      const response = await createOrder({
        productId: product.id,
        quantity,
      });
      if (response.data.code === 200) {
        const orderId = response.data.data.id;
        message.success('订单创建成功');
        navigate(`/payment/${orderId}`);
      }
    } catch (error) {
      console.error('创建订单失败:', error);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>商品不存在</h2>
        <Button onClick={() => navigate('/')}>返回首页</Button>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className={styles.backBtn}
        >
          返回
        </Button>

        <div className={styles.content}>
          {/* 图片区域 */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <Image
                src={getImageUrl(product.images[currentImage])}
                alt={product.name}
                width="100%"
                height={400}
                style={{ objectFit: 'cover' }}
              />
            </div>
            {product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${
                      currentImage === index ? styles.active : ''
                    }`}
                    onClick={() => setCurrentImage(index)}
                  >
                    <img src={getImageUrl(img)} alt={`缩略图 ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 信息区域 */}
          <div className={styles.infoSection}>
            <Card className={styles.infoCard}>
              <h1 className={styles.productName}>{product.name}</h1>

              <div className={styles.priceRow}>
                <span className={styles.price}>¥{product.price.toFixed(2)}</span>
                <Tag color="orange">{CategoryLabels[product.category]}</Tag>
              </div>

              <Descriptions column={1} className={styles.descriptions}>
                <Descriptions.Item label="库存">{product.stock} 件</Descriptions.Item>
                <Descriptions.Item label="卖家">{product.sellerName}</Descriptions.Item>
                <Descriptions.Item label="发布时间">
                  {new Date(product.createdAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>

              <div className={styles.description}>
                <h3>商品描述</h3>
                <p>{product.description}</p>
              </div>

              {product.status === 'on_sale' && product.stock > 0 && (
                <div className={styles.buySection}>
                  <div className={styles.quantityRow}>
                    <span>购买数量：</span>
                    <InputNumber
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(value) => setQuantity(value || 1)}
                    />
                    <span className={styles.totalPrice}>
                      合计：<b>¥{totalPrice.toFixed(2)}</b>
                    </span>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleBuy}
                    loading={buying}
                    block
                  >
                    立即购买
                  </Button>
                </div>
              )}

              {product.stock === 0 && (
                <div className={styles.soldOut}>
                  <Tag color="red">已售罄</Tag>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
