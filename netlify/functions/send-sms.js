/**
 * ════════════════════════════════════════════════════
 * send-sms.js - Netlify Function
 *
 * שולח SMS דרך 019sms.co.il
 * תיעוד רשמי: https://docs.019sms.co.il/sms/send-sms.html
 *
 * 🔑 הגדרות נדרשות ב-Netlify Environment Variables:
 *    SMS_019_USERNAME = שם משתמש ב-019
 *    SMS_019_TOKEN    = API Token (לא הסיסמה הרגילה!)
 *    SMS_019_SOURCE   = שם השולח שאישרו לך (למשל "MyOfaqim")
 *
 * 💡 איפה למצוא את ה-TOKEN ב-019:
 *    התחבר ל-019 → אזור אישי → "הרשאות API" → "צור token"
 *
 * 📞 שימוש:
 *    POST /.netlify/functions/send-sms
 *    body: { phone: "0501234567", message: "שלום!" }
 *
 * 💰 עלות: ~0.10-0.15 ₪ להודעה
 * 📝 אורך: עד 1005 תווים
 * ════════════════════════════════════════════════════
 */

const SMS_019_USERNAME = process.env.SMS_019_USERNAME;
const SMS_019_TOKEN    = process.env.SMS_019_TOKEN || process.env.SMS_019_PASSWORD;
const SMS_019_SOURCE   = process.env.SMS_019_SOURCE || 'MyOfaqim';

const API_URL = 'https://019sms.co.il/api';

function json(status, data) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  };
}

function normalizePhone(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let clean = raw.replace(/[\s\-\(\)+]/g, '');
  if (clean.startsWith('972')) clean = '0' + clean.substring(3);
  if (/^05\d{8}$/.test(clean)) return clean;
  return null;
}

async function sendVia019(phone, message) {
  const payload = {
    sms: {
      user: { username: SMS_019_USERNAME },
      source: SMS_019_SOURCE,
      destinations: {
        phone: [{ "_": phone }]
      },
      message: message,
    }
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SMS_019_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  console.log('019 raw response:', responseText);

  let data;
  try { data = JSON.parse(responseText); }
  catch { throw new Error(`019 returned non-JSON: ${responseText.substring(0, 200)}`); }

  if (data?.sms?.status && data.sms.status !== 0) {
    throw new Error(`019 status ${data.sms.status}: ${data.sms.message || 'unknown error'}`);
  }
  if (!res.ok) {
    throw new Error(`019 HTTP ${res.status}: ${responseText}`);
  }
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  if (!SMS_019_USERNAME || !SMS_019_TOKEN) {
    console.error('Missing SMS_019 credentials');
    return json(500, {
      error: 'SMS service not configured',
      hint: 'Add SMS_019_USERNAME and SMS_019_TOKEN to Netlify env vars'
    });
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Invalid JSON' }); }

  const { phone: rawPhone, message } = payload;

  if (!message || message.length === 0) return json(400, { error: 'message is required' });
  if (message.length > 1005) return json(400, { error: 'message too long (max 1005 chars)' });

  const phone = normalizePhone(rawPhone);
  if (!phone) return json(400, { error: 'Invalid Israeli phone number. Format: 0501234567' });

  try {
    const result = await sendVia019(phone, message);
    return json(200, { ok: true, phone, result });
  } catch (e) {
    console.error('SMS send failed:', e.message);
    return json(500, { error: 'Failed to send SMS', details: e.message });
  }
};
