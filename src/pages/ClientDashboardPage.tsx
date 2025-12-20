import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { clientApi } from '@/api/clientApi';
import type { ClientResponse } from '@/types/client';
import type { OrderResponse } from '@/types/order';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { TierBadge } from '@/components/shared/TierBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { TIER_THRESHOLDS, TIER_COLORS } from '@/lib/constants';
import type { CustomerTier } from '@/types/enums';
import { ShoppingCart, DollarSign, Award, TrendingUp } from 'lucide-react';

export default function ClientDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.clientId) return;
    async function fetchData() {
      try {
        const [c, o] = await Promise.all([
          clientApi.getById(user!.clientId!),
          clientApi.getOrders(user!.clientId!),
        ]);
        setClient(c);
        setOrders(o);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!client) return <div className="text-text-secondary">Could not load your profile.</div>;

  // Tier progress
  const tiers: CustomerTier[] = ['BASIC', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentTierIndex = tiers.indexOf(client.tier);
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS] : null;

  const orderProgress = nextThreshold ? Math.min(100, (client.totalOrders / nextThreshold.orders) * 100) : 100;
  const spentProgress = nextThreshold ? Math.min(100, (client.totalSpent / nextThreshold.spent) * 100) : 100;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Welcome, {client.nom}
          </h1>
          <p className="text-sm text-text-secondary mt-1">Here&apos;s your account overview</p>
        </div>
        <TierBadge tier={client.tier} size="lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">Total Orders</span>
            <ShoppingCart className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{client.totalOrders}</p>
        </div>
        <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">Total Spent</span>
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <p className="text-2xl font-bold font-mono text-text-primary-light dark:text-text-primary-dark">
            {formatCurrency(client.totalSpent)}
          </p>
        </div>
        <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">Loyalty Tier</span>
            <Award className="w-5 h-5" style={{ color: TIER_COLORS[client.tier] }} />
          </div>
          <TierBadge tier={client.tier} size="md" />
        </div>
      </div>

      {/* Tier Progress */}
      {nextTier && nextThreshold && (
        <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-info" />
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
              Progress to {nextTier}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                <span>Orders: {client.totalOrders} / {nextThreshold.orders}</span>
                <span>{Math.round(orderProgress)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-bg-tertiary dark:bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${orderProgress}%`,
                    backgroundColor: TIER_COLORS[nextTier as CustomerTier],
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                <span>Spent: {formatCurrency(client.totalSpent)} / {formatCurrency(nextThreshold.spent)}</span>
                <span>{Math.round(spentProgress)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-bg-tertiary dark:bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${spentProgress}%`,
                    backgroundColor: TIER_COLORS[nextTier as CustomerTier],
                  }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-3">
            Reach <strong>{nextThreshold.orders} orders</strong> OR <strong>{formatCurrency(nextThreshold.spent)}</strong> total spent to unlock {nextTier} tier.
          </p>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
          Recent Orders
        </h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-secondary border-b border-border-light dark:border-border-dark">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Total TTC</th>
                  <th className="pb-2 font-medium text-right">Remaining</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border-light dark:border-border-dark last:border-0">
                    <td className="py-2.5">
                      <Link to={`/app/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="py-2.5 text-text-secondary text-xs">{formatDateTime(order.dateCreation)}</td>
                    <td className="py-2.5 text-right font-mono text-xs">{formatCurrency(order.totalTtc)}</td>
                    <td className="py-2.5 text-right font-mono text-xs">{formatCurrency(order.montantRestant)}</td>
                    <td className="py-2.5"><StatusBadge status={order.status} type="order" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
