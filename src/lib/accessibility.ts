export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
  );
}

export function trapFocus(container: HTMLElement): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || !container.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  const focusable = getFocusableElements(container);
  if (focusable[0]) {
    focusable[0].focus();
  }

  return () => container.removeEventListener('keydown', handleKeyDown);
}

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;
  const id = 'a11y-live-region';
  let region = document.getElementById(id);
  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }
  region.setAttribute('aria-live', priority);
  region.textContent = '';
  window.setTimeout(() => {
    region!.textContent = message;
  }, 50);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function handleRovingTabIndex(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number
): number {
  if (items.length === 0) return currentIndex;

  let next = currentIndex;

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    next = (currentIndex + 1) % items.length;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    next = (currentIndex - 1 + items.length) % items.length;
  } else if (event.key === 'Home') {
    event.preventDefault();
    next = 0;
  } else if (event.key === 'End') {
    event.preventDefault();
    next = items.length - 1;
  } else {
    return currentIndex;
  }

  items.forEach((el, i) => el.setAttribute('tabindex', i === next ? '0' : '-1'));
  items[next]?.focus();
  return next;
}
