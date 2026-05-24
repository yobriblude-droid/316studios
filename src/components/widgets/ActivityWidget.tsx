import React from 'react';
import type { ClientFile } from './types';

export function ActivityWidget({ files }: { files: ClientFile[] }) {
  const sorted = [...files].sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return db - da;
  });

  if (sorted.length === 0) {
    return <p className="text-sm text-muted">No activity yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {sorted.slice(0, 5).map((f) => (
        <li key={f.id} className="flex items-center justify-between gap-3 text-xs">
          <span className="text-foreground truncate">{f.name}</span>
          <span className="text-muted shrink-0 uppercase tracking-wider text-[9px]">
            {f.approved === true ? 'Approved' : f.approved === false ? 'Rejected' : 'Pending'}
          </span>
        </li>
      ))}
    </ul>
  );
}
