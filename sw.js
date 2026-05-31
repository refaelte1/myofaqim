/**
 * ════════════════════════════════════════════════════
 * Service Worker - אופקים שלי PWA
 *
 * - מאפשר עבודה offline
 * - מאיץ טעינה (cache assets)
 * - תומך ב"הוסף למסך הבית"
 * ════════════════════════════════════════════════════
 */

const CACHE_VERSION = 'myofaqim-v1.2.0';
const ASSETS_TO_CACHE = [
  '/',
  '/site.css?v=20260531',
  '/site.js?v=20260531',
  '/logo.png',
  '/logo-wide.png',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon-32.png',
];

// התקנה - שמירת קבצים בסיסיים ב-cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Cache failed:', err))
  );
});

// הפעלה - מחיקת מטמון ישן
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// אסטרטגיית fetch - Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // רק GET requests
  if (event.request.method !== 'GET') return;

  // דלג על: Supabase, API calls, פאנלים אדמיניסטרטיביים
  const url = event.request.url;
  if (url.includes('supabase.co') ||
      url.includes('/.netlify/functions/') ||
      url.includes('/admin') ||
      url.includes('/sms-broadcast') ||
      url.includes('hebcal.com') ||
      url.includes('googletagmanager') ||
      url.includes('google-analytics') ||
      url.startsWith('chrome-extension:') ||
      url.startsWith('moz-extension:') ||
      url.startsWith('safari-extension:') ||
      !url.startsWith('http')) {
    return; // תן לדפדפן לטפל בזה רגיל
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // קח עותק של התגובה
        const responseToCache = response.clone();

        // שמור ב-cache (רק אם תקין ורק http/https)
        if (response.status === 200 && response.type === 'basic' &&
            (event.request.url.startsWith('http://') || event.request.url.startsWith('https://'))) {
          caches.open(CACHE_VERSION)
            .then((cache) => {
              try { cache.put(event.request, responseToCache); } catch {}
            });
        }

        return response;
      })
      .catch(() => {
        // אם הרשת נופלת - תן את הגרסה השמורה
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});

/* ════════════════════════════════════════════════════════════
   Push Notifications
   ════════════════════════════════════════════════════════════ */

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'אופקים שלי', body: event.data.text() };
  }

  const title = data.title || 'אופקים שלי';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'general',
    data: { url: data.url || '/', ...data },
    requireInteraction: data.requireInteraction || false,
    dir: 'rtl',
    lang: 'he'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // אם יש כבר טאב פתוח עם האתר - שים אותו בפוקוס
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // אחרת - פתח חלון חדש
        return self.clients.openWindow(url);
      })
  );
});
