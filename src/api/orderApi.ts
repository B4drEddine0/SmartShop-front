import api from './axiosConfig';
import type { OrderRequest, OrderResponse } from '@/types/order';

export const orderApi = {
  getAll: () =>
    api.get<OrderResponse[]>('/orders').then((r) => r.data),

  getById: (id: number) =>
    api.get<OrderResponse>(`/orders/${id}`).then((r) => r.data),

  create: (data: OrderRequest) =>
    api.post<OrderResponse>('/orders', data).then((r) => r.data),

  confirm: (id: number) =>
    api.put<OrderResponse>(`/orders/${id}/confirm`).then((r) => r.data),

  cancel: (id: number) =>
    api.put<OrderResponse>(`/orders/${id}/cancel`).then((r) => r.data),
};
