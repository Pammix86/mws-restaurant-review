var cacheName = 'restaurantApp-5';

var filesToCache = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/js/main.js',
    '/css/styles.css',
    '/images/1-large.jpg',
    '/images/1-small.jpg',
    '/images/2-large.jpg',
    '/images/2-small.jpg',
    '/images/3-large.jpg',
    '/images/3-small.jpg',
    '/images/4-large.jpg',
    '/images/4-small.jpg',
    '/images/5-large.jpg',
    '/images/5-small.jpg',
    '/images/6-large.jpg',
    '/images/6-small.jpg',
    '/images/7-large.jpg',
    '/images/7-small.jpg',
    '/images/8-large.jpg',
    '/images/8-small.jpg',
    '/images/9-large.jpg',
    '/images/9-small.jpg',
    '/images/10-large.jpg',
    '/images/10-small.jpg'
  ];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
      caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
    );
    return self.clients.claim();
  });

  self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  });
  