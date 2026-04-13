const CACHE_NAME = 'pharmacy-manager-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/offline.html',
  'https://unpkg.com/dexie@3.2.3/dist/dexie.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Cache addAll error', err))
  );
  self.skipWaiting();
});

// حذف الكاش القديم عند تفعيل نسخة جديدة
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية: Cache First ثم Network (للملفات الثابتة)
// وللطلبات الديناميكية (API) يمكن استخدام Network First
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // نسمح بمرور طلبات IndexedDB و localStorage (لا يتم اعتراضها)
  if (event.request.url.includes('indexeddb') || event.request.url.includes('localhost')) {
    return;
  }
  
  // استراتيجية Cache First للملفات الثابتة
  if (urlsToCache.includes(requestUrl.pathname) || 
      requestUrl.pathname.match(/\.(css|js|html|png|jpg|jpeg|gif|svg)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          }).catch(() => {
            // إذا فشل الشبكة وليس لدينا كاش، نعرض صفحة الأوفلاين
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('غير متصل بالإنترنت', { status: 503 });
          });
        })
    );
  } else {
    // Network First للمحتوى الديناميكي (يمكن تعديله حسب الحاجة)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('غير متصل بالإنترنت', { status: 503 });
          });
        })
    );
  }
});
