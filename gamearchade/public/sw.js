/**
 * Service Worker for GameArchade
 * Handles offline functionality and caching strategies
 */

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Fetch event - implement caching strategies if needed
self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests
  // Later you can implement caching strategies here
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return offline page or cached response if needed
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
    );
  }
});
