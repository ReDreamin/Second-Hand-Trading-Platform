import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Radio, Space, Spin, Result, Descriptions, message } from 'antd';
import {
  ArrowLeftOutlined,
  AlipayCircleOutlined,
  WechatOutlined,
  WalletOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { getOrderDetail, payOrder } from '../../api/order';
import type { Order } from '../../types';
import styles from './index.module.css';

type PaymentMethod = 'alipay' | 'wechat' | 'balance';

const Payment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('alipay');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const response = await getOrderDetail(parseInt(id));
      if (response.data.code === 200) {
        setOrder(response.data.data);
      } else {
        message.error('获取订单信息失败');
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!order) return;

    setPaying(true);
    try {
      const response = await payOrder({
        orderId: order.id,
        paymentMethod,
      });
      if (response.data.code === 200) {
        setPaymentSuccess(true);
        message.success('支付成功');
      }
    } catch (error) {
      console.error('支付失败:', error);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <Result
          status="error"
          title="订单不存在"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className={styles.paymentPage}>
        <div className={styles.container}>
          <Result
            icon={<CheckCircleOutlined style={{ color: 'var(--color-success)' }} />}
            status="success"
            title="支付成功"
            subTitle={`订单号: ${order.orderNo}`}
            extra={[
              <Button type="primary" key="home" onClick={() => navigate('/')}>
                继续购物
              </Button>,
              <Button key="orders" onClick={() => navigate('/purchases')}>
                查看购买记录
              </Button>,
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paymentPage}>
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
          {/* 订单信息 */}
          <Card title="订单信息" className={styles.orderCard}>
            <div className={styles.productInfo}>
              <img
                src={order.productImage || '/placeholder.png'}
                alt={order.productName}
                className={styles.productImage}
              />
              <div className={styles.productDetail}>
                <h3>{order.productName}</h3>
                <p>单价: ¥{order.price.toFixed(2)}</p>
                <p>数量: {order.quantity}</p>
              </div>
            </div>

            <Descriptions column={1} className={styles.orderInfo}>
              <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {new Date(order.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div className={styles.totalRow}>
              <span>应付金额</span>
              <span className={styles.totalAmount}>¥{order.totalAmount.toFixed(2)}</span>
            </div>
          </Card>

          {/* 支付方式 */}
          <Card title="选择支付方式" className={styles.paymentCard}>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={styles.paymentMethods}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="alipay" className={styles.paymentOption}>
                  <div className={styles.paymentLabel}>
                    <AlipayCircleOutlined
                      style={{ fontSize: 24, color: '#1677ff' }}
                    />
                    <span>支付宝</span>
                  </div>
                </Radio>

                <Radio value="wechat" className={styles.paymentOption}>
                  <div className={styles.paymentLabel}>
                    <WechatOutlined style={{ fontSize: 24, color: '#07c160' }} />
                    <span>微信支付</span>
                  </div>
                </Radio>

                <Radio value="balance" className={styles.paymentOption}>
                  <div className={styles.paymentLabel}>
                    <WalletOutlined
                      style={{ fontSize: 24, color: 'var(--color-primary)' }}
                    />
                    <span>余额支付</span>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>

            <Button
              type="primary"
              size="large"
              block
              loading={paying}
              onClick={handlePay}
              className={styles.payBtn}
            >
              确认支付 ¥{order.totalAmount.toFixed(2)}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
