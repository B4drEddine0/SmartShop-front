import { cn } from '@/lib/utils';
import type { OrderStatus, PaymentStatus } from '@/types/enums';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/constants';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
  type: 'order' | 'payment';
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const colors = type === 'order' ? ORDER_STATUS_COLORS : PAYMENT_STATUS_COLORS;
  const labels = type === 'order' ? ORDER_STATUS_LABELS : PAYMENT_STATUS_LABELS;
  const color = colors[status as keyof typeof colors];
  const label = labels[status as keyof typeof labels];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
        className
      )}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
