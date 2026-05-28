// ============================================================
//  notify-business — שליחת התראה לבעל עסק על פנייה חדשה
//  POST /api/notify-business
//  body: { business_id, sender_name, sender_phone, message, type }
//  type: 'contact' | 'coupon_request' | 'lead'
// ============================================================

const MAKE_WEBHOOK = process.env.MAKE_BUSINESS_WEBHOOK_URL;
const RESEND_KEY   = process.env.RESEND_API_KEY;
const SB_URL       = process.env.SUPABASE_URL    || 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SB_KEY       = process.env.SUPABASE_SERVICE_KEY; // service role key — רק בצד שרת
const SITE_URL     = 'https://myofaqim.co.il';

const T = require('./_email-template');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { business_id, sender_name, sender_phone, message, type = 'contact' } = body;
  if (!business_id || !sender_name || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // ── שליפת פרטי העסק ובעלים מ-Supabase ─────────────────
  let ownerPhone = null, ownerEmail = null, bizName = 'העסק שלך';

  if (SB_KEY) {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/businesses?id=eq.${encodeURIComponent(business_id)}&select=name,owner_id,phone,whatsapp,email,profiles(full_name,phone,email)`, {
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
          'Accept': 'application/vnd.pgrst.object+json',
        }
      });
      const biz = await res.json();
      if (biz) {
        bizName    = biz.name || bizName;
        ownerPhone = biz.whatsapp || biz.phone || biz.profiles?.phone || null;
        ownerEmail = biz.email    || biz.profiles?.email || null;
      }
    } catch(e) {
      console.error('[notify] Supabase fetch failed:', e.message);
    }
  }

  const typeLabels = { contact: 'פנייה', coupon_request: 'בקשת קופון', lead: 'ליד' };
  const typeLabel  = typeLabels[type] || 'פנייה';
  const results    = [];

  // ── שליחת WhatsApp דרך Make.com ─────────────────────────
  if (MAKE_WEBHOOK && ownerPhone) {
    try {
      const waMsg = `*${typeLabel} חדשה — ${bizName}*\n` +
        `אופקים שלי | MyOfaqim.co.il\n\n` +
        `שם: ${sender_name}\n` +
        `טלפון: ${sender_phone || 'לא הוזן'}\n\n` +
        `הודעה:\n${message}\n\n` +
        `לניהול הפניות: ${SITE_URL}/biz`;

      const makeRes = await fetch(MAKE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:      ownerPhone.replace(/\D/g,'').replace(/^0/,'972'),
          message: waMsg,
          type:    type,
        })
      });
      results.push({ channel: 'whatsapp', ok: makeRes.ok, status: makeRes.status });
    } catch(e) {
      results.push({ channel: 'whatsapp', ok: false, error: e.message });
    }
  }

  // ── שליחת מייל דרך Resend ──────────────────────────────
  if (RESEND_KEY && ownerEmail) {
    try {
      const senderName = T.esc(sender_name);
      const senderPhone = T.esc(sender_phone || '');
      const cleanMsg = T.esc(message).replace(/\n/g, '<br>');
      const bizNameEsc = T.esc(bizName);
      const phoneDigits = (sender_phone || '').replace(/\D/g, '').replace(/^0/, '972');

      const ctaButtons = `
        <table cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
          <tr>
            ${sender_phone ? `<td style="padding-left:8px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${T.C.navy};border-radius:8px;"><a href="tel:${senderPhone}" style="display:inline-block;padding:11px 20px;color:${T.C.paper};text-decoration:none;font-size:13px;font-weight:700;">חיוג ללקוח</a></td></tr></table></td>` : ''}
            ${sender_phone ? `<td style="padding-left:8px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${T.C.green};border-radius:8px;"><a href="https://wa.me/${phoneDigits}" style="display:inline-block;padding:11px 20px;color:${T.C.paper};text-decoration:none;font-size:13px;font-weight:700;">WhatsApp</a></td></tr></table></td>` : ''}
            <td><table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${T.C.paper};border:1.5px solid ${T.C.line};border-radius:8px;"><a href="${SITE_URL}/biz" style="display:inline-block;padding:10px 18px;color:${T.C.navy};text-decoration:none;font-size:13px;font-weight:700;">לאזור הניהול</a></td></tr></table></td>
          </tr>
        </table>
      `;

      const content = `
        ${T.h1(`${typeLabel} חדשה`)}
        ${T.p(`התקבלה ${typeLabel} חדשה לעסק <strong style="color:${T.C.navy};">${bizNameEsc}</strong>:`)}

        ${T.detailsTable([
          ['שם הפונה', senderName],
          ...(sender_phone ? [['טלפון', `<span dir="ltr">${senderPhone}</span>`]] : []),
          ['התקבל ב', new Date().toLocaleString('he-IL')],
        ])}

        ${T.infoBox('תוכן ההודעה', cleanMsg, 'navy')}

        ${ctaButtons}

        ${T.signature()}
      `;

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({
          from:    'אופקים שלי <notifications@myofaqim.co.il>',
          to:      [ownerEmail],
          subject: `${typeLabel} חדשה — ${bizName}`,
          html: T.wrapEmail({
            preheader: `${senderName} השאיר ${typeLabel} עבור ${bizName}`,
            content
          })
        })
      });
      results.push({ channel: 'email', ok: emailRes.ok });
    } catch(e) {
      results.push({ channel: 'email', ok: false, error: e.message });
    }
  }

  console.log('[notify-business]', { bizName, type, results });
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, results })
  };
};
