import React from 'react';
import type { DashboardData } from './types';

export function WorkspaceWidget({ userName, files }: Pick<DashboardData, 'userName' | 'files'>) {
  const pending = files.filter((f) => f.approved === null).length;
  return (
    <div className="space-y-4">
      <p className="text-2xl font-light text-foreground tracking-tight">
        Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}
      </p>
      <p className="text-sm text-muted leading-relaxed">
        Your private studio workspace. Review deliverables, approve selects, and request additional media.
      </p>
      <div className="flex items-center gap-2 pt-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
        <span className="text-[10px] uppercase tracking-widest text-muted font-medium">Portal active</span>
      </div>
      {pending > 0 && (
        <p className="text-xs text-accent border border-border-gold px-3 py-2 bg-accent-dim">
          {pending} file{pending === 1 ? '' : 's'} awaiting your approval
        </p>
      )}
    </div>
  );
}
