import { useNavigate } from 'react-router-dom';
import { Card, Tag } from 'antd';
import type { Product } from '../../types';
import { CategoryLabels } from '../../types';
import styles from './index.module.css';

const API_BASE = 'http://localhost:8080';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  return (
    <Card
      className={styles.card}
      hoverable
      onClick={handleClick}
      cover={
        <div className={styles.imageWrapper}>
          <img
            alt={product.name}
            src={product.images[0]?.startsWith('/uploads') ? `${API_BASE}${product.images[0]}` : (product.images[0] || '/placeholder.png')}
            className={styles.image}
          />
          {product.stock === 0 && (
            <div className={styles.soldOut}>已售罄</div>
          )}
        </div>
      }
    >
      <div className={styles.content}>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.info}>
          <Tag color="orange">{CategoryLabels[product.category]}</Tag>
          <span className={styles.stock}>库存: {product.stock}</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          <span className={styles.seller}>{product.sellerName}</span>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
