import type { PaymentResponse } from '@/types/payment';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { Banknote, FileText, ArrowRightLeft } from 'lucide-react';
import type { PaymentMethod } from '@/types/enums';

interface PaymentListProps {
  payments: PaymentResponse[];
}

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  ESPECES: <Banknote className="w-4 h-4" />,
  CHEQUE: <FileText className="w-4 h-4" />,
  VIREMENT: <ArrowRightLeft className="w-4 h-4" />,
};

export function PaymentList({ payments }: PaymentListProps) {
  if (payments.length === 0) {
    return <p className="text-sm text-text-muted text-center py-6">No payments registered yet.</p>;
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center gap-4 p-3 rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-tertiary"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-bg-card-light dark:bg-bg-secondary border border-border-light dark:border-border-dark flex items-center justify-center text-text-secondary">
            {methodIcons[payment.typePaiement]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                Payment #{payment.numeroPaiement}
              </span>
              <StatusBadge status={payment.status} type="payment" />
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span>{PAYMENT_METHOD_LABELS[payment.typePaiement]}</span>
              <span>•</span>
              <span>{formatDateTime(payment.datePaiement)}</span>
              {payment.reference && (
                <>
                  <span>•</span>
                  <span className="font-mono">{payment.reference}</span>
                </>
              )}
              {payment.banque && (
                <>
                  <span>•</span>
                  <span>{payment.banque}</span>
                </>
              )}
            </div>
            {payment.dateEcheance && (
              <p className="text-xs text-text-muted mt-0.5">Due: {formatDate(payment.dateEcheance)}</p>
            )}
          </div>
          <span className="font-mono text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            {formatCurrency(payment.montant)}
          </span>
        </div>
      ))}
    </div>
  );
}
