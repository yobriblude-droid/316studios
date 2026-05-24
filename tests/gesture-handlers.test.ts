import { describe, expect, it, vi } from 'vitest';
import { attachSwipeGesture } from '../src/lib/gesture-handlers';

function fireTouch(element: HTMLElement, type: 'touchstart' | 'touchend', x: number, y: number) {
  const touch = { clientX: x, clientY: y, identifier: 1, target: element };
  const event = new Event(type, { bubbles: true, cancelable: true });
  if (type === 'touchstart') {
    Object.defineProperty(event, 'touches', { value: [touch] });
  } else {
    Object.defineProperty(event, 'changedTouches', { value: [touch] });
  }
  element.dispatchEvent(event);
}

describe('gesture-handlers', () => {
  it('calls onSwipeLeft when swiping left', () => {
    const element = document.createElement('div');
    const onSwipeLeft = vi.fn();
    attachSwipeGesture(element, { onSwipeLeft, threshold: 30 });

    fireTouch(element, 'touchstart', 200, 100);
    fireTouch(element, 'touchend', 100, 100);

    expect(onSwipeLeft).toHaveBeenCalled();
  });
});
