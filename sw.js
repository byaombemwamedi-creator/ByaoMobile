// BYAO Advanced Service Worker (sw.js) - Offline-First Ecosystem
const CACHE_NAME = 'byao-master-v100';
const urlsToCache = [
    './',
    './index.html',
    './studio.html',
    './ide.html',
    './masterfinishproject.html',
    'https://cdn.tailwindcss.com'
];

// 1. Wakati wa Kusakinisha App (Install Event)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('BYAO Cache imefunguliwa kikamilifu');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. Wakati wa Kuamilisha Service Worker (Activate Event)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Inafuta cache ya zamani:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Kudaka maombi yote (Fetch Event) - Stratejia ya Offline-First & Network Fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Kama ipo kwenye cache ya simu, itoe hapo hapo hata kama hakuna intaneti
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Kama haipo kwenye cache, ikaifuate mtandaoni huku ikiihifadhi kwa ajili ya siku zijazo
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }).catch(() => {
                    // Ikitokea hakuna mtandao kabisa na faili halipo kwenye cache, usilete error mbaya
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});