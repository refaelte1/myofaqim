/**
 * ════════════════════════════════════════════════════
 * send-sms.js - Netlify Function (אדמין בלבד)
 *
 * שולח SMS דרך 019sms.co.il. נגיש רק למנהל האתר (JWT של Supabase).
 * קריאות שרת-לשרת אינן עוברות כאן — הן קוראות ישירות ל-./_sms.
 *
 * POST /.netlify/functions/send-sms
 * headers: Authorization: Bearer <supabase-access-token>
 * body: { phone: "0501234567", message: "שלום!" }
 *
 * env: SMS_019_USERNAME, SMS_019_TOKEN, SMS_019_SOURCE,
 *      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL
 * ════════════════════════════════════════════════════
 */

const { requireAdmin } = require('./_auth');
const { sendSms } = require('./_sms');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status, data) {
  return {
    statusCode: status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const auth = await requireAdmin(event);
  if (!auth.ok) return json(auth.statusCode, { error: auth.error });

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Invalid JSON' }); }

  try {
    const result = await sendSms(payload.phone, payload.message);
    return json(200, { ok: true, ...result });
  } catch (e) {
    console.error('SMS send failed:', e.message);
    return json(e.status || 500, { error: e.message || 'Failed to send SMS' });
  }
};
