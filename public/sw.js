const CACHE_NAME = 'korea-travel-map-v3';
const APP_SHELL = [
  './',
  './manifest.webmanifest',
  './pwa-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./', copy));
          return response;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }

        return response;
      });

      return cached || fetched;
    }),
  );
});

self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { notification: { body: event.data.text() } };
    }
  }

  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = notification.title || data.title || '새 기록 알림';
  const body = notification.body || data.body || '새 여행/데이트 기록이 저장됐어요.';
  const targetPath = data.targetPath || payload.fcmOptions?.link || './';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: data.recordId || 'record-notification',
      icon: './pwa-icon.svg',
      badge: './pwa-icon.svg',
      data: { targetPath },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetPath = event.notification.data?.targetPath || './';
  const appRoot = self.registration.scope || self.location.origin;
  const targetUrl = targetPath.startsWith('http')
    ? targetPath
    : new URL(targetPath.startsWith('/') ? `#${targetPath}` : targetPath, appRoot).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const matchingClient = clientList.find((client) => client.url === targetUrl || client.url.includes(targetPath));
      if (matchingClient) {
        return matchingClient.focus();
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
