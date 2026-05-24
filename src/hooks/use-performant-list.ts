import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function usePerformantList<T>(items: T[], estimateSize = 120, overscan = 4) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}
