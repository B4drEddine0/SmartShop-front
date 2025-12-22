import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';
import type { ProductRequest } from '@/types/product';

const productSchema = z.object({
  nom: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  prixUnitaire: z.coerce.number().positive('Price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductRequest) => Promise<void>;
  initialData?: Partial<ProductRequest>;
  isEdit?: boolean;
}

export function ProductForm({ open, onClose, onSubmit, initialData, isEdit = false }: ProductFormProps) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData || {},
  });

  if (!open) return null;

  const handleFormSubmit = async (data: ProductFormData) => {
    setError('');
    try {
      await onSubmit(data as ProductRequest);
      reset();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Failed to save product');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card-light dark:bg-bg-secondary rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            {isEdit ? 'Edit Product' : 'Add New Product'}
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
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Product Name</label>
            <input
              {...register('nom')}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30',
                errors.nom ? 'border-danger' : 'border-border-light dark:border-border-dark'
              )}
              placeholder="e.g. HP ProBook 450 G10"
            />
            {errors.nom && <p className="mt-1 text-xs text-danger">{errors.nom.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Intel i5, 8GB RAM, 256GB SSD"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Unit Price (DH)</label>
              <input
                {...register('prixUnitaire')}
                type="number"
                step="0.01"
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono',
                  errors.prixUnitaire ? 'border-danger' : 'border-border-light dark:border-border-dark'
                )}
                placeholder="8500.00"
              />
              {errors.prixUnitaire && <p className="mt-1 text-xs text-danger">{errors.prixUnitaire.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Stock</label>
              <input
                {...register('stock')}
                type="number"
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono',
                  errors.stock ? 'border-danger' : 'border-border-light dark:border-border-dark'
                )}
                placeholder="50"
              />
              {errors.stock && <p className="mt-1 text-xs text-danger">{errors.stock.message}</p>}
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
                isEdit ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
