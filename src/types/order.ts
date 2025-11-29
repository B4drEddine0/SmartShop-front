import type { OrderStatus } from './enums';

export interface OrderItemRequest {
  productId: number;
  quantite: number;
}

export interface OrderRequest {
  clientId: number;
  items: OrderItemRequest[];
  codePromo?: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productNom: string;
  quantite: number;
  prixUnitaire: number;
  totalLigne: number;
}

export interface OrderResponse {
  id: number;
  clientId: number;
  clientNom: string;
  dateCreation: string;
  sousTotal: number;
  montantRemise: number;
  montantHtApresRemise: number;
  tva: number;
  totalTtc: number;
  montantRestant: number;
  codePromo: string | null;
  status: OrderStatus;
  items: OrderItemResponse[];
}
