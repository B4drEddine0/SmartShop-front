import { useEffect, useState, useMemo } from 'react';
import { productApi } from '@/api/productApi';
import type { ProductResponse, Page } from '@/types/product';
import { DataTable } from '@/components/shared/DataTable';
import { ProductForm } from '@/components/products/ProductForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import type { ColumnDef } from '@tanstack/react-table';

export default function ProductsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageData, setPageData] = useState<Page<ProductResponse> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductResponse | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductResponse | null>(null);

  const fetchProducts = async (p = page, s = pageSize) => {
    try {
      const data = await productApi.getAll(p, s);
      setPageData(data);
      setProducts(data.content);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, pageSize]);

  const handleCreate = async (data: Parameters<typeof productApi.create>[0]) => {
    await productApi.create(data);
    toast.success('Product created successfully');
    fetchProducts();
  };

  const handleUpdate = async (data: Parameters<typeof productApi.update>[1]) => {
    if (!editProduct) return;
    await productApi.update(editProduct.id, data);
    toast.success('Product updated successfully');
    setEditProduct(null);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await productApi.delete(deleteProduct.id);
      toast.success('Product deleted successfully');
      setDeleteProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const stockBadge = (stock: number) => {
    if (stock === 0) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/20">Out of stock</span>;
    if (stock < 10) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/20">Low: {stock}</span>;
    return <span className="font-mono text-xs">{stock}</span>;
  };

  const columns: ColumnDef<ProductResponse, unknown>[] = useMemo(() => {
    const cols: ColumnDef<ProductResponse, unknown>[] = [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className="font-mono text-xs text-text-muted">#{row.original.id}</span>,
        size: 60,
      },
      {
        accessorKey: 'nom',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{row.original.nom}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-text-secondary text-xs truncate max-w-[200px] block">
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'prixUnitaire',
        header: 'Unit Price',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-text-primary-light dark:text-text-primary-dark">
            {formatCurrency(row.original.prixUnitaire)}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => stockBadge(row.original.stock),
      },
    ];

    if (isAdmin) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditProduct(row.original)}
              className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent/10"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeleteProduct(row.original)}
              className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
        size: 80,
      });
    }

    return cols;
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Products</h1>
        </div>
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Products</h1>
        {isAdmin && (
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {products.length === 0 && !pageData ? (
        <EmptyState
          icon={<Package className="w-16 h-16 stroke-1" />}
          title="No products yet"
          description="Add your first product to the catalog."
          action={
            isAdmin ? (
              <button
                onClick={() => setFormOpen(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover"
              >
                Add Product
              </button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          data={products}
          columns={columns}
          searchColumn="nom"
          searchPlaceholder="Search products..."
          enablePagination={false}
          serverPagination={pageData ? {
            pageIndex: pageData.number,
            pageSize: pageData.size,
            totalPages: pageData.totalPages,
            totalElements: pageData.totalElements,
            onPageChange: (p) => setPage(p),
            onPageSizeChange: (s) => { setPageSize(s); setPage(0); },
          } : undefined}
        />
      )}

      {/* Create Form */}
      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />

      {/* Edit Form */}
      {editProduct && (
        <ProductForm
          open={true}
          onClose={() => setEditProduct(null)}
          onSubmit={handleUpdate}
          initialData={{
            nom: editProduct.nom,
            description: editProduct.description,
            prixUnitaire: editProduct.prixUnitaire,
            stock: editProduct.stock,
          }}
          isEdit
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteProduct?.nom}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
