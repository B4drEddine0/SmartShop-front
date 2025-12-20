import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientApi } from '@/api/clientApi';
import type { ClientResponse } from '@/types/client';
import type { OrderResponse } from '@/types/order';
import { TierBadge } from '@/components/shared/TierBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TierProgress } from '@/components/clients/TierProgress';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { TIER_DISCOUNTS } from '@/lib/constants';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const [c, o] = await Promise.all([
          clientApi.getById(Number(id)),
          clientApi.getOrders(Number(id)),
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
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!client) {
    return <div className="text-text-secondary">Client not found.</div>;
  }

  const discount = TIER_DISCOUNTS[client.tier];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app/clients"
          className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {client.nom}
            </h1>
            <TierBadge tier={client.tier} size="md" />
          </div>
          <p className="text-sm text-text-secondary mt-0.5">Client #{client.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm text-text-primary-light dark:text-text-primary-dark">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-text-muted flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm font-mono text-text-primary-light dark:text-text-primary-dark">{client.telephone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Address</p>
                  <p className="text-sm text-text-primary-light dark:text-text-primary-dark">{client.adresse || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-4">
              <ShoppingCart className="w-4 h-4 text-accent mb-2" />
              <p className="text-xs text-text-muted">Total Orders</p>
              <p className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{client.totalOrders}</p>
            </div>
            <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-4">
              <DollarSign className="w-4 h-4 text-success mb-2" />
              <p className="text-xs text-text-muted">Total Spent</p>
              <CurrencyDisplay amount={client.totalSpent} size="sm" className="text-text-primary-light dark:text-text-primary-dark" />
            </div>
            <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-4">
              <Calendar className="w-4 h-4 text-info mb-2" />
              <p className="text-xs text-text-muted">First Order</p>
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">{formatDate(client.firstOrderDate)}</p>
            </div>
            <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-4">
              <Calendar className="w-4 h-4 text-primary mb-2" />
              <p className="text-xs text-text-muted">Last Order</p>
              <p className="text-sm text-text-primary-light dark:text-text-primary-dark">{formatDate(client.lastOrderDate)}</p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
              Order History ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No orders yet.</p>
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
                      <th className="pb-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border-light dark:border-border-dark last:border-0">
                        <td className="py-2.5 font-mono text-xs">#{order.id}</td>
                        <td className="py-2.5 text-text-secondary text-xs">{formatDateTime(order.dateCreation)}</td>
                        <td className="py-2.5 text-right font-mono text-xs">{formatCurrency(order.totalTtc)}</td>
                        <td className="py-2.5 text-right font-mono text-xs">{formatCurrency(order.montantRestant)}</td>
                        <td className="py-2.5"><StatusBadge status={order.status} type="order" /></td>
                        <td className="py-2.5">
                          <Link to={`/app/orders/${order.id}`} className="text-xs text-primary hover:underline">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Tier */}
        <div className="space-y-6">
          {/* Tier Card */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <TierBadge tier={client.tier} size="lg" className="mb-4" />
            <div className="text-sm text-text-secondary space-y-1">
              <p>Discount: <strong className="text-text-primary-light dark:text-text-primary-dark">{discount.percentage}%</strong></p>
              {discount.minSubtotal > 0 && (
                <p className="text-xs text-text-muted">Min. subtotal: {formatCurrency(discount.minSubtotal)}</p>
              )}
            </div>
          </div>

          {/* Tier Progress */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <TierProgress client={client} />
          </div>
        </div>
      </div>
    </div>
  );
}
