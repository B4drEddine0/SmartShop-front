import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useAuth } from '@/hooks/useAuth';
import { Sun, Moon, LogOut, User, Menu, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuClick: () => void;
}

const routeNames: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/my-dashboard': 'My Dashboard',
  '/app/clients': 'Clients',
  '/app/products': 'Products',
  '/app/orders': 'Orders',
  '/app/payments': 'Payments',
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { isDark, toggle } = useThemeStore();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [];
  let accumulatedPath = '';
  for (const segment of pathSegments) {
    accumulatedPath += `/${segment}`;
    const name = routeNames[accumulatedPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label: name, path: accumulatedPath });
  }

  return (
    <header className="h-16 border-b border-border-light dark:border-border-dark bg-bg-card-light/80 dark:bg-bg-secondary/80 glass sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          <Link to="/" className="text-text-muted hover:text-text-secondary">
            Home
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              {i === breadcrumbs.length - 1 ? (
                <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.path} className="text-text-muted hover:text-text-secondary">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Theme toggle + User */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary border border-border-light dark:border-border-dark"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-bg-light dark:hover:bg-bg-tertiary border border-border-light dark:border-border-dark"
          >
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark leading-tight">
                {user?.username}
              </p>
              <p className="text-xs text-text-muted">{user?.role}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-secondary shadow-xl py-1 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-border-light dark:border-border-dark">
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  {user?.username}
                </p>
                <p className="text-xs text-text-muted">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10'
                )}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
