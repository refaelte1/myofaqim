/**
 * שליחת התראות פוש למשתמשים
 *
 * דרישות:
 * - VAPID_PUBLIC_KEY
 * - VAPID_PRIVATE_KEY
 * - VAPID_SUBJECT (mailto:hello@myofaqim.co.il)
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * משתמש: רק רפאל (לפי email בJWT)
 */

const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAIL = 'refael@tedgi.co.il';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // אימות אדמין
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Missing authorization' }) };
  }
  const userJwt = authHeader.replace('Bearer ', '');

  // ספקים
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
  const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@myofaqim.co.il';

  if (!SUPABASE_URL || !SERVICE_KEY || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server config missing' }) };
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  // אימות שזה אדמין
  const sbAuth = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: { user }, error: authErr } = await sbAuth.auth.getUser(userJwt);
  if (authErr || !user || (user.email || '').toLowerCase() !== ADMIN_EMAIL) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden - admin only' }) };
  }

  // פרסור הבקשה
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { title, message, url, target } = body;
  if (!title || !message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'title and message required' }) };
  }

  // שליפת מנויים
  const sbAdmin = createClient(SUPABASE_URL, SERVICE_KEY);
  let query = sbAdmin.from('push_subscriptions').select('*').eq('is_active', true);
  if (target === 'registered') query = query.not('user_id', 'is', null);
  const { data: subs, error: subsErr } = await query;

  if (subsErr) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: subsErr.message }) };
  }

  if (!subs || subs.length === 0) {
    return { statusCode: 200, headers, body: JSON.stringify({ sent: 0, total: 0, message: 'אין מנויים פעילים' }) };
  }

  // שליחה
  const payload = JSON.stringify({
    title,
    body: message,
    url: url || '/',
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  });

  let sentCount = 0;
  let failedCount = 0;
  const failedEndpoints = [];

  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh || sub.p256dh_key,
          auth: sub.auth || sub.auth_key
        }
      }, payload);
      sentCount++;
    } catch (e) {
      failedCount++;
      // אם המנוי לא תקף (410/404) - הסר אותו
      if (e.statusCode === 410 || e.statusCode === 404) {
        failedEndpoints.push(sub.endpoint);
      }
    }
  }));

  // מחיקת מנויים לא תקפים
  if (failedEndpoints.length > 0) {
    await sbAdmin.from('push_subscriptions').delete().in('endpoint', failedEndpoints);
  }

  // לוג היסטוריה
  await sbAdmin.from('push_notifications_log').insert({
    title, body: message, url: url || null,
    sent_by: user.id,
    sent_count: sentCount,
    failed_count: failedCount
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      sent: sentCount,
      failed: failedCount,
      total: subs.length,
      cleaned: failedEndpoints.length
    })
  };
};
