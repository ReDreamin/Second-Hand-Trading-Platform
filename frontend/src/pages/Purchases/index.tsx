import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Empty, Image, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';
import type { Order, OrderStatus } from '../../types';
import styles from './index.module.css';

const statusColors: Record<OrderStatus, string> = {
  pending: 'orange',
  paid: 'blue',
  shipped: 'cyan',
  completed: 'green',
  cancelled: 'default',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

// Mock data
const mockPurchases: Order[] = [
  {
    id: 1,
    orderNo: 'PO202401010001',
    productId: 1,
    productName: 'iPhone 14 Pro 256GB 深空黑',
    productImage: 'https://picsum.photos/100/100?random=1',
    price: 6999,
    quantity: 1,
    totalAmount: 6999,
    status: 'completed',
    buyerId: 1,
    sellerId: 2,
    createdAt: '2024-01-15T10:30:00Z',
    paidAt: '2024-01-15T10:35:00Z',
  },
  {
    id: 2,
    orderNo: 'PO202401020002',
    productId: 2,
    productName: 'MacBook Air M2 512GB',
    productImage: 'https://picsum.photos/100/100?random=2',
    price: 8999,
    quantity: 1,
    totalAmount: 8999,
    status: 'shipped',
    buyerId: 1,
    sellerId: 3,
    createdAt: '2024-01-20T14:20:00Z',
    paidAt: '2024-01-20T14:25:00Z',
  },
  {
    id: 3,
    orderNo: 'PO202401030003',
    productId: 3,
    productName: 'AirPods Pro 2',
    productImage: 'https://picsum.photos/100/100?random=3',
    price: 1299,
    quantity: 1,
    totalAmount: 1299,
    status: 'pending',
    buyerId: 1,
    sellerId: 4,
    createdAt: '2024-01-25T09:15:00Z',
  },
];

const Purchases: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPurchases(mockPurchases);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = activeTab === 'all'
    ? purchases
    : purchases.filter((p) => p.status === activeTab);

  const columns: ColumnsType<Order> = [
    {
      title: '商品信息',
      key: 'product',
      render: (_, record) => (
        <div className={styles.productInfo}>
          <Image
            src={record.productImage}
            width={80}
            height={80}
            className={styles.productImage}
            preview={false}
          />
          <div className={styles.productDetails}>
            <div className={styles.productName}>{record.productName}</div>
            <div className={styles.orderNo}>订单号：{record.orderNo}</div>
          </div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => <span className={styles.price}>¥{price.toFixed(2)}</span>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: '实付款',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => (
        <span className={styles.totalAmount}>¥{amount.toFixed(2)}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div className={styles.actions}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/product/${record.productId}`)}
          >
            查看商品
          </Button>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => navigate(`/payment/${record.id}`)}
            >
              去支付
            </Button>
          )}
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待支付' },
    { key: 'paid', label: '待发货' },
    { key: 'shipped', label: '待收货' },
    { key: 'completed', label: '已完成' },
  ];

  return (
    <div className={styles.purchasesPage}>
      <div className={styles.container}>
        <Card title="购买记录" className={styles.purchasesCard}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />

          {filteredPurchases.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredPurchases}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          ) : (
            <Empty
              description="暂无购买记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Purchases;
