import { useCallback, useEffect, useState } from 'react';
import {
  type WidgetConfig,
  loadWidgetLayout,
  reorderWidgets,
  resetWidgetLayout,
  saveWidgetLayout,
  updateWidget,
  cycleWidgetSize,
} from '../lib/widget-system';

export function useWidgets() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => loadWidgetLayout());
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    saveWidgetLayout(widgets);
  }, [widgets]);

  const onDragStart = useCallback((id: string) => {
    setDragId(id);
  }, []);

  const onDragEnd = useCallback(() => {
    setDragId(null);
  }, []);

  const onDropOn = useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) return;
      setWidgets((prev) => reorderWidgets(prev, dragId, targetId));
      setDragId(null);
    },
    [dragId]
  );

  const toggleCollapse = useCallback((id: string) => {
    setWidgets((prev) =>
      updateWidget(
        prev,
        id,
        { collapsed: !prev.find((w) => w.id === id)?.collapsed }
      )
    );
  }, []);

  const cycleSize = useCallback((id: string) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, size: cycleWidgetSize(w.size) } : w
      )
    );
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(resetWidgetLayout());
  }, []);

  return {
    widgets,
    dragId,
    onDragStart,
    onDragEnd,
    onDropOn,
    toggleCollapse,
    cycleSize,
    resetLayout,
  };
}
