// Simple Service Worker for PWA compliance
const CACHE_NAME = 'ironwall-v1';

self.addEventListener('install', (event) => {
    console.log('[SW] Installed');
});

self.addEventListener('fetch', (event) => {
    // Pass-through for local dev simplicity
    event.respondWith(fetch(event.request));
});
