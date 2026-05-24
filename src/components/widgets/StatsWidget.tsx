import React from 'react';
import type { ClientFile } from './types';

export function StatsWidget({ files }: { files: ClientFile[] }) {
  const approved = files.filter((f) => f.approved === true).length;
  const rejected = files.filter((f) => f.approved === false).length;
  const pending = files.filter((f) => f.approved === null).length;

  const stats = [
    { label: 'Total assets', value: files.length },
    { label: 'Approved', value: approved },
    { label: 'Pending', value: pending },
    { label: 'Rejected', value: rejected },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="border border-border bg-elevated p-3">
          <p className="text-2xl font-light text-foreground tabular-nums">{s.value}</p>
          <p className="text-[9px] uppercase tracking-widest text-muted mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
