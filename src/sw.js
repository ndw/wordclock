// Adapted from Air Horner

const version = "@@VERSION@@";
const cacheName = `wordclock-${version}`;

self.addEventListener('install', e => {
  const timeStamp = Date.now();

  const uris = [
    `/`,
    `/index.html?timestamp=${timeStamp}`,
    `/sw.js?timestamp=${timeStamp}`,
    `/css/CLOCK.css?timestamp=${timeStamp}`,
    `/img/closed.png?timestamp=${timeStamp}`,
    `/img/logo-016.png?timestamp=${timeStamp}`,
    `/img/logo-064.png?timestamp=${timeStamp}`,
    `/img/logo-152.png?timestamp=${timeStamp}`,
    `/img/logo-167.png?timestamp=${timeStamp}`,
    `/img/logo-180.png?timestamp=${timeStamp}`,
    `/img/open.png?timestamp=${timeStamp}`,
    `/js/CLOCK.js?timestamp=${timeStamp}`,
    `/js/jquery-3.3.1.min.js?timestamp=${timeStamp}`
  ];

  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(uris)
        .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
  );
});
