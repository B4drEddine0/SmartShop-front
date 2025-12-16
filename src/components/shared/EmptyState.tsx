import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="mb-4 text-text-muted">
        {icon || <PackageOpen className="w-16 h-16 stroke-1" />}
      </div>
      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary mb-4 max-w-sm text-center">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
