/**
 * _auth.js — אימות אדמין משותף לפונקציות רגישות (מודול משותף, ללא handler)
 *
 * מאמת JWT של Supabase מכותרת Authorization ובודק שהמשתמש הוא מנהל האתר.
 * דפוס זהה ל-send-push.js.
 *
 * env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (או SUPABASE_SERVICE_KEY), ADMIN_EMAIL
 */

const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'refael@tedgi.co.il').toLowerCase();

/**
 * מחזיר { ok:true, user } אם הבקשה מאדמין מאומת,
 * אחרת { ok:false, statusCode, error }.
 */
async function requireAdmin(event) {
  const authHeader = (event.headers &&
    (event.headers.authorization || event.headers.Authorization)) || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { ok: false, statusCode: 401, error: 'Missing authorization' };
  }
  const jwt = authHeader.slice(7);

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { ok: false, statusCode: 500, error: 'Server auth not configured' };
  }

  try {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: { user }, error } = await sb.auth.getUser(jwt);
    if (error || !user) {
      return { ok: false, statusCode: 401, error: 'Invalid session' };
    }
    if ((user.email || '').toLowerCase() !== ADMIN_EMAIL) {
      return { ok: false, statusCode: 403, error: 'Forbidden - admin only' };
    }
    return { ok: true, user };
  } catch (e) {
    console.error('[auth] getUser failed:', e.message);
    return { ok: false, statusCode: 401, error: 'Auth check failed' };
  }
}

module.exports = { requireAdmin, ADMIN_EMAIL };
