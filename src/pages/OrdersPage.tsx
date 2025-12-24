import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '@/api/orderApi';
import { clientApi } from '@/api/clientApi';
import type { OrderResponse } from '@/types/order';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Plus, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { ColumnDef } from '@tanstack/react-table';
import type { OrderStatus } from '@/types/enums';

export default function OrdersPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    async function fetchData() {
      try {
        if (isAdmin) {
          const data = await orderApi.getAll();
          setOrders(data);
        } else if (user?.clientId) {
          const data = await clientApi.getOrders(user.clientId);
          setOrders(data);
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAdmin, user]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const columns: ColumnDef<OrderResponse, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Order',
        cell: ({ row }) => <span className="font-mono text-xs text-primary">#{row.original.id}</span>,
        size: 70,
      },
      {
        accessorKey: 'clientNom',
        header: 'Client',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
            {row.original.clientNom}
          </span>
        ),
      },
      {
        accessorKey: 'dateCreation',
        header: 'Date',
        cell: ({ row }) => <span className="text-text-secondary text-xs">{formatDateTime(row.original.dateCreation)}</span>,
      },
      {
        accessorKey: 'sousTotal',
        header: 'Subtotal',
        cell: ({ row }) => <span className="font-mono text-xs">{formatCurrency(row.original.sousTotal)}</span>,
      },
      {
        accessorKey: 'montantRemise',
        header: 'Discount',
        cell: ({ row }) => <span className="font-mono text-xs text-accent">{formatCurrency(row.original.montantRemise)}</span>,
      },
      {
        accessorKey: 'totalTtc',
        header: 'Total TTC',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
            {formatCurrency(row.original.totalTtc)}
          </span>
        ),
      },
      {
        accessorKey: 'montantRestant',
        header: 'Remaining',
        cell: ({ row }) => (
          <span className={`font-mono text-xs ${row.original.montantRestant > 0 ? 'text-accent' : 'text-success'}`}>
            {formatCurrency(row.original.montantRestant)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} type="order" />,
      },
    ],
    []
  );

  const statuses: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELED', 'REJECTED'];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Orders</h1>
        <TableSkeleton rows={6} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Orders</h1>
        {isAdmin && (
          <button
            onClick={() => navigate('/app/orders/new')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" /> Create Order
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              statusFilter === status
                ? 'bg-primary text-white border-primary'
                : 'border-border-light dark:border-border-dark text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary'
            }`}
          >
            {status === 'ALL' ? 'All' : status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-16 h-16 stroke-1" />}
          title="No orders found"
          description={statusFilter !== 'ALL' ? `No ${statusFilter} orders.` : 'Create your first order.'}
          action={
            isAdmin && statusFilter === 'ALL' ? (
              <button
                onClick={() => navigate('/app/orders/new')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover"
              >
                Create Order
              </button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          data={filteredOrders}
          columns={columns}
          searchColumn="clientNom"
          searchPlaceholder="Search by client name..."
          onRowClick={(order) => navigate(`/app/orders/${order.id}`)}
        />
      )}
    </div>
  );
}
