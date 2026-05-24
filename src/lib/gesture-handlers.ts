export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export type SwipeHandlers = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
};

export function attachSwipeGesture(element: HTMLElement, handlers: SwipeHandlers): () => void {
  const threshold = handlers.threshold ?? 48;
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!tracking || e.changedTouches.length !== 1) return;
    tracking = false;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX;
    const dy = endY - startY;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) handlers.onSwipeRight?.();
      else handlers.onSwipeLeft?.();
    } else {
      if (dy > 0) handlers.onSwipeDown?.();
      else handlers.onSwipeUp?.();
    }
  };

  element.addEventListener('touchstart', onTouchStart, { passive: true });
  element.addEventListener('touchend', onTouchEnd, { passive: true });

  return () => {
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchend', onTouchEnd);
  };
}

export type PullHandlers = {
  onPull?: () => void;
  threshold?: number;
};

export function attachPullToRefresh(element: HTMLElement, handlers: PullHandlers): () => void {
  const threshold = handlers.threshold ?? 80;
  let startY = 0;
  let pulling = false;

  const onTouchStart = (e: TouchEvent) => {
    if (element.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    pulling = true;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!pulling) return;
    const delta = e.touches[0].clientY - startY;
    if (delta > threshold && element.scrollTop === 0) {
      element.dataset.pulling = 'true';
    }
  };

  const onTouchEnd = () => {
    if (element.dataset.pulling === 'true') {
      handlers.onPull?.();
    }
    element.dataset.pulling = 'false';
    pulling = false;
  };

  element.addEventListener('touchstart', onTouchStart, { passive: true });
  element.addEventListener('touchmove', onTouchMove, { passive: true });
  element.addEventListener('touchend', onTouchEnd, { passive: true });

  return () => {
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchmove', onTouchMove);
    element.removeEventListener('touchend', onTouchEnd);
  };
}
