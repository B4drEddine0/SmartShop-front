export interface ProductRequest {
  nom: string;
  description?: string;
  prixUnitaire: number;
  stock: number;
}

export interface ProductResponse {
  id: number;
  nom: string;
  description: string;
  prixUnitaire: number;
  stock: number;
}

export interface Page<T> {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  number: number;
  size: number;
  numberOfElements: number;
  empty: boolean;
}
