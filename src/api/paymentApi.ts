import api from './axiosConfig';
import type { PaymentRequest, PaymentResponse, UpdatePaymentStatusRequest } from '@/types/payment';

export const paymentApi = {
  getByOrderId: (orderId: number) =>
    api.get<PaymentResponse[]>(`/payments/order/${orderId}`).then((r) => r.data),

  getById: (id: number) =>
    api.get<PaymentResponse>(`/payments/${id}`).then((r) => r.data),

  create: (data: PaymentRequest) =>
    api.post<PaymentResponse>('/payments', data).then((r) => r.data),

  updateStatus: (id: number, data: UpdatePaymentStatusRequest) =>
    api.put<PaymentResponse>(`/payments/${id}`, data).then((r) => r.data),
};
