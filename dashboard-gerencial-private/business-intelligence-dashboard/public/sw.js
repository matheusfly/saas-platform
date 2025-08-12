// Service Worker for Business Intelligence Dashboard
const APP_VERSION = '1.0.0';
const CACHE_NAME = `bi-dashboard-${APP_VERSION}`;
const OFFLINE_URL = '/offline.html';
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_ENTRIES = 100; // Maximum number of entries in the cache

// Precached assets
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.css',
  '/index.js',
  'https://esm.sh/react@19.2.0',
  'https://esm.sh/react-dom@19.2.0',
  'https://esm.sh/recharts@3.1.0',
  'https://d3js.org/d3.v7.min.js',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/screenshots/dashboard.png',
  '/screenshots/mobile.png',
  OFFLINE_URL
];

// Cache strategies
const CACHE_STRATEGIES = {
  PRECACHE: 'precache',
  NETWORK_FIRST: 'networkFirst',
  CACHE_FIRST: 'cacheFirst',
  STALE_WHILE_REVALIDATE: 'staleWhileRevalidate'
};

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Installing new version:', APP_VERSION);
        return cache.addAll(PRECACHE_URLS)
          .then(() => {
            console.log('[Service Worker] All resources have been cached');
            return self.skipWaiting();
          });
      })
      .catch(error => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating new service worker...');
  
  const cacheCleanup = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      
      // Clean up old cache entries
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      const now = Date.now();
      
      // Remove old cache entries
      await Promise.all(
        requests.map(request => {
          const url = new URL(request.url);
          const cacheTime = parseInt(url.searchParams.get('_swCacheTime') || '0', 10);
          
          if (now - cacheTime > MAX_CACHE_AGE_MS) {
            return cache.delete(request);
          }
          return null;
        }).filter(Boolean)
      );
      
      // Enforce maximum cache size
      if (requests.length > MAX_CACHE_ENTRIES) {
        const toDelete = requests.length - MAX_CACHE_ENTRIES;
        await Promise.all(
          requests.slice(0, toDelete).map(request => cache.delete(request))
        );
      }
      
      await self.clients.claim();
      console.log('[Service Worker] Activated and ready to handle fetches');
    } catch (error) {
      console.error('[Service Worker] Activation failed:', error);
      throw error;
    }
  };
  
  event.waitUntil(cacheCleanup());
});

// Helper function to get cache strategy for a request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (!url.origin.startsWith(self.location.origin)) {
    return null;
  }
  
  // API requests - use network first
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Static assets - use cache first with revalidation
  if (/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(url.pathname)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // HTML documents - use stale-while-revalidate
  if (request.headers.get('Accept').includes('text/html')) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Default to network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, serving from cache', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match(OFFLINE_URL);
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Update cache in the background
    fetchAndCache(request).catch(console.error);
    return cachedResponse;
  }
  return fetchAndCache(request);
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetchAndCache(request);
  
  // Return cached response immediately, then update
  return cachedResponse || fetchPromise;
}

// Helper to fetch and cache responses
async function fetchAndCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

// Main fetch event handler
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests that we don't control
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Get the appropriate cache strategy
  const strategy = getCacheStrategy(event.request);
  
  if (!strategy) {
    return; // Skip this request
  }
  
  // Apply the appropriate strategy
  switch (strategy) {
    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(event.request));
      break;
      
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(event.request));
      break;
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(event.request));
      break;
      
    default:
      // Default to network first
      event.respondWith(networkFirst(event.request));
  }
});

// Background sync for offline data sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Push notification event listener
self.addEventListener('push', event => {
  const data = event.data?.json();
  const title = data?.title || 'New Update';
  const options = {
    body: data?.body || 'There is new content available.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: data?.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Background sync implementation
async function syncData() {
  // Implement your background sync logic here
  // This is called when the device comes back online
  console.log('Syncing data in the background...');
  
  // Example: Sync any pending API requests
  // const cache = await caches.open('sync-requests');
  // const requests = await cache.keys();
  // 
  // for (const request of requests) {
  //   try {
  //     const response = await fetch(request);
  //     if (response.ok) {
  //       await cache.delete(request);
  //     }
  //   } catch (error) {
  //     console.error('Sync failed:', error);
  //   }
  // }
}
