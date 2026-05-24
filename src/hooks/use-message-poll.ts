import { useEffect, useRef, useCallback } from 'react';

/** Poll messages endpoint while tab is visible */
export function useMessagePoll(fetchMessages: () => void | Promise<void>, intervalMs = 4000) {
  const fetchRef = useRef(fetchMessages);
  fetchRef.current = fetchMessages;

  const tick = useCallback(() => {
    void fetchRef.current();
  }, []);

  useEffect(() => {
    tick();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') tick();
    }, intervalMs);
    const onFocus = () => tick();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [tick, intervalMs]);
}
