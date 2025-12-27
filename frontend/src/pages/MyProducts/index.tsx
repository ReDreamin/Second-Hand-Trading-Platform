import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Space, Popconfirm, message, Image } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getMyProducts, deleteProduct } from '../../api/product';
import type { Product } from '../../types';
import { CategoryLabels } from '../../types';
import styles from './index.module.css';

const API_BASE = 'http://localhost:8080';

const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
};

const MyProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getMyProducts({ page, pageSize });
      setProducts(response.data.data.list);
      setTotal(response.data.data.total);
    } catch {
      // 错误已在拦截器中处理
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success('商品已下架');
      fetchProducts();
    } catch {
      // 错误已在拦截器中处理
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: string[]) => (
        <Image
          src={getImageUrl(images?.[0])}
          alt="商品图片"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
        />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="orange">
          {CategoryLabels[category as keyof typeof CategoryLabels]}
        </Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => (
        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          ¥{price.toFixed(2)}
        </span>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          on_sale: { color: 'green', text: '在售' },
          off_sale: { color: 'gray', text: '已下架' },
          sold_out: { color: 'red', text: '已售罄' },
        };
        const { color, text } = statusMap[status] || { color: 'gray', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/product/${record.id}`)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要下架此商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              下架
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.myProductsPage}>
      <div className={styles.container}>
        <Card
          title={
            <div className={styles.cardTitle}>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              />
              <span>我的商品</span>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/upload')}
            >
              发布商品
            </Button>
          }
          className={styles.card}
        >
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: setPage,
              showSizeChanger: false,
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default MyProducts;
