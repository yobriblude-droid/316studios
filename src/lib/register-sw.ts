export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  if (import.meta.env.DEV) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.info('[sw] registered', registration.scope);
        }
      })
      .catch((error) => {
        console.warn('[sw] registration failed', error);
      });
  });
}
