const CACHE_NAME = 'clients-db-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Встановлення Service Worker і кешування ресурсів
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Відкрито cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Активація Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Видалення старого cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Обробка запитів (Network First стратегія)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Якщо запит успішний, зберігаємо в cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Якщо немає мережі, повертаємо з cache
        return caches.match(event.request);
      })
  );
});

// Обробка background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-clients') {
    event.waitUntil(syncClients());
  }
});

async function syncClients() {
  // Тут можна додати логіку синхронізації даних
  console.log('Синхронізація даних...');
}

// Push notifications (для майбутнього використання)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Нове сповіщення';
  const options = {
    body: data.body || 'У вас нове повідомлення',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
