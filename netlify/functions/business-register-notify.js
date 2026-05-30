/**
 * ════════════════════════════════════════════════════
 * business-register-notify.js - Netlify Function (ציבורי)
 *
 * נשלח מיד לאחר שעסק חדש נרשם דרך טופס ההרשמה (biz-register).
 * שולח לבעל העסק:
 *   - מייל "אישור הרשמה" דרך Resend (התבנית הקיימת מ-send-welcome)
 *   - SMS דרך 019 שההרשמה התקבלה וממתינה לאישור
 *
 * אבטחה: הפונקציה ציבורית אך אינה מקבלת טלפון/מייל מהלקוח.
 * היא מקבלת רק את ה-slug, מאתרת את העסק ב-DB עם service key,
 * ומוודאת שהעסק במצב 'pending' ונוצר זה עתה — ואז שולחת אך ורק
 * לטלפון/מייל השמורים על אותה רשומה. כך אי אפשר לנצל אותה
 * לשליחת SMS/מייל לכתובות שרירותיות.
 *
 * POST /.netlify/functions/business-register-notify
 * body: { slug: "my-business-x1y2" }
 *
 * env: RESEND_API_KEY, SMS_019_USERNAME, SMS_019_TOKEN, SMS_019_SOURCE,
 *      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (או SUPABASE_SERVICE_KEY)
 * ════════════════════════════════════════════════════
 */

const { sendSms } = require('./_sms');
const welcome = require('./send-welcome');
const { rateLimited } = require('./_antispam');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const SITE_URL = 'https://myofaqim.co.il';

// חלון זמן: שולחים התראה רק לעסק שנרשם ב-30 הדקות האחרונות
const FRESH_WINDOW_MS = 30 * 60 * 1000;

function json(status, data) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  // הגבלת קצב גסה לפי IP (best-effort)
  if (rateLimited(event, 'biz-reg-notify', 15, 60 * 1000)) {
    return json(429, { error: 'Too many requests' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Invalid JSON' }); }

  const slug = (body.slug || '').trim();
  if (!slug) return json(400, { error: 'slug is required' });

  if (!SERVICE_KEY) {
    console.error('[reg-notify] SUPABASE service key not configured');
    return json(500, { error: 'Server not configured' });
  }

  // ── איתור העסק לפי slug (PostgREST, service key) ──────────
  let biz;
  try {
    const url = `${SUPABASE_URL}/rest/v1/businesses` +
      `?slug=eq.${encodeURIComponent(slug)}` +
      `&select=business_name,name,phone,email,owner_name,plan,plan_tier,status,created_at` +
      `&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`PostgREST ${res.status}`);
    const rows = await res.json();
    biz = Array.isArray(rows) ? rows[0] : null;
  } catch (e) {
    console.error('[reg-notify] lookup failed:', e.message);
    return json(500, { error: 'Lookup failed' });
  }

  if (!biz) return json(404, { error: 'Business not found' });

  // ── שערי בטיחות: רק רשומה ממתינה לאישור שנוצרה זה עתה ──────
  if (biz.status && biz.status !== 'pending') {
    return json(200, { ok: true, skipped: 'not_pending' });
  }
  const createdAt = biz.created_at ? new Date(biz.created_at).getTime() : 0;
  if (!createdAt || (Date.now() - createdAt) > FRESH_WINDOW_MS) {
    return json(200, { ok: true, skipped: 'not_fresh' });
  }

  const bizName = (biz.business_name || biz.name || 'העסק שלך').trim();
  const ownerName = (biz.owner_name || '').trim();
  const firstName = ownerName ? ownerName.split(' ')[0] : '';
  const plan = (biz.plan_tier || biz.plan || 'free').toLowerCase();

  const results = { email_sent: false, sms_sent: false };

  // ── מייל אישור הרשמה דרך Resend (תבנית קיימת מ-send-welcome) ──
  if (biz.email && RESEND_API_KEY) {
    try {
      const { subject, html } = welcome.getEmailContent('business', ownerName, {
        bizName,
        plan,
      });
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: welcome.FROM_EMAIL,
          to: [biz.email],
          subject,
          html,
        }),
      });
      results.email_sent = res.ok;
      if (!res.ok) {
        const t = await res.text();
        console.warn('[reg-notify] email failed:', res.status, t);
      }
    } catch (e) {
      console.warn('[reg-notify] email error:', e.message);
    }
  }

  // ── SMS: ההרשמה התקבלה וממתינה לאישור ─────────────────────
  if (biz.phone) {
    try {
      const hello = firstName ? `שלום ${firstName},\n` : '';
      const smsText =
        `${hello}קיבלנו את בקשת ההרשמה של העסק "${bizName}" לאופקים שלי.\n` +
        `הבקשה ממתינה כעת לאישור הצוות (עד 24-48 שעות) ונעדכן אותך כשהעסק יעלה לאוויר.\n` +
        `אופקים שלי | ${SITE_URL.replace('https://', '')}`;
      await sendSms(biz.phone, smsText);
      results.sms_sent = true;
    } catch (e) {
      console.warn('[reg-notify] SMS error:', e.message);
    }
  }

  console.log('[reg-notify]', { slug, bizName, ...results });
  return json(200, { ok: true, ...results });
};
