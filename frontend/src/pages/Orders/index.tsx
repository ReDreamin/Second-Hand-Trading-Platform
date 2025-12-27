import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Empty, Image, Tabs, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, SendOutlined } from '@ant-design/icons';
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
  paid: '待发货',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

// Mock data - 作为卖家收到的订单
const mockOrders: Order[] = [
  {
    id: 101,
    orderNo: 'SO202401010001',
    productId: 10,
    productName: '二手 Switch OLED 白色',
    productImage: 'https://picsum.photos/100/100?random=10',
    price: 1899,
    quantity: 1,
    totalAmount: 1899,
    status: 'paid',
    buyerId: 5,
    sellerId: 1,
    createdAt: '2024-01-16T11:30:00Z',
    paidAt: '2024-01-16T11:35:00Z',
  },
  {
    id: 102,
    orderNo: 'SO202401020002',
    productId: 11,
    productName: '索尼 WH-1000XM5 降噪耳机',
    productImage: 'https://picsum.photos/100/100?random=11',
    price: 1999,
    quantity: 1,
    totalAmount: 1999,
    status: 'shipped',
    buyerId: 6,
    sellerId: 1,
    createdAt: '2024-01-18T09:20:00Z',
    paidAt: '2024-01-18T09:25:00Z',
  },
  {
    id: 103,
    orderNo: 'SO202401030003',
    productId: 12,
    productName: '小米 14 Pro 512GB',
    productImage: 'https://picsum.photos/100/100?random=12',
    price: 4299,
    quantity: 1,
    totalAmount: 4299,
    status: 'completed',
    buyerId: 7,
    sellerId: 1,
    createdAt: '2024-01-10T15:45:00Z',
    paidAt: '2024-01-10T15:50:00Z',
  },
];

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleShip = (order: Order) => {
    Modal.confirm({
      title: '确认发货',
      content: `确定要发货订单 ${order.orderNo} 吗？`,
      okText: '确认发货',
      cancelText: '取消',
      onOk: async () => {
        // TODO: Call API to ship order
        await new Promise((resolve) => setTimeout(resolve, 500));
        message.success('发货成功');
        setOrders(orders.map(o =>
          o.id === order.id ? { ...o, status: 'shipped' as OrderStatus } : o
        ));
      },
    });
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

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
      title: '订单金额',
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
      width: 150,
      render: (_, record) => (
        <div className={styles.actions}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/product/${record.productId}`)}
          >
            查看
          </Button>
          {record.status === 'paid' && (
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleShip(record)}
            >
              发货
            </Button>
          )}
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: '全部订单' },
    { key: 'pending', label: '待支付' },
    { key: 'paid', label: '待发货' },
    { key: 'shipped', label: '已发货' },
    { key: 'completed', label: '已完成' },
  ];

  // 统计数据
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className={styles.ordersPage}>
      <div className={styles.container}>
        {/* 统计卡片 */}
        <div className={styles.statsRow}>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>待支付</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{stats.paid}</div>
            <div className={styles.statLabel}>待发货</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{stats.shipped}</div>
            <div className={styles.statLabel}>已发货</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{stats.completed}</div>
            <div className={styles.statLabel}>已完成</div>
          </Card>
        </div>

        <Card title="订单管理" className={styles.ordersCard}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />

          {filteredOrders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredOrders}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条订单`,
              }}
            />
          ) : (
            <Empty
              description="暂无订单"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Orders;
