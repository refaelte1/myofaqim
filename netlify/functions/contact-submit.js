// Netlify Function: contact-submit
// מקבלת פנייה מטופס "יצירת קשר", שומרת ב-Supabase דרך REST API,
// ושולחת מייל אישור ללקוח ומייל התראה לאדמין דרך Resend.
// POST /.netlify/functions/contact-submit
// body: { name, phone, email, topic, message, source }
//
//  ללא תלות ב-@supabase/supabase-js - שימוש ב-fetch ישיר ל-REST API.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const MAKE_WEBHOOK_URL = process.env.MAKE_CONTACT_WEBHOOK_URL || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'refael@tedgi.co.il';
const SITE_URL = 'https://myofaqim.co.il';
const SENDER = 'אופקים שלי <noreply@myofaqim.co.il>';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function isValidEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

// ── Save to Supabase via REST API ────────────────────
async function saveToSupabase(payload) {
  if (!SERVICE_ROLE_KEY) {
    console.warn('[contact] No SUPABASE_SERVICE_ROLE_KEY - skipping save');
    return false;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      console.warn('[contact] Supabase save failed:', res.status, txt);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[contact] Supabase exception:', e.message);
    return false;
  }
}

// ── Send email via Resend ────────────────────────────
async function sendEmail(to, subject, html, replyTo) {
  if (!RESEND_API_KEY) {
    console.warn('[contact] No RESEND_API_KEY - skipping email');
    return false;
  }
  try {
    const body = { from: SENDER, to: [to], subject, html };
    if (replyTo) body.reply_to = replyTo;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const txt = await res.text();
      console.warn('[contact] Resend failed:', res.status, txt);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[contact] Resend exception:', e.message);
    return false;
  }
}

// ── Make.com webhook (optional) ──────────────────────
async function notifyMakeWebhook(payload) {
  if (!MAKE_WEBHOOK_URL) return false;
  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'contact_submission',
        ...payload,
        submitted_at: new Date().toISOString()
      })
    });
    return true;
  } catch (e) {
    console.warn('[contact] Make webhook exception:', e.message);
    return false;
  }
}

// ── Email templates ──────────────────────────────────
const T = require('./_email-template');

function clientEmailHtml(name, topic, message) {
  const nameEsc = T.esc(name);
  const topicEsc = T.esc(topic || 'כללי');
  const msgPreview = T.esc(message.slice(0, 200)) + (message.length > 200 ? '…' : '');
  const helloLine = nameEsc ? `תודה ${nameEsc},` : 'תודה רבה,';

  const content = `
    ${T.h1(helloLine)}

    ${T.p('קיבלנו את הפנייה שלכם ונחזור אליכם בהקדם. בדרך כלל זה לוקח עד 24 שעות בימי עסקים.')}

    ${T.detailsTable([
      ['נושא הפנייה', topicEsc],
      ['תוכן ההודעה', msgPreview],
      ['התקבל ב', new Date().toLocaleString('he-IL')],
    ])}

    ${T.infoBox(
      'לפניות דחופות',
      `ניתן ליצור קשר ישיר בטלפון <a href="tel:0542338233" style="color:${T.C.blue};font-weight:700;text-decoration:none;" dir="ltr">054-233-8233</a> או בוואטסאפ.`,
      'orange'
    )}

    ${T.signature()}
  `;

  return T.wrapEmail({
    preheader: `קיבלנו את הפנייה שלך בנושא ${topicEsc}. נחזור אליך תוך 24 שעות.`,
    content
  });
}

function adminEmailHtml(name, phone, email, topic, message) {
  const nameEsc = T.esc(name);
  const phoneEsc = T.esc(phone || '');
  const emailEsc = T.esc(email || '');
  const topicEsc = T.esc(topic || 'כללי');
  const msgEsc = T.esc(message).replace(/\n/g, '<br>');

  const content = `
    ${T.h1('פנייה חדשה מהאתר')}
    ${T.p(`התקבלה פנייה חדשה דרך טופס יצירת הקשר באתר.`)}

    ${T.detailsTable([
      ['שם הפונה', nameEsc],
      ...(phone ? [['טלפון', `<a href="tel:${phoneEsc}" style="color:${T.C.blue};text-decoration:none;font-weight:700;" dir="ltr">${phoneEsc}</a>`]] : []),
      ...(email ? [['אימייל', `<a href="mailto:${emailEsc}" style="color:${T.C.blue};text-decoration:none;font-weight:700;">${emailEsc}</a>`]] : []),
      ['נושא', topicEsc],
      ['התקבל', new Date().toLocaleString('he-IL')],
    ])}

    ${T.infoBox('תוכן ההודעה', msgEsc, 'navy')}
  `;

  return T.wrapEmail({
    preheader: `${nameEsc} שלח פנייה: ${topicEsc}`,
    content
  });
}

// ── Main handler ─────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Invalid JSON' });
  }

  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const topic = (body.topic || 'כללי').trim();
  const message = (body.message || '').trim();
  const source = (body.source || 'contact-form').trim();

  // Validation
  if (!name) return json(400, { error: 'נא להזין שם' });
  if (!message) return json(400, { error: 'נא להזין הודעה' });
  if (!phone && !email) return json(400, { error: 'נא להזין טלפון או אימייל' });
  if (email && !isValidEmail(email)) return json(400, { error: 'כתובת אימייל לא תקינה' });

  // Truncate message
  const safeMessage = message.slice(0, 5000);

  // 1. Save to Supabase
  const saved = await saveToSupabase({
    name,
    phone: phone || null,
    email: email || null,
    topic,
    message: safeMessage,
    source,
    status: 'new'
  });

  // 2. Make.com webhook (parallel)
  const makePromise = notifyMakeWebhook({ name, phone, email, topic, message: safeMessage, source });

  // 3. Send auto-reply to client (if email provided)
  let replied = false;
  if (email) {
    replied = await sendEmail(
      email,
      'תודה על הפנייה — אופקים שלי',
      clientEmailHtml(name, topic, safeMessage)
    );
  }

  // 4. Notify admin
  const adminNotified = await sendEmail(
    ADMIN_EMAIL,
    `[אופקים שלי] פנייה חדשה: ${topic} מ-${name}`,
    adminEmailHtml(name, phone, email, topic, safeMessage),
    email || undefined
  );

  await makePromise;

  return json(200, {
    ok: true,
    message: 'תודה! ההודעה התקבלה.',
    saved,
    replied,
    adminNotified
  });
};
