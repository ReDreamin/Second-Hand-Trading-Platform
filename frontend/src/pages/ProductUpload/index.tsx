import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Card,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { createProduct, uploadProductImage } from '../../api/product';
import type { ProductCreateRequest } from '../../types';
import { CategoryLabels } from '../../types';
import styles from './index.module.css';

const { TextArea } = Input;

const categoryOptions = Object.entries(CategoryLabels).map(([value, label]) => ({
  value,
  label,
}));

const ProductUpload: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // 自定义上传处理
  const customUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      const response = await uploadProductImage(file as File);
      const url = response.data.data.url;
      setImageUrls((prev) => [...prev, url]);
      onSuccess?.(response.data);
    } catch (error) {
      onError?.(error as Error);
      message.error('图片上传失败');
    }
  };

  // 处理文件列表变化
  const handleFileChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 删除图片
  const handleRemove = (file: UploadFile) => {
    const index = fileList.indexOf(file);
    if (index > -1) {
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
    }
    return true;
  };

  // 提交表单
  const handleSubmit = async (values: Omit<ProductCreateRequest, 'images'>) => {
    if (imageUrls.length === 0) {
      message.warning('请至少上传一张商品图片');
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        ...values,
        images: imageUrls,
      });
      message.success('商品发布成功');
      navigate('/my-products');
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <div className={styles.uploadPage}>
      <div className={styles.container}>
        <Card
          title={
            <div className={styles.cardTitle}>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              />
              <span>发布商品</span>
            </div>
          }
          className={styles.card}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="name"
              label="商品名称"
              rules={[{ required: true, message: '请输入商品名称' }]}
            >
              <Input placeholder="请输入商品名称" maxLength={50} showCount />
            </Form.Item>

            <Form.Item
              name="category"
              label="商品类型"
              rules={[{ required: true, message: '请选择商品类型' }]}
            >
              <Select
                placeholder="请选择商品类型"
                options={categoryOptions}
              />
            </Form.Item>

            <div className={styles.row}>
              <Form.Item
                name="price"
                label="商品价格"
                rules={[{ required: true, message: '请输入商品价格' }]}
                className={styles.halfItem}
              >
                <InputNumber
                  placeholder="请输入价格"
                  min={0.01}
                  precision={2}
                  prefix="¥"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="stock"
                label="商品余量"
                rules={[{ required: true, message: '请输入商品余量' }]}
                className={styles.halfItem}
              >
                <InputNumber
                  placeholder="请输入余量"
                  min={1}
                  precision={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label="商品描述"
              rules={[{ required: true, message: '请输入商品描述' }]}
            >
              <TextArea
                placeholder="请详细描述商品信息，如成色、使用时长等"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="商品图片"
              required
              extra="最多上传5张图片，第一张为封面图"
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                customRequest={customUpload}
                onChange={handleFileChange}
                onRemove={handleRemove}
                accept="image/*"
                maxCount={5}
              >
                {fileList.length >= 5 ? null : uploadButton}
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                发布商品
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ProductUpload;
