import type { CustomerTier, OrderStatus, PaymentStatus, PaymentMethod } from '@/types/enums';

export const TIER_COLORS: Record<CustomerTier, string> = {
  BASIC: '#A3A3A3',
  SILVER: '#C0C0C0',
  GOLD: '#D4A017',
  PLATINUM: '#9B5DE5',
};

export const TIER_LABELS: Record<CustomerTier, string> = {
  BASIC: 'Basic',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
};

export const TIER_THRESHOLDS = {
  SILVER: { orders: 3, spent: 1000 },
  GOLD: { orders: 10, spent: 5000 },
  PLATINUM: { orders: 20, spent: 15000 },
};

export const TIER_DISCOUNTS: Record<CustomerTier, { percentage: number; minSubtotal: number }> = {
  BASIC: { percentage: 0, minSubtotal: 0 },
  SILVER: { percentage: 5, minSubtotal: 500 },
  GOLD: { percentage: 10, minSubtotal: 800 },
  PLATINUM: { percentage: 15, minSubtotal: 1200 },
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#F4A261',
  CONFIRMED: '#D4A017',
  CANCELED: '#6B6B6B',
  REJECTED: '#E63946',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELED: 'Canceled',
  REJECTED: 'Rejected',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  EN_ATTENTE: '#F4A261',
  ENCAISSE: '#D4A017',
  REJETE: '#E63946',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  EN_ATTENTE: 'Pending',
  ENCAISSE: 'Cashed',
  REJETE: 'Rejected',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ESPECES: 'Cash',
  CHEQUE: 'Check',
  VIREMENT: 'Transfer',
};

export const TVA_RATE = 0.20;
export const PROMO_DISCOUNT_RATE = 0.05;
export const MAX_CASH_AMOUNT = 20000;
