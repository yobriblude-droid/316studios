import React from 'react';
import { ChevronDown, GripVertical, Maximize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { WidgetConfig } from '../../lib/widget-system';
import { WIDGET_SIZE_CLASSES } from '../../lib/widget-system';

const WIDGET_TITLES: Record<WidgetConfig['type'], string> = {
  workspace: 'Workspace',
  activity: 'Recent Activity',
  media: 'Recent Media',
  notifications: 'Notifications',
  stats: 'Asset Overview',
  'quick-actions': 'Quick Actions',
  collaboration: 'Collaboration',
  calendar: 'Schedule',
  billing: 'Billing',
};

type WidgetShellProps = {
  config: WidgetConfig;
  dragActive: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
  onToggleCollapse: (id: string) => void;
  onCycleSize: (id: string) => void;
  children: React.ReactNode;
};

export function WidgetShell({
  config,
  dragActive,
  onDragStart,
  onDragEnd,
  onDrop,
  onToggleCollapse,
  onCycleSize,
  children,
}: WidgetShellProps) {
  return (
    <div
      className={cn(
        WIDGET_SIZE_CLASSES[config.size],
        'min-h-0 transition-opacity duration-200',
        dragActive && 'opacity-60'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(config.id);
      }}
    >
      <div
        className={cn(
          'h-full flex flex-col glass-panel-v2 rounded-lg overflow-hidden',
          dragActive && 'ring-1 ring-accent-cta/50'
        )}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border bg-elevated/50">
          <button
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', config.id);
              onDragStart(config.id);
            }}
            onDragEnd={onDragEnd}
            className="p-1 text-muted hover:text-accent-brand cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder widget"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <h3 className="flex-1 text-[10px] uppercase tracking-[0.25em] font-semibold text-muted">
            {WIDGET_TITLES[config.type]}
          </h3>
          <button
            type="button"
            onClick={() => onCycleSize(config.id)}
            className="p-1.5 text-muted hover:text-accent-brand border border-transparent hover:border-glass-border transition-colors"
            title="Resize widget"
            aria-label="Resize widget"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onToggleCollapse(config.id)}
            className="p-1.5 text-muted hover:text-foreground transition-colors"
            aria-expanded={!config.collapsed}
            aria-label={config.collapsed ? 'Expand widget' : 'Collapse widget'}
          >
            <ChevronDown
              className={cn('w-4 h-4 transition-transform', config.collapsed && '-rotate-90')}
            />
          </button>
        </div>
        {!config.collapsed && <div className="flex-1 p-4 overflow-auto min-h-[120px]">{children}</div>}
      </div>
    </div>
  );
}
