import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import {
  AdminDeleteModal,
  AdminErrorBanner,
  AdminPageHeader,
  DataTable,
} from '../../components/admin';
import { Button } from '../../components/ui/Button';
import { BulkActionBar } from '../../components/ui/BulkActionBar';
import { useBulkSelection } from '../../hooks/use-bulk-selection';
import { apiFetch } from '../../lib/api';

type Service = {
  id: string;
  title: string;
  price: string;
  description: string;
};

const AdminServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const { selectedIds, toggle, selectAll, clearSelection } = useBulkSelection(() =>
    services.map((s) => s.id)
  );

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/services');
      if (!res.ok) throw new Error('Failed to fetch');
      setServices(await res.json());
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: 'select',
        header: '',
        cell: ({ row }) => (
          <input type="checkbox" checked={selectedIds.includes(row.original.id)} onChange={() => toggle(row.original.id)} />
        ),
      },
      { accessorKey: 'title', header: 'Title' },
      { accessorKey: 'price', header: 'Price', cell: (i) => <span className="text-accent">{i.getValue() as string}</span> },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (i) => <span className="text-muted line-clamp-1 max-w-sm">{i.getValue() as string}</span>,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/services/${row.original.id}/edit`)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setDeleteId(row.original.id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [navigate, selectedIds, toggle]
  );

  return (
    <>
      <AdminPageHeader
        title="Services"
        action={<Button variant="primary" size="sm" onClick={() => navigate('/admin/services/new')}>Add service</Button>}
      />
      <AdminErrorBanner message={error} />
      <BulkActionBar
        totalCount={services.length}
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDeleteSelected={() => setBulkOpen(true)}
        entityLabel="services"
      />
      <DataTable data={services} columns={columns} isLoading={loading} searchPlaceholder="Search services…" />
      <AdminDeleteModal
        open={!!deleteId}
        title="Delete service"
        message="Remove this service from bookings and checkout."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await fetch(`/api/admin/services/${deleteId}`, { method: 'DELETE' });
          setDeleteId(null);
          fetchServices();
        }}
      />
      <AdminDeleteModal
        open={bulkOpen}
        title="Delete services"
        message={`Delete ${selectedIds.length} service(s)?`}
        onCancel={() => setBulkOpen(false)}
        onConfirm={async () => {
          await apiFetch('/api/admin/services/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedIds }),
          });
          clearSelection();
          setBulkOpen(false);
          fetchServices();
        }}
      />
    </>
  );
};

export default AdminServicesPage;
