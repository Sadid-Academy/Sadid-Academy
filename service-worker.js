// Service Worker for Sadid Academy
// استراتيجية: Cache First للموارد الثابتة، Network First للمحتوى الديناميكي

const CACHE_NAME = 'sadid-academy-v2';
const ASSETS_CACHE = 'sadid-academy-assets-v2';
const API_CACHE = 'sadid-academy-api-v2';

// الموارد الأساسية التي يجب تخزينها
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/courses.html',
  '/course-quran.html',
  '/course-arabic.html',
  '/course-islamic.html',
  '/enroll.html',
  '/thank-you.html',
  '/tailwind-compiled.css',
  '/main.js',
  '/manifest.json',
  '/robots.txt',
  '/assets/images/logo.webp',
  '/assets/images/course-quran.webp',
  '/assets/images/course-arabic.webp',
  '/assets/images/course-islamic.webp',
  '/locales/ar.json',
  '/locales/en.json',
];

// تثبيت Service Worker وتخزين الموارد الحرجة
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // تخزين الموارد الحرجة
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(CRITICAL_ASSETS).catch((err) => {
          console.warn('Failed to cache some critical assets:', err);
        });
      }),
    ]).then(() => self.skipWaiting())
  );
});

// تنظيف الـ Cache القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== ASSETS_CACHE && 
              cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// معالج Fetch - استراتيجيات مختلفة حسب نوع الموارد
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل غير الـ HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // تجاهل المطالبات غير GET
  if (request.method !== 'GET') {
    return;
  }

  // استراتيجية لـ JSON (Network First - للترجمات والبيانات الديناميكية)
  if (url.pathname.includes('/locales/') && request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // استراتيجية لـ Assets (Cache First)
  if (isAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, ASSETS_CACHE));
    return;
  }

  // استراتيجية افتراضية للصفحات (Network First with fallback to cache)
  event.respondWith(networkFirstStrategy(request, CACHE_NAME));
});

/**
 * استراتيجية Cache First
 * تحاول الحصول على الموارد من الـ cache أولاً
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    // ابحث في الـ cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // تحديث الـ cache في الخلفية
      updateCache(request, cacheName);
      return cachedResponse;
    }

    // إذا لم تكن موجودة، اجلبها من الشبكة
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // خزن النسخة الناجحة
      const clonedResponse = networkResponse.clone();
      caches.open(cacheName).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }

    return networkResponse;
  } catch (error) {
    // عند فشل الشبكة والـ cache، أرجع fallback page
    return caches.match('/index.html') || 
           new Response('Offline - Please check your connection', {
             status: 503,
             statusText: 'Service Unavailable',
           });
  }
}

/**
 * استراتيجية Network First
 * تحاول الشبكة أولاً، وتعود للـ cache عند الفشل
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    // حاول الحصول من الشبكة أولاً
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      // خزن النسخة الناجحة
      const clonedResponse = networkResponse.clone();
      caches.open(cacheName).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }

    return networkResponse;
  } catch (error) {
    // إذا فشلت الشبكة، اجلب من الـ cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // إذا لم تكن موجودة في الـ cache، أرجع fallback
    return caches.match('/index.html') || 
           new Response('Offline - Please check your connection', {
             status: 503,
             statusText: 'Service Unavailable',
           });
  }
}

/**
 * تحديث الـ cache في الخلفية
 */
async function updateCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // الفشل الهادئ في التحديث في الخلفية
  }
}

/**
 * فحص إذا كان الطلب موردًا ثابتًا
 */
function isAsset(pathname) {
  return /\.(js|css|webp|png|jpg|jpeg|svg|woff|woff2|ttf|eot|gif)$/i.test(pathname) ||
         pathname.includes('/assets/');
}

// معالجة الرسائل من العملاء
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
