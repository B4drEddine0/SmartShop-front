import type { UserRole } from './enums';

export interface SessionUser {
  id: number;
  username: string;
  role: UserRole;
  clientId: number | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}
