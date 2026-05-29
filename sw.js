/**
 * ════════════════════════════════════════════════════
 * Service Worker - אופקים שלי PWA
 *
 * אסטרטגיות:
 *   • ניווט (דפי HTML)   → Network-first + navigation preload,
 *                          נפילה לעמוד שמור ואז ל-/offline.html
 *   • נכסים סטטיים        → Stale-While-Revalidate (מהיר + עובד offline)
 *   • Google Fonts        → Cache-first (מטמון נפרד וקבוע)
 *   • Push Notifications  → התראות בעברית/RTL
 * ════════════════════════════════════════════════════
 */

const VERSION = 'v1.2.0';
const CORE_CACHE = `myofaqim-core-${VERSION}`;
const RUNTIME_CACHE = `myofaqim-runtime-${VERSION}`;
const FONTS_CACHE = `myofaqim-fonts-${VERSION}`;
const CURRENT_CACHES = [CORE_CACHE, RUNTIME_CACHE, FONTS_CACHE];

const OFFLINE_URL = '/offline.html';

// קבצים חיוניים — חייבים להישמר בהתקנה
const CORE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/site.css',
  '/site.js',
  '/manifest.json',
  '/logo-wide.png',
  '/logo-wide-mobile.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon-32.png',
];

// דפים מרכזיים — נשמרים במאמץ-מיטבי (כישלון בודד לא מפיל את ההתקנה)
const OPTIONAL_PAGES = [
  '/home',
  '/businesses',
  '/deals',
  '/zmanim',
  '/forum',
];

// ── התקנה ────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await cache.addAll(CORE_ASSETS);
    await Promise.allSettled(OPTIONAL_PAGES.map((u) => cache.add(u)));
    await self.skipWaiting();
  })().catch((err) => console.warn('[SW] install failed:', err)));
});

// ── הפעלה — ניקוי מטמון ישן + הפעלת navigation preload ────────
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    const names = await caches.keys();
    await Promise.all(
      names.filter((n) => !CURRENT_CACHES.includes(n)).map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

// ── אסטרטגיות עזר ─────────────────────────────────────────────

// Cache-first: למשאבים קבועים (גופנים)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return cached || Response.error();
  }
}

// Stale-While-Revalidate: מחזיר מהמטמון מיד ומרענן ברקע
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

// Network-first לניווטים, עם navigation preload ונפילה ל-offline
async function networkFirstNavigation(event) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const preloaded = await event.preloadResponse;
    if (preloaded) {
      cache.put(event.request, preloaded.clone());
      return preloaded;
    }
    const response = await fetch(event.request);
    if (response && response.status === 200) {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch (err) {
    return (
      (await caches.match(event.request)) ||
      (await caches.match(OFFLINE_URL)) ||
      (await caches.match('/'))
    );
  }
}

// ── fetch ─────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch { return; }
  if (!url.protocol.startsWith('http')) return;

  // Google Fonts → Cache-first במטמון ייעודי
  if (url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, FONTS_CACHE));
    return;
  }

  // משאבים שחייבים להיות תמיד חיים — תן לדפדפן לטפל ישירות
  const href = request.url;
  if (href.includes('supabase.co') ||
      href.includes('/.netlify/functions/') ||
      href.includes('/admin') ||
      href.includes('/sms-broadcast') ||
      href.includes('hebcal.com') ||
      href.includes('googletagmanager') ||
      href.includes('google-analytics')) {
    return;
  }

  // מכאן ואילך — רק same-origin
  if (url.origin !== self.location.origin) return;

  // ניווטים (דפי HTML)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }

  // נכסים סטטיים (css/js/תמונות/וכו')
  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
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
