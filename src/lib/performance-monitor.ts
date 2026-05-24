type MetricName = 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';

type MetricEntry = {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
};

const metrics: MetricEntry[] = [];

function rateMetric(name: MetricName, value: number): MetricEntry['rating'] {
  const thresholds: Record<MetricName, [number, number]> = {
    LCP: [2500, 4000],
    FID: [100, 300],
    INP: [200, 500],
    CLS: [0.1, 0.25],
    TTFB: [800, 1800],
  };
  const [good, poor] = thresholds[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

export function recordMetric(name: MetricName, value: number): void {
  const entry: MetricEntry = {
    name,
    value,
    rating: rateMetric(name, value),
    timestamp: Date.now(),
  };
  metrics.push(entry);
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.info(`[perf] ${name}: ${value.toFixed(2)} (${entry.rating})`);
  }
}

export function getMetrics(): MetricEntry[] {
  return [...metrics];
}

export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      recordMetric('TTFB', nav.responseStart - nav.requestStart);
    }
  } catch {
    /* ignore */
  }

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      if (last) recordMetric('LCP', last.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    /* ignore */
  }

  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
        if (!entry.hadRecentInput && entry.value) {
          clsValue += entry.value;
        }
      }
      recordMetric('CLS', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    /* ignore */
  }

  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { duration?: number }>) {
        if (entry.duration) recordMetric('INP', entry.duration);
      }
    });
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch {
    /* ignore */
  }
}

export function reportWebVitalsSummary(): { score: number; metrics: MetricEntry[] } {
  const latest = new Map<MetricName, MetricEntry>();
  for (const m of metrics) {
    latest.set(m.name, m);
  }
  const values = Array.from(latest.values());
  const goodCount = values.filter((v) => v.rating === 'good').length;
  const score = values.length > 0 ? Math.round((goodCount / values.length) * 100) : 0;
  return { score, metrics: values };
}
