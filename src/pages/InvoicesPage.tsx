import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHero } from '../components/ui/PageHero';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { layout } from '../lib/layout';
import { cn } from '../lib/utils';
import { formatAdminDate } from '../lib/admin-table';
import type { Invoice } from '../components/widgets/types';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/invoices')
      .then(async (r) => {
        if (!r.ok) throw new Error('Unauthorized');
        return r.json();
      })
      .then(setInvoices)
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const paid = invoices.filter((i) => Boolean(i.paid)).length;
  const due = invoices
    .filter((i) => !i.paid)
    .reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <div className={layout.page}>
      <PageHero
        eyebrow="Billing"
        title="My invoices"
        description="View payment history and outstanding balances."
        compact
      />

      <section className={layout.sectionDefault}>
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <p className="text-muted text-xs uppercase tracking-widest animate-pulse text-center py-16">
              Loading…
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="border border-border bg-surface p-6">
                  <p className="text-[10px] uppercase tracking-widest text-muted">Paid</p>
                  <p className="text-3xl font-light text-foreground mt-2">
                    {paid}/{invoices.length}
                  </p>
                </div>
                <div className="border border-border-gold bg-accent-dim p-6">
                  <p className="text-[10px] uppercase tracking-widest text-muted">Outstanding</p>
                  <p className="text-3xl font-light text-accent mt-2 tabular-nums">
                    KES {due.toLocaleString()}
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {invoices.map((inv) => (
                  <li key={inv.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(inv)}
                      className="w-full flex flex-wrap items-center justify-between gap-4 p-5 border border-border bg-surface hover:border-accent transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm text-foreground">Invoice #{inv.id.slice(0, 8)}</p>
                        <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                          {formatAdminDate(inv.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg tabular-nums text-foreground">
                          KES {inv.amount?.toLocaleString()}
                        </p>
                        <p
                          className={cn(
                            'text-[10px] uppercase tracking-widest',
                            inv.paid ? 'text-emerald-400' : 'text-amber-400'
                          )}
                        >
                          {inv.paid ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
                {invoices.length === 0 && (
                  <p className="text-center text-sm text-muted border border-dashed border-border py-16">
                    No invoices yet.{' '}
                    <Link to="/checkout" className="text-accent hover:underline">
                      Create one via checkout
                    </Link>
                  </p>
                )}
              </ul>

              <div className="mt-8 text-center">
                <Link to="/dashboard">
                  <Button variant="outline">Back to dashboard</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Invoice #${selected.id.slice(0, 8)}` : undefined}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Amount</span>
              <span className="tabular-nums">KES {selected.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span className={selected.paid ? 'text-emerald-400' : 'text-amber-400'}>
                {selected.paid ? 'Paid' : 'Pending'}
              </span>
            </div>
            {!selected.paid && (
              <Button variant="primary" className="w-full" onClick={() => navigate('/checkout')}>
                Pay now
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesPage;
