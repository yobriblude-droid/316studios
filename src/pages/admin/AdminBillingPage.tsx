import React, { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { AdminPageHeader, DataTable } from '../../components/admin';
import { formatAdminDate, statusBadgeClass } from '../../lib/admin-table';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { apiFetch } from '../../lib/api';

type Invoice = {
  id: string;
  userId: string;
  amount: number;
  paid: number | boolean;
  createdAt: string;
};

const AdminBillingPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<{
    revenue?: number;
    referrals?: unknown[];
    downloadsByFile?: unknown[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/admin/invoices').then((r) => (r.ok ? r.json() : [])),
      apiFetch('/api/admin/analytics').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([inv, an]) => {
        setInvoices(inv);
        setAnalytics(an);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', cell: (i) => <span className="font-mono text-xs">#{(i.getValue() as string).slice(0, 8)}</span> },
      { accessorKey: 'userId', header: 'User', cell: (i) => <span className="text-muted text-xs">{(i.getValue() as string).slice(0, 8)}…</span> },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: (i) => <span className="tabular-nums text-accent">KES {(i.getValue() as number).toLocaleString()}</span>,
      },
      {
        accessorKey: 'paid',
        header: 'Status',
        cell: (i) => {
          const paid = Boolean(i.getValue());
          return (
            <span className={cn('text-[10px] uppercase tracking-widest px-2 py-0.5 border', statusBadgeClass(paid ? 'paid' : 'pending'))}>
              {paid ? 'Paid' : 'Pending'}
            </span>
          );
        },
      },
      { accessorKey: 'createdAt', header: 'Created', cell: (i) => formatAdminDate(i.getValue() as string) },
    ],
    []
  );

  return (
    <>
      <AdminPageHeader title="Billing & analytics" />
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Card elevation="raised">
            <p className="text-[10px] uppercase tracking-widest text-muted">Revenue (paid)</p>
            <p className="text-2xl text-accent mt-2 tabular-nums">KES {(analytics.revenue || 0).toLocaleString()}</p>
          </Card>
          <Card elevation="raised">
            <p className="text-[10px] uppercase tracking-widest text-muted">Referrals</p>
            <p className="text-2xl text-foreground mt-2">{(analytics.referrals || []).length}</p>
          </Card>
          <Card elevation="raised">
            <p className="text-[10px] uppercase tracking-widest text-muted">Files tracked</p>
            <p className="text-2xl text-foreground mt-2">{(analytics.downloadsByFile || []).length}</p>
          </Card>
        </div>
      )}
      <h2 className="text-lg font-semibold uppercase tracking-tight mb-4">All invoices</h2>
      <DataTable data={invoices} columns={columns} isLoading={loading} searchPlaceholder="Search invoices…" />
    </>
  );
};

export default AdminBillingPage;
