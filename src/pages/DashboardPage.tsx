import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientApi } from '@/api/clientApi';
import { orderApi } from '@/api/orderApi';
import type { ClientResponse } from '@/types/client';
import type { OrderResponse } from '@/types/order';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import {
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  Plus,
  UserPlus,
  Package,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ORDER_STATUS_COLORS } from '@/lib/constants';
import type { OrderStatus } from '@/types/enums';

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [c, o] = await Promise.all([clientApi.getAll(), orderApi.getAll()]);
        setClients(c);
        setOrders(o);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const totalClients = clients.length;
  const totalOrders = orders.length;
  const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED');
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.totalTtc, 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;

  // Pie chart data
  const statusCounts: Record<OrderStatus, number> = { PENDING: 0, CONFIRMED: 0, CANCELED: 0, REJECTED: 0 };
  orders.forEach((o) => { statusCounts[o.status]++; });
  const pieData = (Object.keys(statusCounts) as OrderStatus[]).map((status) => ({
    name: status,
    value: statusCounts[status],
    color: ORDER_STATUS_COLORS[status],
  }));

  // Top 5 clients by spent
  const topClients = [...clients]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map((c) => ({ name: c.nom.length > 15 ? c.nom.slice(0, 15) + '…' : c.nom, spent: c.totalSpent }));

  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
    .slice(0, 8);

  const kpis = [
    { label: 'Total Clients', value: totalClients, icon: <Users className="w-5 h-5" />, color: '#9B5DE5' },
    { label: 'Total Orders', value: totalOrders, icon: <ShoppingCart className="w-5 h-5" />, color: '#F4A261' },
    { label: 'Revenue', value: formatCurrency(totalRevenue), icon: <DollarSign className="w-5 h-5" />, color: '#D4A017' },
    { label: 'Pending Orders', value: pendingOrders, icon: <Clock className="w-5 h-5" />, color: '#E63946' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/app/orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" /> New Order
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-secondary">{kpi.label}</span>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}
              >
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
            Order Status Distribution
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-dark)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary-dark)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-text-secondary">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
            Top 5 Clients by Revenue
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topClients} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#A3A3A3' }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-dark)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary-dark)',
                  }}
                />
                <Bar dataKey="spent" fill="#E63946" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/app/orders/new"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-bg-light dark:hover:bg-bg-tertiary text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
            >
              <ShoppingCart className="w-4 h-4 text-primary" />
              Create Order
            </Link>
            <Link
              to="/app/clients"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-bg-light dark:hover:bg-bg-tertiary text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
            >
              <UserPlus className="w-4 h-4 text-info" />
              Add Client
            </Link>
            <Link
              to="/app/products"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-bg-light dark:hover:bg-bg-tertiary text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
            >
              <Package className="w-4 h-4 text-accent" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
              Recent Orders
            </h3>
            <Link to="/app/orders" className="text-xs text-primary hover:text-primary-hover font-medium">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-secondary border-b border-border-light dark:border-border-dark">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border-light dark:border-border-dark last:border-0"
                  >
                    <td className="py-2.5">
                      <Link to={`/app/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="py-2.5 text-text-primary-light dark:text-text-primary-dark">
                      {order.clientNom}
                    </td>
                    <td className="py-2.5 text-text-secondary text-xs">
                      {formatDateTime(order.dateCreation)}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-text-primary-light dark:text-text-primary-dark">
                      {formatCurrency(order.totalTtc)}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
