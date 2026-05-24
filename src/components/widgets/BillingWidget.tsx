import React from 'react';
import { cn } from '../../lib/utils';
import type { Invoice } from './types';

export function BillingWidget({
  invoices,
  onSelectInvoice,
}: {
  invoices: Invoice[];
  onSelectInvoice: (inv: Invoice) => void;
}) {
  const paid = invoices.filter((i) => Boolean(i.paid)).length;
  const totalDue = invoices
    .filter((i) => !i.paid)
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  if (invoices.length === 0) {
    return <p className="text-sm text-muted">No invoices on file yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-xs">
        <div>
          <p className="text-muted uppercase tracking-widest text-[9px]">Paid</p>
          <p className="text-lg text-foreground font-light">{paid}/{invoices.length}</p>
        </div>
        <div>
          <p className="text-muted uppercase tracking-widest text-[9px]">Outstanding</p>
          <p className="text-lg text-accent font-light">KES {totalDue.toLocaleString()}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {invoices.slice(0, 4).map((inv) => (
          <li key={inv.id}>
            <button
              type="button"
              onClick={() => onSelectInvoice(inv)}
              className="w-full text-left flex justify-between items-center gap-2 border border-border px-3 py-2 hover:border-accent transition-colors"
            >
              <span className="text-xs text-foreground truncate">#{inv.id.slice(0, 8)}</span>
              <span className="text-xs tabular-nums text-foreground">KES {inv.amount?.toLocaleString()}</span>
              <span
                className={cn(
                  'text-[9px] uppercase tracking-widest shrink-0',
                  inv.paid ? 'text-emerald-400' : 'text-amber-400'
                )}
              >
                {inv.paid ? 'Paid' : 'Due'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
