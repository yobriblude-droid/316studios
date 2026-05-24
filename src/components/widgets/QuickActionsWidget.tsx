import React from 'react';
import { Download, FilePlus, Receipt, RotateCcw } from 'lucide-react';
import { HighlightedButton } from '../ui/HighlightedButton';

type QuickActionsWidgetProps = {
  selectedCount: number;
  onBulkDownload: () => void;
  onNewRequest: () => void;
  onViewBilling: () => void;
  onResetLayout: () => void;
};

export function QuickActionsWidget({
  selectedCount,
  onBulkDownload,
  onNewRequest,
  onViewBilling,
  onResetLayout,
}: QuickActionsWidgetProps) {
  return (
    <div className="flex flex-col gap-2">
      <HighlightedButton
        variant="cta-primary"
        size="sm"
        className="w-full justify-center"
        onClick={onBulkDownload}
        disabled={selectedCount === 0}
      >
        <Download className="w-3.5 h-3.5" />
        Download ({selectedCount})
      </HighlightedButton>
      <HighlightedButton variant="cta-brand" size="sm" className="w-full justify-center" onClick={onNewRequest}>
        <FilePlus className="w-3.5 h-3.5" />
        Ingest media
      </HighlightedButton>
      <HighlightedButton variant="ghost-glass" size="sm" className="w-full justify-center" onClick={onViewBilling}>
        <Receipt className="w-3.5 h-3.5" />
        Billing
      </HighlightedButton>
      <HighlightedButton variant="ghost-glass" size="sm" className="w-full justify-center text-muted" onClick={onResetLayout}>
        <RotateCcw className="w-3.5 h-3.5" />
        Reset layout
      </HighlightedButton>
    </div>
  );
}
