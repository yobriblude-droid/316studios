export type WidgetSize = 'sm' | 'md' | 'lg' | 'full';

export type WidgetType =
  | 'workspace'
  | 'activity'
  | 'media'
  | 'notifications'
  | 'stats'
  | 'quick-actions'
  | 'collaboration'
  | 'calendar'
  | 'billing';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  collapsed: boolean;
  order: number;
}

export const WIDGET_STORAGE_KEY = '316-studios-widget-layout-v2';

export const WIDGET_SIZE_CLASSES: Record<WidgetSize, string> = {
  sm: 'col-span-12 sm:col-span-6 lg:col-span-4',
  md: 'col-span-12 sm:col-span-6 lg:col-span-6',
  lg: 'col-span-12 lg:col-span-8',
  full: 'col-span-12',
};

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'w-stats', type: 'stats', size: 'sm', collapsed: false, order: 0 },
  { id: 'w-notifications', type: 'notifications', size: 'sm', collapsed: false, order: 1 },
  { id: 'w-quick', type: 'quick-actions', size: 'md', collapsed: false, order: 2 },
  { id: 'w-media', type: 'media', size: 'lg', collapsed: false, order: 3 },
  { id: 'w-billing', type: 'billing', size: 'md', collapsed: false, order: 4 },
  { id: 'w-activity', type: 'activity', size: 'md', collapsed: true, order: 5 },
  { id: 'w-workspace', type: 'workspace', size: 'sm', collapsed: true, order: 6 },
];

const SIZE_CYCLE: WidgetSize[] = ['sm', 'md', 'lg', 'full'];

export function cycleWidgetSize(current: WidgetSize): WidgetSize {
  const idx = SIZE_CYCLE.indexOf(current);
  return SIZE_CYCLE[(idx + 1) % SIZE_CYCLE.length];
}

export function sortWidgets(widgets: WidgetConfig[]): WidgetConfig[] {
  return [...widgets].sort((a, b) => a.order - b.order);
}

export function loadWidgetLayout(): WidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS;
  try {
    const raw = localStorage.getItem(WIDGET_STORAGE_KEY);
    if (!raw) return DEFAULT_WIDGETS;
    const parsed = JSON.parse(raw) as WidgetConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_WIDGETS;
    const known = new Set(DEFAULT_WIDGETS.map((w) => w.type));
    const valid = parsed.filter((w) => w.id && w.type && known.has(w.type));
    if (valid.length === 0) return DEFAULT_WIDGETS;
    const defaultsByType = Object.fromEntries(DEFAULT_WIDGETS.map((w) => [w.type, w]));
    return sortWidgets(
      valid.map((w, i) => ({
        ...defaultsByType[w.type],
        ...w,
        order: w.order ?? i,
      }))
    );
  } catch {
    return DEFAULT_WIDGETS;
  }
}

export function saveWidgetLayout(widgets: WidgetConfig[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(sortWidgets(widgets)));
}

export function reorderWidgets(widgets: WidgetConfig[], dragId: string, targetId: string): WidgetConfig[] {
  const sorted = sortWidgets(widgets);
  const fromIdx = sorted.findIndex((w) => w.id === dragId);
  const toIdx = sorted.findIndex((w) => w.id === targetId);
  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return widgets;
  const next = [...sorted];
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return next.map((w, order) => ({ ...w, order }));
}

export function updateWidget(
  widgets: WidgetConfig[],
  id: string,
  patch: Partial<Pick<WidgetConfig, 'size' | 'collapsed'>>
): WidgetConfig[] {
  return widgets.map((w) => (w.id === id ? { ...w, ...patch } : w));
}

export function resetWidgetLayout(): WidgetConfig[] {
  saveWidgetLayout(DEFAULT_WIDGETS);
  return DEFAULT_WIDGETS;
}
