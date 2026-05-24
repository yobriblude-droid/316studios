import { useCallback, useState } from 'react';

export function useBulkSelection(getIds: () => string[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(getIds());
  }, [getIds]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  return { selectedIds, setSelectedIds, toggle, selectAll, clearSelection };
}
