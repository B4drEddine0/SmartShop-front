import { useEffect, useState, useMemo } from 'react';
import { orderApi } from '@/api/orderApi';
import { paymentApi } from '@/api/paymentApi';
import type { PaymentResponse } from '@/types/payment';
import type { OrderResponse } from '@/types/order';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatCurrency, formatDateTime, getErrorMessage } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { PaymentStatus } from '@/types/enums';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [encashPayment, setEncashPayment] = useState<PaymentResponse | null>(null);
  const [rejectPayment, setRejectPayment] = useState<PaymentResponse | null>(null);

  const fetchPayments = async () => {
    try {
      // We need to get all orders first, then get payments for each
      const orders: OrderResponse[] = await orderApi.getAll();
      const allPayments: PaymentResponse[] = [];
      for (const order of orders) {
        try {
          const p = await paymentApi.getByOrderId(order.id);
          allPayments.push(...p);
        } catch {
          // skip
        }
      }
      setPayments(allPayments.sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime()));
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const filteredPayments = useMemo(() => {
    if (statusFilter === 'ALL') return payments;
    return payments.filter((p) => p.status === statusFilter);
  }, [payments, statusFilter]);

  const handleEncash = async () => {
    if (!encashPayment) return;
    try {
      await paymentApi.updateStatus(encashPayment.id, {
        status: 'ENCAISSE',
        dateEncaissement: new Date().toISOString().split('T')[0],
      });
      toast.success('Payment marked as cashed');
      setEncashPayment(null);
      fetchPayments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async () => {
    if (!rejectPayment) return;
    try {
      await paymentApi.updateStatus(rejectPayment.id, { status: 'REJETE' });
      toast.success('Payment marked as rejected');
      setRejectPayment(null);
      fetchPayments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns: ColumnDef<PaymentResponse, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className="font-mono text-xs text-text-muted">#{row.original.id}</span>,
        size: 60,
      },
      {
        accessorKey: 'orderId',
        header: 'Order',
        cell: ({ row }) => (
          <a href={`/app/orders/${row.original.orderId}`} className="font-mono text-xs text-primary hover:underline">
            #{row.original.orderId}
          </a>
        ),
      },
      {
        accessorKey: 'numeroPaiement',
        header: '#',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.numeroPaiement}</span>,
        size: 50,
      },
      {
        accessorKey: 'montant',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">{formatCurrency(row.original.montant)}</span>
        ),
      },
      {
        accessorKey: 'typePaiement',
        header: 'Method',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">{PAYMENT_METHOD_LABELS[row.original.typePaiement]}</span>
        ),
      },
      {
        accessorKey: 'datePaiement',
        header: 'Date',
        cell: ({ row }) => <span className="text-xs text-text-secondary">{formatDateTime(row.original.datePaiement)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} type="payment" />,
      },
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-text-muted">{row.original.reference || '—'}</span>
        ),
      },
      {
        accessorKey: 'banque',
        header: 'Bank',
        cell: ({ row }) => <span className="text-xs text-text-secondary">{row.original.banque || '—'}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          if (row.original.status !== 'EN_ATTENTE') return null;
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEncashPayment(row.original)}
                className="p-1.5 rounded-md text-success hover:bg-success/10"
                title="Mark as cashed"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setRejectPayment(row.original)}
                className="p-1.5 rounded-md text-danger hover:bg-danger/10"
                title="Mark as rejected"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
        size: 80,
      },
    ],
    []
  );

  const statuses: (PaymentStatus | 'ALL')[] = ['ALL', 'EN_ATTENTE', 'ENCAISSE', 'REJETE'];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Payments</h1>
        <TableSkeleton rows={6} cols={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Payments</h1>

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
            {status === 'ALL' ? 'All' : status === 'EN_ATTENTE' ? 'Pending' : status === 'ENCAISSE' ? 'Cashed' : 'Rejected'}
          </button>
        ))}
      </div>

      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-16 h-16 stroke-1" />}
          title="No payments found"
          description={statusFilter !== 'ALL' ? `No ${statusFilter} payments.` : 'No payments registered yet.'}
        />
      ) : (
        <DataTable
          data={filteredPayments}
          columns={columns}
          searchColumn="reference"
          searchPlaceholder="Search by reference..."
        />
      )}

      {/* Encash Confirm */}
      <ConfirmDialog
        open={!!encashPayment}
        onClose={() => setEncashPayment(null)}
        onConfirm={handleEncash}
        title="Encash Payment"
        description={`Mark payment #${encashPayment?.id} (${encashPayment ? formatCurrency(encashPayment.montant) : ''}) as cashed?`}
        confirmText="Encash"
        variant="warning"
      />

      {/* Reject Confirm */}
      <ConfirmDialog
        open={!!rejectPayment}
        onClose={() => setRejectPayment(null)}
        onConfirm={handleReject}
        title="Reject Payment"
        description={`Reject payment #${rejectPayment?.id} (${rejectPayment ? formatCurrency(rejectPayment.montant) : ''})?`}
        confirmText="Reject"
        variant="danger"
      />
    </div>
  );
}
