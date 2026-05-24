import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { AdminErrorBanner, AdminPageHeader, DataTable } from '../../components/admin';
import { formatAdminDate, statusBadgeClass } from '../../lib/admin-table';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { BulkActionBar } from '../../components/ui/BulkActionBar';
import { useBulkSelection } from '../../hooks/use-bulk-selection';
import { AdminDeleteModal } from '../../components/admin/AdminPageHeader';
import { Modal } from '../../components/ui/Modal';
import { apiFetch } from '../../lib/api';
import { parseClientRequestDetails, categoryLabel } from '../../lib/client-requests';

type MediaRequest = {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  requestType: string;
  requestDetails: string;
  status: 'open' | 'in_progress' | 'fulfilled' | 'rejected' | 'cancelled';
  responseLink?: string | null;
  responseNote?: string | null;
  createdAt: string;
};

const statuses: MediaRequest['status'][] = ['open', 'in_progress', 'fulfilled', 'rejected', 'cancelled'];

const AdminMediaRequestsPage = () => {
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [active, setActive] = useState<MediaRequest | null>(null);
  const [draftStatus, setDraftStatus] = useState<MediaRequest['status']>('open');
  const [draftNote, setDraftNote] = useState('');
  const [draftLink, setDraftLink] = useState('');
  const [saving, setSaving] = useState(false);
  const { selectedIds, toggle, selectAll, clearSelection } = useBulkSelection(() =>
    requests.map((r) => r.id)
  );

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch('/api/admin/media-requests');
      if (!res.ok) throw new Error('Could not load requests');
      setRequests(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openRequest = (row: MediaRequest) => {
    setActive(row);
    setDraftStatus(row.status);
    setDraftNote(row.responseNote || '');
    setDraftLink(row.responseLink || '');
  };

  const saveActive = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/media-requests/${active.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: draftStatus,
          responseNote: draftNote.trim() || null,
          responseLink: draftLink.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      setActive(null);
      await fetchRequests();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this request?')) return;
    await apiFetch(`/api/admin/media-requests/${id}`, { method: 'DELETE' });
    if (active?.id === id) setActive(null);
    fetchRequests();
  };

  const columns = useMemo<ColumnDef<MediaRequest>[]>(
    () => [
      {
        id: 'select',
        header: '',
        cell: ({ row }) => (
          <input type="checkbox" checked={selectedIds.includes(row.original.id)} onChange={() => toggle(row.original.id)} />
        ),
      },
      {
        accessorKey: 'requestDetails',
        header: 'Request',
        cell: (i) => {
          const parsed = parseClientRequestDetails(i.getValue() as string);
          return (
            <button type="button" onClick={() => openRequest(i.row.original)} className="max-w-xs text-left hover:text-accent">
              {'category' in parsed && (
                <p className="text-[10px] uppercase text-accent mb-1">{categoryLabel(parsed.category)}</p>
              )}
              <p className="line-clamp-2 text-sm">{parsed.message}</p>
            </button>
          );
        },
      },
      {
        id: 'client',
        header: 'Client',
        cell: ({ row }) => (
          <div className="text-xs">
            <p className="font-medium">{row.original.clientName || 'Client'}</p>
            <p className="text-muted truncate max-w-[140px]">{row.original.clientEmail}</p>
          </div>
        ),
      },
      { accessorKey: 'requestType', header: 'Type' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className={cn('px-2 py-1 text-[10px] uppercase border', statusBadgeClass(row.original.status))}>
            {row.original.status.replace('_', ' ')}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: (i) => formatAdminDate(i.getValue() as string),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openRequest(row.original)}>
              Review
            </Button>
            <Button variant="ghost" size="sm" className="text-red-400" onClick={() => remove(row.original.id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [selectedIds, toggle]
  );

  const activeParsed = active ? parseClientRequestDetails(active.requestDetails) : null;

  return (
    <>
      <AdminPageHeader title="Media requests" description="Review, approve, and reply to client requests." />
      <AdminErrorBanner message={error} />
      <BulkActionBar
        totalCount={requests.length}
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDeleteSelected={() => setBulkOpen(true)}
        entityLabel="requests"
      />
      <DataTable data={requests} columns={columns} isLoading={loading} searchPlaceholder="Search requests…" />

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `Request from ${active.clientName || 'client'}` : undefined}
        size="lg"
      >
        {active && activeParsed && (
          <div className="space-y-6">
            <div className="text-sm space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted">Client message</p>
              {'category' in activeParsed && (
                <p className="text-[10px] uppercase text-accent">{categoryLabel(activeParsed.category)}</p>
              )}
              <p className="text-foreground whitespace-pre-wrap">{activeParsed.message}</p>
              {'link' in activeParsed && activeParsed.link && (
                <a href={activeParsed.link} target="_blank" rel="noreferrer" className="text-accent-link text-sm break-all">
                  {activeParsed.link}
                </a>
              )}
              <p className="text-[10px] text-muted pt-2">
                {active.clientEmail} · {formatAdminDate(active.createdAt)}
              </p>
            </div>

            <div className="grid gap-4">
              <label className="block text-[10px] uppercase tracking-widest text-muted">
                Status
                <select
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as MediaRequest['status'])}
                  className="mt-2 w-full bg-elevated border border-border px-3 py-2 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[10px] uppercase tracking-widest text-muted">
                Reply note (visible to client)
                <textarea
                  rows={4}
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="Approval notes, next steps, or questions for the client"
                  className="mt-2 w-full bg-elevated border border-border px-3 py-2 text-sm resize-none"
                />
              </label>
              <label className="block text-[10px] uppercase tracking-widest text-muted">
                Response link (optional)
                <input
                  type="url"
                  value={draftLink}
                  onChange={(e) => setDraftLink(e.target.value)}
                  placeholder="https://"
                  className="mt-2 w-full bg-elevated border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="primary" onClick={saveActive} disabled={saving}>
                {saving ? 'Saving…' : 'Save and notify client'}
              </Button>
              <Button variant="ghost" onClick={() => setActive(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AdminDeleteModal
        open={bulkOpen}
        title="Delete requests"
        message={`Delete ${selectedIds.length} request(s)?`}
        onCancel={() => setBulkOpen(false)}
        onConfirm={async () => {
          await apiFetch('/api/admin/media-requests/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedIds }),
          });
          clearSelection();
          setBulkOpen(false);
          fetchRequests();
        }}
      />
    </>
  );
};

export default AdminMediaRequestsPage;
