import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CurrencyDisplay({ amount, className, size = 'md' }: CurrencyDisplayProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
    xl: 'text-2xl font-bold',
  };

  return (
    <span className={cn('font-mono tabular-nums', sizes[size], className)}>
      {formatCurrency(amount)}
    </span>
  );
}
