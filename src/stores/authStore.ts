import { create } from 'zustand';
import type { SessionUser } from '@/types/auth';

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: SessionUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));
