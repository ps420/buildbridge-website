// BuildBridge Service Worker v6.0
// Fortune 500 PWA Support

const CACHE_NAME = 'buildbridge-v6.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/projects.html',
  '/contact.html',
  '/styles.css',
  '/scripts.js',
  '/assets/BuildBridge_Icon_Mark.svg',
  '/assets/BuildBridge_Logo_Horizontal_White.svg',
  '/assets/02_Website_Heroes/Hero_1.png',
  '/assets/02_Website_Heroes/Hero_2.png',
  '/assets/03_Social_Campaign/Campaign_4.png',
  '/assets/03_Social_Campaign/Campaign_5.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip analytics and external requests
  if (request.url.includes('analytics') || 
      request.url.includes('google') ||
      request.url.includes('whatsapp')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        // Return cached version or fetch from network
        if (cached) {
          // Update cache in background
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, clone));
              }
            })
            .catch(() => {});
          
          return cached;
        }
        
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // Return offline fallback if available
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'form-submission') {
    event.waitUntil(handleFormSubmission());
  }
});

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/BuildBridge_Icon_Mark.svg',
    badge: '/assets/BuildBridge_Icon_Mark.svg',
    data: data.url,
    actions: data.actions || [],
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

async function handleFormSubmission() {
  // Handle queued form submissions when back online
  const db = await openDB('form-submissions', 1);
  const submissions = await db.getAll('submissions');
  
  for (const submission of submissions) {
    try {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(submission)
      });
      await db.delete('submissions', submission.id);
    } catch (error) {
      console.log('[SW] Form submission failed:', error);
    }
  }
}

console.log('[BuildBridge SW] Service Worker Loaded v6.0');
