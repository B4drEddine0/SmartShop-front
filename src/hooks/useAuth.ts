import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';
import type { LoginRequest } from '@/types/auth';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const sessionUser = await authApi.me();
      setUser(sessionUser);
    } catch {
      setUser(null);
    }
  }, [setUser, setLoading]);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      const sessionUser = await authApi.login(data);
      setUser(sessionUser);
      toast.success(`Welcome back, ${sessionUser.username}!`);
      if (sessionUser.role === 'ADMIN') {
        navigate('/app/dashboard');
      } else {
        navigate('/app/my-dashboard');
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Invalid credentials');
      throw error;
    }
  }, [setUser, navigate]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  const isAdmin = user?.role === 'ADMIN';
  const isClient = user?.role === 'CLIENT';

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isClient,
    login,
    logout,
    checkSession,
  };
}
