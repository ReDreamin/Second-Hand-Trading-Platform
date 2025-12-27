import request from './index';
import type {
  Product,
  ProductCreateRequest,
  ProductListParams,
  ProductListResponse,
  ApiResponse,
} from '../types';

// 获取商品列表
export const getProductList = (params?: ProductListParams) => {
  return request.get<ApiResponse<ProductListResponse>>('/products', { params });
};

// 获取商品详情
export const getProductDetail = (id: number) => {
  return request.get<ApiResponse<Product>>(`/products/${id}`);
};

// 创建商品（上架）
export const createProduct = (data: ProductCreateRequest) => {
  return request.post<ApiResponse<Product>>('/products', data);
};

// 更新商品
export const updateProduct = (id: number, data: Partial<ProductCreateRequest>) => {
  return request.put<ApiResponse<Product>>(`/products/${id}`, data);
};

// 删除商品（下架）
export const deleteProduct = (id: number) => {
  return request.delete<ApiResponse<void>>(`/products/${id}`);
};

// 获取我的商品列表
export const getMyProducts = (params?: ProductListParams) => {
  return request.get<ApiResponse<ProductListResponse>>('/products/my', { params });
};

// 上传商品图片
export const uploadProductImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<ApiResponse<{ url: string }>>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
