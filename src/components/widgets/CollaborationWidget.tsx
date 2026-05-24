import React from 'react';
import { cn } from '../../lib/utils';
import type { MediaRequest } from './types';

const STATUS_COLORS: Record<string, string> = {
  open: 'text-accent-warning',
  in_progress: 'text-accent-brand',
  fulfilled: 'text-accent-success',
  rejected: 'text-accent-danger',
  cancelled: 'text-muted',
};

type CollaborationWidgetProps = {
  mediaRequests: MediaRequest[];
  onDelete: (id: string) => void;
};

export function CollaborationWidget({ mediaRequests, onDelete }: CollaborationWidgetProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted leading-relaxed">
        Request history — use the ingest panel above the library to upload or link new media.
      </p>
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {mediaRequests.slice(0, 6).map((r) => (
          <li
            key={r.id}
            className="flex items-start justify-between gap-2 glass-panel-v2 rounded-md p-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground truncate">{r.requestDetails}</p>
              <p
                className={cn(
                  'text-[9px] uppercase tracking-widest mt-1',
                  STATUS_COLORS[r.status] || 'text-muted'
                )}
              >
                {r.requestType.replace('_', ' ')} · {r.status.replace('_', ' ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(r.id)}
              className="text-[9px] uppercase text-muted hover:text-foreground shrink-0 min-h-[44px] px-2"
            >
              Remove
            </button>
          </li>
        ))}
        {mediaRequests.length === 0 && (
          <li className="text-xs text-muted glass-panel-v2 rounded-md p-4 text-center">
            No requests — try ingest: DSC_2847.JPG or a Drive link
          </li>
        )}
      </ul>
    </div>
  );
}
