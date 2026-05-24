import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

type BulkActionBarProps = {
  totalCount: number;
  selectedIds: string[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  entityLabel?: string;
  className?: string;
  extraActions?: React.ReactNode;
};

export function BulkActionBar({
  totalCount,
  selectedIds,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  entityLabel = 'items',
  className,
  extraActions,
}: BulkActionBarProps) {
  const selected = selectedIds.length;
  const allSelected = totalCount > 0 && selected === totalCount;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 py-3 px-4 rounded-xl glass-panel-v2 border border-glass-border',
        className
      )}
    >
      <label className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => (allSelected ? onClearSelection() : onSelectAll())}
          className="w-4 h-4 accent-[var(--accent)]"
        />
        Select all ({totalCount})
      </label>
      {selected > 0 && (
        <>
          <span className="text-[10px] uppercase tracking-widest text-accent">
            {selected} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
          {extraActions}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 gap-1.5"
            onClick={onDeleteSelected}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete {selected} {entityLabel}
          </Button>
        </>
      )}
    </div>
  );
}
