import React, { useState } from 'react';
import { useClientMediaRequests, useCreateMediaRequest } from '../../hooks/use-client-data';
import { ClientRequestForm } from '../../components/client/ClientRequestForm';
import { BulkActionBar } from '../../components/ui/BulkActionBar';
import { useBulkSelection } from '../../hooks/use-bulk-selection';
import { apiFetch } from '../../lib/api';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminDeleteModal } from '../../components/admin/AdminPageHeader';
import { parseClientRequestDetails, categoryLabel } from '../../lib/client-requests';
import type { ClientRequestCategory } from '../../lib/client-requests';

export default function ClientRequestsPage() {
  const { data: requests = [], refetch } = useClientMediaRequests();
  const requestMutation = useCreateMediaRequest();
  const { toast } = useNotifications();
  const [sending, setSending] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const { selectedIds, toggle, selectAll, clearSelection } = useBulkSelection(() =>
    requests.map((r) => r.id)
  );

  const handleSubmit = async (payload: {
    category: ClientRequestCategory;
    message: string;
    link?: string;
  }) => {
    setSending(true);
    try {
      await requestMutation.mutateAsync(payload);
      refetch();
      toast({ type: 'success', title: 'Request sent to studio' });
    } catch {
      toast({ type: 'error', title: 'Failed to send request' });
    } finally {
      setSending(false);
    }
  };

  const bulkDelete = async () => {
    try {
      const res = await apiFetch('/api/client/media-requests/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed');
      clearSelection();
      setBulkDeleteOpen(false);
      refetch();
      toast({ type: 'success', title: 'Requests removed' });
    } catch {
      toast({ type: 'error', title: 'Delete failed' });
    }
  };

  return (
    <div className="space-y-8">
      <ClientRequestForm onSubmit={handleSubmit} sending={sending} />
      <section className="glass-panel-v2 border border-glass-border p-6">
        <h2 className="text-lg font-black uppercase tracking-tight mb-4">Request history</h2>
        <BulkActionBar
          totalCount={requests.length}
          selectedIds={selectedIds}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onDeleteSelected={() => setBulkDeleteOpen(true)}
          entityLabel="requests"
        />
        <ul className="mt-4 space-y-2">
          {requests.map((r) => {
            const parsed = parseClientRequestDetails(r.requestDetails);
            const cat = 'category' in parsed ? categoryLabel(parsed.category) : r.requestType.replace('_', ' ');
            return (
              <li key={r.id} className="flex items-center gap-3 p-3 border border-glass-border">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={() => toggle(r.id)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-accent mb-1">{cat}</p>
                  <p className="text-sm">{parsed.message}</p>
                  {'link' in parsed && parsed.link && (
                    <a href={parsed.link} target="_blank" rel="noreferrer" className="text-xs text-accent-link truncate block mt-1">
                      {parsed.link}
                    </a>
                  )}
                  <p className="text-[10px] uppercase tracking-widest text-muted mt-2">{r.status.replace('_', ' ')}</p>
                  {r.responseNote && (
                    <div className="mt-3 p-3 border border-glass-border bg-primary-dim/30 rounded-lg">
                      <p className="text-[10px] uppercase tracking-widest text-accent mb-1">Studio reply</p>
                      <p className="text-sm text-foreground">{r.responseNote}</p>
                    </div>
                  )}
                  {r.responseLink && (
                    <a
                      href={r.responseLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-accent-link truncate block mt-2"
                    >
                      {r.responseLink}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
          {requests.length === 0 && (
            <p className="text-sm text-muted text-center py-8">No requests yet.</p>
          )}
        </ul>
      </section>
      <AdminDeleteModal
        open={bulkDeleteOpen}
        title="Remove requests"
        message={`Delete ${selectedIds.length} selected request(s)?`}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={bulkDelete}
      />
    </div>
  );
}
