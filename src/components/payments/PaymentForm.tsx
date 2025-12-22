import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { X, Loader2, Banknote, FileText, ArrowRightLeft } from 'lucide-react';
import { MAX_CASH_AMOUNT } from '@/lib/constants';
import type { PaymentMethod, PaymentStatus } from '@/types/enums';

const basePaymentSchema = z.object({
  montant: z.coerce.number().positive('Amount must be positive'),
  typePaiement: z.enum(['ESPECES', 'CHEQUE', 'VIREMENT']),
  status: z.enum(['EN_ATTENTE', 'ENCAISSE', 'REJETE']),
  reference: z.string().optional(),
  banque: z.string().optional(),
  dateEcheance: z.string().optional(),
  dateEncaissement: z.string().optional(),
});

const paymentSchema = basePaymentSchema.refine(
  (data) => {
    if (data.typePaiement === 'ESPECES' && data.montant > MAX_CASH_AMOUNT) return false;
    return true;
  },
  { message: `Cash payments cannot exceed ${MAX_CASH_AMOUNT} DH`, path: ['montant'] }
).refine(
  (data) => {
    if (data.typePaiement === 'CHEQUE' && !data.reference) return false;
    return true;
  },
  { message: 'Reference is required for check payments', path: ['reference'] }
).refine(
  (data) => {
    if (data.typePaiement === 'CHEQUE' && !data.banque) return false;
    return true;
  },
  { message: 'Bank is required for check payments', path: ['banque'] }
).refine(
  (data) => {
    if (data.typePaiement === 'VIREMENT' && !data.reference) return false;
    return true;
  },
  { message: 'Reference is required for bank transfers', path: ['reference'] }
);

type PaymentFormData = z.output<typeof basePaymentSchema>;

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  maxAmount: number;
  orderId: number;
}

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  ESPECES: <Banknote className="w-4 h-4" />,
  CHEQUE: <FileText className="w-4 h-4" />,
  VIREMENT: <ArrowRightLeft className="w-4 h-4" />,
};

export function PaymentForm({ open, onClose, onSubmit, maxAmount, orderId }: PaymentFormProps) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      montant: maxAmount,
      typePaiement: 'ESPECES',
      status: 'ENCAISSE',
    },
  });

  const method = watch('typePaiement');

  if (!open) return null;

  const handleFormSubmit = async (data: PaymentFormData) => {
    setError('');
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Failed to register payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card-light dark:bg-bg-secondary rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Add Payment — Order #{orderId}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Amount (DH) <span className="text-text-muted font-normal">— max: {maxAmount.toFixed(2)} DH</span>
            </label>
            <input
              {...register('montant')}
              type="number"
              step="0.01"
              max={maxAmount}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark font-mono focus:outline-none focus:ring-2 focus:ring-primary/30',
                errors.montant ? 'border-danger' : 'border-border-light dark:border-border-dark'
              )}
            />
            {errors.montant && <p className="mt-1 text-xs text-danger">{errors.montant.message}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ESPECES', 'CHEQUE', 'VIREMENT'] as PaymentMethod[]).map((m) => (
                <label
                  key={m}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all',
                    method === m
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-light dark:border-border-dark text-text-secondary hover:bg-bg-light dark:hover:bg-bg-tertiary'
                  )}
                >
                  <input {...register('typePaiement')} type="radio" value={m} className="sr-only" />
                  {methodIcons[m]}
                  {m === 'ESPECES' ? 'Cash' : m === 'CHEQUE' ? 'Check' : 'Transfer'}
                </label>
              ))}
            </div>
            {method === 'ESPECES' && (
              <p className="mt-1 text-xs text-text-muted">Max {MAX_CASH_AMOUNT.toLocaleString()} DH per cash payment</p>
            )}
          </div>

          {/* Reference (for CHECK + VIREMENT) */}
          {(method === 'CHEQUE' || method === 'VIREMENT') && (
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Reference {method === 'CHEQUE' ? '(Check #)' : '(Transfer Ref)'}
              </label>
              <input
                {...register('reference')}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono',
                  errors.reference ? 'border-danger' : 'border-border-light dark:border-border-dark'
                )}
              />
              {errors.reference && <p className="mt-1 text-xs text-danger">{errors.reference.message}</p>}
            </div>
          )}

          {method === 'ESPECES' && (
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Reference (Receipt #)
              </label>
              <input
                {...register('reference')}
                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
            </div>
          )}

          {/* Bank (for CHECK + VIREMENT) */}
          {(method === 'CHEQUE' || method === 'VIREMENT') && (
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Bank</label>
              <input
                {...register('banque')}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30',
                  errors.banque ? 'border-danger' : 'border-border-light dark:border-border-dark'
                )}
              />
              {errors.banque && <p className="mt-1 text-xs text-danger">{errors.banque.message}</p>}
            </div>
          )}

          {/* Due date (for CHECK) */}
          {method === 'CHEQUE' && (
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Due Date</label>
              <input
                {...register('dateEcheance')}
                type="date"
                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ENCAISSE">Cashed (ENCAISSÉ)</option>
              <option value="EN_ATTENTE">Pending (EN ATTENTE)</option>
              <option value="REJETE">Rejected (REJETÉ)</option>
            </select>
          </div>

          {/* Encashment Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Encashment Date
            </label>
            <input
              {...register('dateEncaissement')}
              type="date"
              className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
              ) : (
                'Register Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
