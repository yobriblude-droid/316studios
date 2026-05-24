import React from 'react';
import type { ClientFile, MediaRequest } from './types';

export function NotificationsWidget({
  files,
  mediaRequests,
}: {
  files: ClientFile[];
  mediaRequests: MediaRequest[];
}) {
  const pendingApproval = files.filter((f) => f.approved === null);
  const openRequests = mediaRequests.filter((r) => r.status === 'open' || r.status === 'in_progress');
  const recentComments = files
    .flatMap((f) => (f.comments || []).map((c) => ({ file: f.name, ...c })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const items: { label: string; detail?: string }[] = [];
  pendingApproval.forEach((f) =>
    items.push({ label: 'Approval needed', detail: f.name })
  );
  openRequests.forEach((r) =>
    items.push({ label: `Request: ${r.status}`, detail: r.requestDetails.slice(0, 48) })
  );
  recentComments.forEach((c) =>
    items.push({ label: 'New comment', detail: `${c.file}: ${c.text.slice(0, 40)}` })
  );

  if (items.length === 0) {
    return <p className="text-sm text-muted">You&apos;re all caught up.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.slice(0, 6).map((item, i) => (
        <li key={i} className="border-l-2 border-accent pl-3">
          <p className="text-[10px] uppercase tracking-widest text-accent">{item.label}</p>
          {item.detail && <p className="text-xs text-muted mt-0.5 truncate">{item.detail}</p>}
        </li>
      ))}
    </ul>
  );
}
