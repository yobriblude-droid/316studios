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
import { apiFetch } from '../../lib/api';
import { BulkActionBar } from '../../components/ui/BulkActionBar';
import { useBulkSelection } from '../../hooks/use-bulk-selection';

type Slide = { id: string; title: string; subtitle: string; image: string };

const AdminHeroSlidesPage = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const { selectedIds, toggle, selectAll, clearSelection } = useBulkSelection(() => slides.map((s) => s.id));

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/hero-slides');
      if (!res.ok) throw new Error('Failed');
      setSlides(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const columns = useMemo<ColumnDef<Slide>[]>(
    () => [
      {
        id: 'select',
        header: '',
        cell: ({ row }) => (
          <input type="checkbox" checked={selectedIds.includes(row.original.id)} onChange={() => toggle(row.original.id)} />
        ),
      },
      {
        accessorKey: 'image',
        header: 'Preview',
        enableSorting: false,
        cell: (i) => {
          const url = i.getValue() as string;
          return url ? (
            <img src={url} alt="" className="w-20 h-12 object-cover rounded-lg border border-border" />
          ) : (
            '—'
          );
        },
      },
      { accessorKey: 'title', header: 'Title' },
      { accessorKey: 'subtitle', header: 'Subtitle', cell: (i) => <span className="text-muted">{i.getValue() as string}</span> },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/hero-slides/${row.original.id}/edit`)}>
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
        title="Hero slides"
        action={<Button variant="primary" size="sm" onClick={() => navigate('/admin/hero-slides/new')}>Add slide</Button>}
      />
      <AdminErrorBanner message={error} />
      <BulkActionBar
        totalCount={slides.length}
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDeleteSelected={() => setBulkOpen(true)}
        entityLabel="slides"
      />
      <DataTable data={slides} columns={columns} isLoading={loading} />
      <AdminDeleteModal
        open={!!deleteId}
        title="Delete slide"
        message="Remove this hero slide from the homepage rotation."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await apiFetch(`/api/admin/hero-slides/${deleteId}`, { method: 'DELETE' });
          setDeleteId(null);
          fetchSlides();
        }}
      />
      <AdminDeleteModal
        open={bulkOpen}
        title="Delete slides"
        message={`Delete ${selectedIds.length} slide(s)?`}
        onCancel={() => setBulkOpen(false)}
        onConfirm={async () => {
          await apiFetch('/api/admin/hero-slides/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedIds }),
          });
          clearSelection();
          setBulkOpen(false);
          fetchSlides();
        }}
      />
    </>
  );
};

export default AdminHeroSlidesPage;
