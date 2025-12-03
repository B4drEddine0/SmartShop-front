import api from './axiosConfig';
import type { ClientRequest, ClientResponse } from '@/types/client';
import type { OrderResponse } from '@/types/order';

export const clientApi = {
  getAll: () =>
    api.get<ClientResponse[]>('/clients').then((r) => r.data),

  getById: (id: number) =>
    api.get<ClientResponse>(`/clients/${id}`).then((r) => r.data),

  create: (data: ClientRequest) =>
    api.post<ClientResponse>('/clients', data).then((r) => r.data),

  update: (id: number, data: ClientRequest) =>
    api.put<ClientResponse>(`/clients/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/clients/${id}`).then((r) => r.data),

  getOrders: (id: number) =>
    api.get<OrderResponse[]>(`/clients/${id}/orders`).then((r) => r.data),
};
