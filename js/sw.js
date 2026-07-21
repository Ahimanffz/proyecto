const CACHE_NAME = 'kyrox-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './manifest.json'
];

// Instalar el Service Worker y guardar en caché los archivos base
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptar peticiones para devolver los archivos cacheados si no hay internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Devuelve el archivo del caché
                }
                return fetch(event.request); // Si no está en caché, lo busca en internet
            })
    );
});