/**
 * _antispam.js — הגנת ספאם לטפסים ציבוריים (מודול משותף, ללא handler)
 *
 * 1) honeypot: שדה נסתר בטופס (HONEYPOT_FIELD). משתמש אמיתי משאיר ריק;
 *    בוט נוטה למלא. אם מלא — מתייחסים כספאם.
 * 2) rate-limit: הגבלה לפי IP. best-effort בלבד — הזיכרון הוא per-instance
 *    ב-serverless ולכן עלול להתאפס בקריאה קרה. fail-open: אם אין IP, מאשרים.
 */

const HONEYPOT_FIELD = 'website';
const hits = new Map(); // "bucket:ip" -> [timestamps]

function isHoneypotTripped(payload) {
  return !!(payload && typeof payload[HONEYPOT_FIELD] === 'string'
    && payload[HONEYPOT_FIELD].trim() !== '');
}

function clientIp(event) {
  const h = (event && event.headers) || {};
  return h['x-nf-client-connection-ip']
    || (h['x-forwarded-for'] || '').split(',')[0].trim()
    || null;
}

function rateLimited(event, bucket, max, windowMs) {
  const ip = clientIp(event);
  if (!ip) return false; // fail-open
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear(); // ניקוי גס נגד נפיחת זיכרון
  return arr.length > max;
}

module.exports = { isHoneypotTripped, rateLimited, clientIp, HONEYPOT_FIELD };
