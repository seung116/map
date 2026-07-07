export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    const manifestHref = document.querySelector('link[rel="manifest"]')?.href || window.location.href;
    const serviceWorkerUrl = new URL('sw.js', manifestHref);

    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
