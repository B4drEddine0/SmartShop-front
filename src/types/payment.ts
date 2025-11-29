import type { PaymentMethod, PaymentStatus } from './enums';

export interface PaymentRequest {
  orderId: number;
  montant: number;
  typePaiement: PaymentMethod;
  status?: PaymentStatus;
  reference?: string;
  banque?: string;
  dateEcheance?: string;
  dateEncaissement?: string;
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
  dateEncaissement?: string;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  numeroPaiement: number;
  montant: number;
  typePaiement: PaymentMethod;
  datePaiement: string;
  dateEncaissement: string | null;
  status: PaymentStatus;
  reference: string;
  banque: string | null;
  dateEcheance: string | null;
}
