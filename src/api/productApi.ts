import api from './axiosConfig';
import type { ProductRequest, ProductResponse, Page } from '@/types/product';

export const productApi = {
  getAll: (page: number = 0, size: number = 10) =>
    api.get<Page<ProductResponse>>('/products', { params: { page, size } }).then((r) => r.data),

  getById: (id: number) =>
    api.get<ProductResponse>(`/products/${id}`).then((r) => r.data),

  create: (data: ProductRequest) =>
    api.post<ProductResponse>('/products', data).then((r) => r.data),

  update: (id: number, data: ProductRequest) =>
    api.put<ProductResponse>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/products/${id}`).then((r) => r.data),
};
