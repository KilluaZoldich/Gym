const CACHE_NAME = 'gym-app-v1';

// Installazione del service worker
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Attivazione del service worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  self.clients.claim();
});

// Intercettazione delle richieste
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});