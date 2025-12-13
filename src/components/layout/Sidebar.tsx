import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  clientOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, adminOnly: true },
  { label: 'My Dashboard', path: '/app/my-dashboard', icon: <LayoutDashboard className="w-5 h-5" />, clientOnly: true },
  { label: 'Clients', path: '/app/clients', icon: <Users className="w-5 h-5" />, adminOnly: true },
  { label: 'Products', path: '/app/products', icon: <Package className="w-5 h-5" /> },
  { label: 'Orders', path: '/app/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { label: 'Payments', path: '/app/payments', icon: <CreditCard className="w-5 h-5" />, adminOnly: true },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.clientOnly && isAdmin) return false;
    return true;
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col border-r border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-secondary transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border-light dark:border-border-dark">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            SmartShop
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-border-light dark:border-border-dark">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
