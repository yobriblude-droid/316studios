import React from 'react';
import { useWidgets } from '../../hooks/use-widgets';
import type { WidgetConfig } from '../../lib/widget-system';
import { sortWidgets } from '../../lib/widget-system';
import { WidgetShell } from './WidgetShell';
import { WorkspaceWidget } from './WorkspaceWidget';
import { StatsWidget } from './StatsWidget';
import { NotificationsWidget } from './NotificationsWidget';
import { ActivityWidget } from './ActivityWidget';
import { MediaWidget } from './MediaWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
import { CollaborationWidget } from './CollaborationWidget';
import { BillingWidget } from './BillingWidget';
import { CalendarWidget } from './CalendarWidget';
import type { ClientFile, DashboardData, Invoice, MediaRequest } from './types';

type WidgetGridProps = {
  data: DashboardData;
  selectedCount: number;
  requestType: 'file' | 'external_link';
  requestDetails: string;
  onPreview: (file: ClientFile) => void;
  onScrollToLibrary: () => void;
  onBulkDownload: () => void;
  onNewRequest: () => void;
  onViewBilling: () => void;
  onRequestTypeChange: (t: 'file' | 'external_link') => void;
  onRequestDetailsChange: (v: string) => void;
  onSubmitRequest: () => void;
  onDeleteRequest: (id: string) => void;
  onSelectInvoice: (inv: Invoice) => void;
  hideCollaboration?: boolean;
};

function renderWidget(
  config: WidgetConfig,
  props: WidgetGridProps & { userName?: string; onResetLayout: () => void }
) {
  const { data } = props;
  switch (config.type) {
    case 'workspace':
      return <WorkspaceWidget userName={props.userName} files={data.files} />;
    case 'stats':
      return <StatsWidget files={data.files} />;
    case 'notifications':
      return (
        <NotificationsWidget files={data.files} mediaRequests={data.mediaRequests} />
      );
    case 'activity':
      return <ActivityWidget files={data.files} />;
    case 'media':
      return (
        <MediaWidget
          files={data.files}
          onPreview={props.onPreview}
          onScrollToLibrary={props.onScrollToLibrary}
        />
      );
    case 'quick-actions':
      return (
        <QuickActionsWidget
          selectedCount={props.selectedCount}
          onBulkDownload={props.onBulkDownload}
          onNewRequest={props.onNewRequest}
          onViewBilling={props.onViewBilling}
          onResetLayout={props.onResetLayout}
        />
      );
    case 'collaboration':
      return (
        <CollaborationWidget
          mediaRequests={data.mediaRequests}
          onDelete={props.onDeleteRequest}
        />
      );
    case 'billing':
      return (
        <BillingWidget invoices={data.invoices} onSelectInvoice={props.onSelectInvoice} />
      );
    case 'calendar':
      return <CalendarWidget />;
    default:
      return null;
  }
}

export function WidgetGrid(props: WidgetGridProps & { userName?: string }) {
  const {
    widgets,
    dragId,
    onDragStart,
    onDragEnd,
    onDropOn,
    toggleCollapse,
    cycleSize,
    resetLayout,
  } = useWidgets();

  const sorted = sortWidgets(widgets).filter(
    (c) => !(props.hideCollaboration && c.type === 'collaboration')
  );

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 auto-rows-min">
      {sorted.map((config) => (
        <WidgetShell
          key={config.id}
          config={config}
          dragActive={dragId === config.id}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDrop={onDropOn}
          onToggleCollapse={toggleCollapse}
          onCycleSize={cycleSize}
        >
          {renderWidget(config, { ...props, onResetLayout: resetLayout })}
        </WidgetShell>
      ))}
    </div>
  );
}
