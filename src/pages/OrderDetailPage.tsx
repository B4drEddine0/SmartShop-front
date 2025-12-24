import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '@/api/orderApi';
import { paymentApi } from '@/api/paymentApi';
import type { OrderResponse } from '@/types/order';
import type { PaymentResponse } from '@/types/payment';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaymentList } from '@/components/payments/PaymentList';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency, formatDateTime, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [o, p] = await Promise.all([
        orderApi.getById(Number(id)),
        paymentApi.getByOrderId(Number(id)),
      ]);
      setOrder(o);
      setPayments(p);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAddPayment = async (data: {
    montant: number;
    typePaiement: 'ESPECES' | 'CHEQUE' | 'VIREMENT';
    status: 'EN_ATTENTE' | 'ENCAISSE' | 'REJETE';
    reference?: string;
    banque?: string;
    dateEcheance?: string;
    dateEncaissement?: string;
  }) => {
    await paymentApi.create({
      orderId: Number(id),
      montant: data.montant,
      typePaiement: data.typePaiement,
      status: data.status,
      reference: data.reference,
      banque: data.banque,
      dateEcheance: data.dateEcheance,
      dateEncaissement: data.dateEncaissement,
    });
    toast.success('Payment registered successfully');
    fetchData();
  };

  const handleConfirm = async () => {
    try {
      await orderApi.confirm(Number(id));
      toast.success('Order confirmed!');
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    try {
      await orderApi.cancel(Number(id));
      toast.success('Order canceled');
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!order) return <div className="text-text-secondary">Order not found.</div>;

  const isPending = order.status === 'PENDING';
  const fullyPaid = order.montantRestant === 0;
  const paidAmount = order.totalTtc - order.montantRestant;
  const paidPercentage = order.totalTtc > 0 ? (paidAmount / order.totalTtc) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app/orders"
          className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Order <span className="font-mono">#{order.id}</span>
            </h1>
            <StatusBadge status={order.status} type="order" />
          </div>
          <p className="text-sm text-text-secondary mt-0.5">
            {formatDateTime(order.dateCreation)} — <Link to={`/app/clients/${order.clientId}`} className="text-primary hover:underline">{order.clientNom}</Link>
          </p>
        </div>

        {/* Admin Actions */}
        {isAdmin && isPending && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={!fullyPaid}
              title={!fullyPaid ? 'Order must be fully paid first' : 'Confirm order'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-success/15 text-success border border-success/30 hover:bg-success/25 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" /> Confirm
            </button>
            <button
              onClick={() => setCancelDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
              Financial Summary
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal HT</span>
                <span className="font-mono">{formatCurrency(order.sousTotal)}</span>
              </div>
              {order.montantRemise > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Discount {order.codePromo && `(incl. ${order.codePromo})`}
                  </span>
                  <span className="font-mono text-accent">-{formatCurrency(order.montantRemise)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">HT après remise</span>
                <span className="font-mono">{formatCurrency(order.montantHtApresRemise)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">TVA (20%)</span>
                <span className="font-mono">{formatCurrency(order.tva)}</span>
              </div>
              <div className="border-t border-border-light dark:border-border-dark pt-2.5 flex justify-between">
                <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">Total TTC</span>
                <span className="font-mono font-bold text-lg text-primary">{formatCurrency(order.totalTtc)}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
              Order Items ({order.items.length})
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-secondary border-b border-border-light dark:border-border-dark">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-center">Qty</th>
                  <th className="pb-2 font-medium text-right">Unit Price</th>
                  <th className="pb-2 font-medium text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border-light dark:border-border-dark last:border-0">
                    <td className="py-3">
                      <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{item.productNom}</span>
                    </td>
                    <td className="py-3 text-center font-mono text-xs">{item.quantite}</td>
                    <td className="py-3 text-right font-mono text-xs">{formatCurrency(item.prixUnitaire)}</td>
                    <td className="py-3 text-right font-mono text-xs font-medium">{formatCurrency(item.totalLigne)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payments */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                Payments ({payments.length})
              </h3>
              {isAdmin && isPending && order.montantRestant > 0 && (
                <button
                  onClick={() => setPaymentFormOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Payment
                </button>
              )}
            </div>
            <PaymentList payments={payments} />
          </div>
        </div>

        {/* Right: Payment Progress */}
        <div className="space-y-6">
          {/* Payment Progress Card */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                Payment Progress
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Paid</span>
                <span>{paidPercentage.toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full bg-bg-tertiary dark:bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${paidPercentage}%`,
                    backgroundColor: fullyPaid ? '#D4A017' : '#E63946',
                  }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-xs text-text-muted">Paid</p>
                  <p className="font-mono font-medium text-text-primary-light dark:text-text-primary-dark">
                    {formatCurrency(paidAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Remaining</p>
                  <p className={`font-mono font-medium ${order.montantRestant > 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(order.montantRestant)}
                  </p>
                </div>
              </div>
            </div>

            {fullyPaid && isPending && (
              <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-xs text-success font-medium">
                  Fully paid! This order can now be confirmed.
                </p>
              </div>
            )}

            {!isPending && (
              <div className="mt-4 p-3 rounded-lg bg-info/10 border border-info/20">
                <p className="text-xs text-info font-medium">
                  This order is {order.status.toLowerCase()} — no further changes allowed.
                </p>
              </div>
            )}
          </div>

          {/* Order Info Card */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-6">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
              Order Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Client</span>
                <Link to={`/app/clients/${order.clientId}`} className="text-primary hover:underline font-medium">
                  {order.clientNom}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Date</span>
                <span className="text-text-primary-light dark:text-text-primary-dark text-xs">{formatDateTime(order.dateCreation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status</span>
                <StatusBadge status={order.status} type="order" />
              </div>
              {order.codePromo && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Promo Code</span>
                  <span className="font-mono text-xs text-accent">{order.codePromo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      <PaymentForm
        open={paymentFormOpen}
        onClose={() => setPaymentFormOpen(false)}
        onSubmit={handleAddPayment}
        maxAmount={order.montantRestant}
        orderId={order.id}
      />

      {/* Confirm Order Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Order"
        description="Are you sure you want to confirm this order? This action is final and cannot be undone."
        confirmText="Confirm Order"
        variant="warning"
      />

      {/* Cancel Order Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action is final and cannot be undone."
        confirmText="Cancel Order"
        variant="danger"
      />
    </div>
  );
}
