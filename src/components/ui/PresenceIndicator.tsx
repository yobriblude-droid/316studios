import React from 'react';
import { cn } from '../../lib/utils';
import type { PresenceUser } from '../../lib/socket';

export function PresenceIndicator({ users }: { users: PresenceUser[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap" aria-label={`${users.length} viewer(s) active`}>
      <span className="text-[10px] uppercase tracking-widest text-muted">Viewing now</span>
      {users.slice(0, 5).map((u) => (
        <span
          key={u.socketId}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider border',
            u.role === 'admin' ? 'border-accent text-accent bg-accent-dim' : 'border-border text-muted'
          )}
          title={u.name}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
          {u.name.split(' ')[0]}
        </span>
      ))}
      {users.length > 5 && (
        <span className="text-[10px] text-muted">+{users.length - 5}</span>
      )}
    </div>
  );
}
