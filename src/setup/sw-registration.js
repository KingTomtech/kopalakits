/**
 * Register the service worker used by the PWA shell.
 * Imported for its side effects only — never render its contents.
 */
export function registerServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => { console.log('SW registered:', registration.scope); })
      .catch((err) => { console.log('SW registration failed:', err); });
  });
}

/**
 * Trigger a background sync so the service worker re-fetches the API cache.
 * Currently unused by the SPA, but kept here for future admin->shop integration.
 */
export async function triggerRefresh() {
  if (typeof navigator === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (!('sync' in ServiceWorkerRegistration.prototype)) return;
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('kopala-refresh');
}
