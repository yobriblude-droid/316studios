import { describe, expect, it } from 'vitest';
import { cacheStrategy } from '../src/lib/cache-strategy';

describe('cacheStrategy', () => {
  it('defines stale times', () => {
    expect(cacheStrategy.staleTime.default).toBeGreaterThan(0);
    expect(cacheStrategy.staleTime.static).toBeGreaterThan(cacheStrategy.staleTime.realtime);
  });

  it('lists prefetch routes', () => {
    expect(cacheStrategy.prefetchRoutes).toContain('/projects');
    expect(cacheStrategy.prefetchRoutes).toContain('/dashboard');
  });
});
