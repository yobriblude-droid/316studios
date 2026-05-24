import { describe, expect, it } from 'vitest';
import { getFocusableElements, prefersReducedMotion, trapFocus } from '../src/lib/accessibility';

describe('accessibility', () => {
  it('detects reduced motion preference', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });

  it('finds focusable elements in a container', () => {
    document.body.innerHTML = `
      <div id="trap">
        <button>One</button>
        <a href="/">Two</a>
        <input type="text" />
      </div>
    `;
    const trap = document.getElementById('trap') as HTMLElement;
    const focusable = getFocusableElements(trap);
    expect(focusable.length).toBe(3);
  });

  it('trapFocus returns cleanup function', () => {
    document.body.innerHTML = `<div id="modal"><button>A</button><button>B</button></div>`;
    const modal = document.getElementById('modal') as HTMLElement;
    const cleanup = trapFocus(modal);
    expect(typeof cleanup).toBe('function');
    cleanup();
  });
});
