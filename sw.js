// Service Worker — La Casa Del Pan
// Estrategia: cache-first con revalidación en segundo plano (stale-while-revalidate)
const CACHE_NAME = 'lacasadepan-v2';
const CORE_ASSETS = [
    './',
    './index.html',
    './catalogo.html',
    './css/shared.css',
    './css/catalogo.css',
    './css/inicio.css',
    './js/shared.js',
    './js/catalogo.js',
    './js/inicio.js',
    './productos.json',
    './img/Croissants.jpg',
    './img/TortaChocolate.jpg',
    './img/Empanadas.jpg'
];

// Instalación: precargar los recursos básicos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: stale-while-revalidate para navegación y recursos, cache-first para el resto
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Solo manejar GET
    if (request.method !== 'GET') return;

    // No interceptar requests de terceros (imágenes de Unsplash, Google Fonts, etc.)
    if (url.origin !== self.location.origin) return;

    // Stale-while-revalidate para HTML y JSON (siempre frescos cuando hay red)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                return response;
            }).catch(() => caches.match(request).then((r) => r || caches.match('./index.html')))
        );
        return;
    }

    // Cache-first con revalidación para el resto de recursos locales
    event.respondWith(
        caches.match(request).then((cached) => {
            const fetchPromise = fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
