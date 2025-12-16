import { cn } from '@/lib/utils';
import type { CustomerTier } from '@/types/enums';
import { TIER_COLORS, TIER_LABELS } from '@/lib/constants';

interface TierBadgeProps {
  tier: CustomerTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
  const color = TIER_COLORS[tier];
  const label = TIER_LABELS[tier];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        sizeClasses[size],
        className
      )}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
