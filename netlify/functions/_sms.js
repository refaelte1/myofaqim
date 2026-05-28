/**
 * _sms.js — שליחת SMS דרך 019sms.co.il (מודול משותף, ללא handler)
 *
 * מודול פנימי בלבד. אין כאן בדיקת הרשאות — כל קורא חייב לאכוף הרשאה
 * בעצמו (למשל requireAdmin) לפני הקריאה ל-sendSms.
 *
 * env: SMS_019_USERNAME, SMS_019_TOKEN (או SMS_019_PASSWORD), SMS_019_SOURCE
 */

const SMS_019_USERNAME = process.env.SMS_019_USERNAME;
const SMS_019_TOKEN    = process.env.SMS_019_TOKEN || process.env.SMS_019_PASSWORD;
const SMS_019_SOURCE   = process.env.SMS_019_SOURCE || 'MyOfaqim';

const API_URL = 'https://019sms.co.il/api';

function err(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

function normalizePhone(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let clean = raw.replace(/[\s\-\(\)+]/g, '');
  if (clean.startsWith('972')) clean = '0' + clean.substring(3);
  if (/^05\d{8}$/.test(clean)) return clean;
  return null;
}

async function sendSms(rawPhone, message) {
  if (!SMS_019_USERNAME || !SMS_019_TOKEN) {
    throw err(500, 'SMS service not configured');
  }
  if (!message || message.length === 0) throw err(400, 'message is required');
  if (message.length > 1005) throw err(400, 'message too long (max 1005 chars)');

  const phone = normalizePhone(rawPhone);
  if (!phone) throw err(400, 'Invalid Israeli phone number. Format: 0501234567');

  const payload = {
    sms: {
      user: { username: SMS_019_USERNAME },
      source: SMS_019_SOURCE,
      destinations: { phone: [{ "_": phone }] },
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
  catch { throw err(502, `019 returned non-JSON: ${responseText.substring(0, 200)}`); }

  if (data?.sms?.status && data.sms.status !== 0) {
    throw err(502, `019 status ${data.sms.status}: ${data.sms.message || 'unknown error'}`);
  }
  if (!res.ok) {
    throw err(502, `019 HTTP ${res.status}: ${responseText}`);
  }
  return { phone, result: data };
}

module.exports = { sendSms, normalizePhone };
