import type { CustomerTier } from './enums';

export interface ClientRequest {
  nom: string;
  email: string;
  telephone: string;
  adresse?: string;
  username: string;
  password: string;
}

export interface ClientResponse {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  tier: CustomerTier;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
}
