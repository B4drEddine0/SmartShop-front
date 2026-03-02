import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Wait for zustand-persist to finish reading localStorage before evaluating the guard.
  // Without this, isAuthenticated is always false on first render → redirect to login.
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-primary">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - always visible on desktop */}
      <div className={cn('hidden md:block')}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Sidebar - mobile drawer */}
      <div
        className={cn(
          'md:hidden fixed z-40 transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-200',
          sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[240px]'
        )}
      >
        <TopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="p-4 md:p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
