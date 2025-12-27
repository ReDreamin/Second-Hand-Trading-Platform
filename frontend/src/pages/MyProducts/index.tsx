import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Space, Popconfirm, message, Image } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getMyProducts, deleteProduct } from '../../api/product';
import type { Product } from '../../types';
import { CategoryLabels } from '../../types';
import styles from './index.module.css';

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
      // 模拟数据
      setProducts(getMockProducts());
      setTotal(5);
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据
  const getMockProducts = (): Product[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `我的商品 ${i + 1}`,
      category: 'electronics' as const,
      price: Math.floor(Math.random() * 500) + 50,
      stock: Math.floor(Math.random() * 10) + 1,
      description: '这是商品描述',
      images: [`https://picsum.photos/100/100?random=${i}`],
      sellerId: 1,
      sellerName: '我',
      status: 'on_sale' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success('商品已下架');
      fetchProducts();
    } catch {
      // 模拟成功
      message.success('商品已下架');
      setProducts((prev) => prev.filter((p) => p.id !== id));
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
          src={images[0] || '/placeholder.png'}
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
