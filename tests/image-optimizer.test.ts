import { describe, expect, it } from 'vitest';
import { buildSrcSet, getOptimizedSources } from '../src/lib/image-optimizer';

describe('image-optimizer', () => {
  it('builds srcset for local media paths', () => {
    const srcSet = buildSrcSet('/media/My%20Pics/photo.jpg');
    expect(srcSet).toContain('/media/My%20Pics/photo.jpg 400w');
    expect(srcSet).toContain('1600w');
  });

  it('returns placeholder for empty src', () => {
    const result = getOptimizedSources('');
    expect(result.placeholder).toContain('data:image');
  });
});
