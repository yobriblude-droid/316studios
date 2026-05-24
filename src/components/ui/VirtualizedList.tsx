import React from 'react';
import { usePerformantList } from '../../hooks/use-performant-list';

type VirtualizedListProps<T> = {
  items: T[];
  estimateSize?: number;
  className?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
};

export function VirtualizedList<T>({
  items,
  estimateSize = 120,
  className = 'h-[480px] overflow-auto',
  renderItem,
  emptyState,
}: VirtualizedListProps<T>) {
  const { parentRef, virtualizer, virtualItems, totalSize } = usePerformantList(items, estimateSize);

  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  if (items.length < 25) {
    return (
      <div className={className.replace('overflow-auto', '')}>
        {items.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={parentRef} className={className}>
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedList;
