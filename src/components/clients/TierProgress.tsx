import { TIER_THRESHOLDS, TIER_COLORS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { ClientResponse } from '@/types/client';
import type { CustomerTier } from '@/types/enums';

interface TierProgressProps {
  client: ClientResponse;
}

export function TierProgress({ client }: TierProgressProps) {
  const tiers: CustomerTier[] = ['BASIC', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentIndex = tiers.indexOf(client.tier);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
        Loyalty Tier Progress
      </h4>

      {/* Tier timeline */}
      <div className="flex items-center gap-1">
        {tiers.map((tier, i) => (
          <div key={tier} className="flex-1 flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1"
              style={{
                backgroundColor: i <= currentIndex ? TIER_COLORS[tier] : 'transparent',
                color: i <= currentIndex ? '#fff' : TIER_COLORS[tier],
                border: `2px solid ${TIER_COLORS[tier]}`,
              }}
            >
              {tier[0]}
            </div>
            <span className="text-[10px] text-text-secondary">{tier}</span>
            {i < tiers.length - 1 && (
              <div
                className="absolute"
                style={{
                  left: `${((i + 0.5) / tiers.length) * 100}%`,
                  width: `${(1 / tiers.length) * 100}%`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Next tier info */}
      {currentIndex < tiers.length - 1 && (
        <div className="space-y-3 mt-4">
          {(['SILVER', 'GOLD', 'PLATINUM'] as const).map((tier) => {
            const threshold = TIER_THRESHOLDS[tier];
            const reached = tiers.indexOf(tier) <= currentIndex;
            return (
              <div key={tier} className="flex justify-between text-xs">
                <span
                  className="font-medium"
                  style={{ color: reached ? TIER_COLORS[tier] : '#6B6B6B' }}
                >
                  {tier}: {threshold.orders} orders OR {formatCurrency(threshold.spent)}
                </span>
                {reached && (
                  <span style={{ color: TIER_COLORS[tier] }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
