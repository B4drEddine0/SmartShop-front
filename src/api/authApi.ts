import api from './axiosConfig';
import type { LoginRequest, SessionUser } from '@/types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<SessionUser>('/auth/login', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  me: () =>
    api.get<SessionUser>('/auth/me').then((r) => r.data),
};
