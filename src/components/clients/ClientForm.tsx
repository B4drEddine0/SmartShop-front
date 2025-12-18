import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';
import type { ClientRequest } from '@/types/client';

const clientSchema = z.object({
  nom: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  telephone: z.string().min(1, 'Phone is required'),
  adresse: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClientRequest) => Promise<void>;
  initialData?: Partial<ClientRequest>;
  isEdit?: boolean;
}

export function ClientForm({ open, onClose, onSubmit, initialData, isEdit = false }: ClientFormProps) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientRequest>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {},
  });

  if (!open) return null;

  const handleFormSubmit = async (data: ClientRequest) => {
    setError('');
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Failed to save client');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card-light dark:bg-bg-secondary rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            {isEdit ? 'Edit Client' : 'Add New Client'}
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
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Company Name</label>
            <input
              {...register('nom')}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30',
                errors.nom ? 'border-danger' : 'border-border-light dark:border-border-dark'
              )}
              placeholder="e.g. TechCorp SARL"
            />
            {errors.nom && <p className="mt-1 text-xs text-danger">{errors.nom.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30',
                  errors.email ? 'border-danger' : 'border-border-light dark:border-border-dark'
                )}
                placeholder="contact@company.ma"
              />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Phone</label>
              <input
                {...register('telephone')}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30',
                  errors.telephone ? 'border-danger' : 'border-border-light dark:border-border-dark'
                )}
                placeholder="0522-123456"
              />
              {errors.telephone && <p className="mt-1 text-xs text-danger">{errors.telephone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Address</label>
            <input
              {...register('adresse')}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="123 Bd Zerktouni, Casablanca"
            />
          </div>

          <div className="border-t border-border-light dark:border-border-dark pt-4 mt-4">
            <p className="text-xs text-text-muted mb-3">Login Credentials (for client portal access)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Username</label>
                <input
                  {...register('username')}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30',
                    errors.username ? 'border-danger' : 'border-border-light dark:border-border-dark'
                  )}
                  placeholder="techcorp"
                />
                {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30',
                    errors.password ? 'border-danger' : 'border-border-light dark:border-border-dark'
                  )}
                  placeholder="••••••"
                />
                {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
              </div>
            </div>
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
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
              ) : (
                isEdit ? 'Update Client' : 'Create Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
