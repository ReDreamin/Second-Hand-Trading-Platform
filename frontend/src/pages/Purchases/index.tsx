import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Empty, Image, Tabs, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';
import type { Order, OrderStatus } from '../../types';
import { getMyOrders, cancelOrder } from '../../api/order';
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
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

const Purchases: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchPurchases();
  }, [activeTab, page]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params: { page: number; pageSize: number; status?: string } = {
        page,
        pageSize,
      };
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const response = await getMyOrders(params);
      if (response.data.code === 200) {
        const data = response.data.data;
        setPurchases(data.content || []);
        setTotal(data.totalElements || 0);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      message.success('订单已取消');
      fetchPurchases();
    } catch (error) {
      console.error('取消订单失败:', error);
    }
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
      width: 180,
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
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => navigate(`/payment/${record.id}`)}
              >
                去支付
              </Button>
              <Button
                size="small"
                danger
                onClick={() => handleCancelOrder(record.id)}
              >
                取消
              </Button>
            </>
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
            onChange={handleTabChange}
            items={tabItems}
          />

          {purchases.length > 0 ? (
            <Table
              columns={columns}
              dataSource={purchases}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showTotal: (total) => `共 ${total} 条记录`,
                onChange: (p) => setPage(p),
              }}
            />
          ) : (
            <Empty
              description={loading ? '加载中...' : '暂无购买记录'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Purchases;
