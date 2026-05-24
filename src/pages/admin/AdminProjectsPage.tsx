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

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
};

const AdminProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const { selectedIds, toggle, selectAll, clearSelection } = useBulkSelection(() =>
    projects.map((p) => p.id)
  );

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      setProjects(await res.json());
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/projects/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteId(null);
      fetchProjects();
    } catch {
      setError('Failed to delete project');
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const res = await apiFetch('/api/admin/projects/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed');
      clearSelection();
      setBulkDeleteOpen(false);
      fetchProjects();
    } catch {
      setError('Failed to delete projects');
    }
  };

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: 'select',
        header: 'Select',
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original.id)}
            onChange={() => toggle(row.original.id)}
            className="w-4 h-4"
          />
        ),
      },
      { accessorKey: 'title', header: 'Title', cell: (i) => <span className="font-medium">{i.getValue() as string}</span> },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (i) => (
          <span className="text-muted line-clamp-1 max-w-xs">{(i.getValue() as string) || '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/projects/${row.original.id}/edit`)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
              onClick={() => setDeleteId(row.original.id)}
            >
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
        title="Projects"
        description="Portfolio entries shown on the public site."
        action={
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/projects/new')}>
            Add project
          </Button>
        }
      />
      <AdminErrorBanner message={error} />
      <BulkActionBar
        totalCount={projects.length}
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDeleteSelected={() => setBulkDeleteOpen(true)}
        entityLabel="projects"
      />
      <DataTable
        data={projects}
        columns={columns}
        isLoading={loading}
        searchPlaceholder="Search projects…"
        globalFilterFn={(row, q) =>
          row.title.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q) ||
          row.description.toLowerCase().includes(q)
        }
        emptyMessage="No projects yet."
      />
      <AdminDeleteModal
        open={!!deleteId}
        title="Delete project"
        message="This cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <AdminDeleteModal
        open={bulkDeleteOpen}
        title="Delete projects"
        message={`Delete ${selectedIds.length} project(s)? This cannot be undone.`}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
      />
    </>
  );
};

export default AdminProjectsPage;
