import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Empty, Image, Tabs, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, SendOutlined } from '@ant-design/icons';
import type { Order, OrderStatus } from '../../types';
import { getMySalesOrders, shipOrder } from '../../api/order';
import styles from './index.module.css';

const API_BASE = 'http://localhost:8080';

const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
};

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

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, [activeTab, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: { page: number; pageSize: number; status?: string } = {
        page,
        pageSize,
      };
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const response = await getMySalesOrders(params);
      if (response.data.code === 200) {
        const data = response.data.data;
        setOrders(data.content || []);
        setTotal(data.totalElements || 0);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
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
        try {
          await shipOrder(order.id);
          message.success('发货成功');
          fetchOrders();
        } catch (error) {
          console.error('发货失败:', error);
        }
      },
    });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const columns: ColumnsType<Order> = [
    {
      title: '商品信息',
      key: 'product',
      render: (_, record) => (
        <div className={styles.productInfo}>
          <Image
            src={getImageUrl(record.productImage)}
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
      render: (price) => <span className={styles.price}>¥{price?.toFixed(2)}</span>,
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
            onChange={handleTabChange}
            items={tabItems}
          />

          {orders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showTotal: (total) => `共 ${total} 条订单`,
                onChange: (p) => setPage(p),
              }}
            />
          ) : (
            <Empty
              description={loading ? '加载中...' : '暂无订单'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Orders;
