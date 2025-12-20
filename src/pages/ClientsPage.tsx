import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '@/api/clientApi';
import type { ClientResponse } from '@/types/client';
import { DataTable } from '@/components/shared/DataTable';
import { TierBadge } from '@/components/shared/TierBadge';
import { ClientForm } from '@/components/clients/ClientForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editClient, setEditClient] = useState<ClientResponse | null>(null);
  const [deleteClient, setDeleteClient] = useState<ClientResponse | null>(null);

  const fetchClients = async () => {
    try {
      const data = await clientApi.getAll();
      setClients(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleCreate = async (data: Parameters<typeof clientApi.create>[0]) => {
    await clientApi.create(data);
    toast.success('Client created successfully');
    fetchClients();
  };

  const handleUpdate = async (data: Parameters<typeof clientApi.update>[1]) => {
    if (!editClient) return;
    await clientApi.update(editClient.id, data);
    toast.success('Client updated successfully');
    setEditClient(null);
    fetchClients();
  };

  const handleDelete = async () => {
    if (!deleteClient) return;
    try {
      await clientApi.delete(deleteClient.id);
      toast.success('Client deleted successfully');
      setDeleteClient(null);
      fetchClients();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns: ColumnDef<ClientResponse, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-text-muted">#{row.original.id}</span>
        ),
        size: 60,
      },
      {
        accessorKey: 'nom',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
            {row.original.nom}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-text-secondary">{row.original.email}</span>,
      },
      {
        accessorKey: 'telephone',
        header: 'Phone',
        cell: ({ row }) => <span className="text-text-secondary font-mono text-xs">{row.original.telephone}</span>,
      },
      {
        accessorKey: 'tier',
        header: 'Tier',
        cell: ({ row }) => <TierBadge tier={row.original.tier} size="sm" />,
      },
      {
        accessorKey: 'totalOrders',
        header: 'Orders',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.totalOrders}</span>,
      },
      {
        accessorKey: 'totalSpent',
        header: 'Total Spent',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{formatCurrency(row.original.totalSpent)}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditClient(row.original)}
              className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent/10"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeleteClient(row.original)}
              className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
        size: 80,
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Clients</h1>
        </div>
        <TableSkeleton rows={6} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Clients</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-16 h-16 stroke-1" />}
          title="No clients yet"
          description="Add your first B2B client to get started."
          action={
            <button
              onClick={() => setFormOpen(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover"
            >
              Add Client
            </button>
          }
        />
      ) : (
        <DataTable
          data={clients}
          columns={columns}
          searchColumn="nom"
          searchPlaceholder="Search clients..."
          onRowClick={(client) => navigate(`/app/clients/${client.id}`)}
        />
      )}

      {/* Create Form */}
      <ClientForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Form */}
      {editClient && (
        <ClientForm
          open={true}
          onClose={() => setEditClient(null)}
          onSubmit={handleUpdate}
          initialData={{
            nom: editClient.nom,
            email: editClient.email,
            telephone: editClient.telephone,
            adresse: editClient.adresse,
            username: '',
            password: '',
          }}
          isEdit
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteClient}
        onClose={() => setDeleteClient(null)}
        onConfirm={handleDelete}
        title="Delete Client"
        description={`Are you sure you want to delete "${deleteClient?.nom}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
