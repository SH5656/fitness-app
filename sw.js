const CACHE_NAME = 'fitness-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_STEPS') {
        updateNotification(event.data.steps);
    }
});

function updateNotification(steps) {
    self.registration.showNotification('My Daily Fitness', {
        body: `Current Steps: ${steps} 🚶`,
        icon: 'https://cdn-icons-png.flaticon.com/512/847/847969.png', // Fallback icon
        badge: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
        tag: 'step-count', // Ensures only one notification exists
        renotify: false, // Don't buzz on every step
        silent: true, // Keep it quiet
        requireInteraction: false, // Allows it to be dismissed if needed, but we often want it persistent
        sticky: true // Try to make it sticky if browser supports it
    });
}
