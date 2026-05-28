/**
 * ════════════════════════════════════════════════════
 * business-approve.js - Netlify Function
 *
 * נשלח כשאדמין מאשר עסק במערכת.
 * שולח:
 *   - SMS לבעל העסק
 *   - מייל מקצועי עם פרטי החבילות ושדרוג
 *
 * POST /.netlify/functions/business-approve
 * body: {
 *   email, phone, first_name, business_name,
 *   business_slug, plan_tier (free/basic/pro/enterprise)
 * }
 * ════════════════════════════════════════════════════
 */

const { requireAdmin } = require('./_auth');
const { sendSms } = require('./_sms');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = 'https://myofaqim.co.il';
const SENDER = 'אופקים שלי <hello@myofaqim.co.il>';
const SUPPORT_PHONE = '054-233-8233';

function json(status, data) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  };
}

function escapeHtml(s) {
  return (s || '').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const auth = await requireAdmin(event);
  if (!auth.ok) return json(auth.statusCode, { error: auth.error });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Invalid JSON' }); }

  const email        = (body.email || '').trim();
  const phone        = (body.phone || '').trim();
  const firstName    = (body.first_name || '').trim();
  const businessName = (body.business_name || '').trim();
  const businessSlug = (body.business_slug || '').trim();
  const planTier     = (body.plan_tier || 'free').toLowerCase();

  if (!email && !phone) {
    return json(400, { error: 'email or phone is required' });
  }
  if (!businessName) {
    return json(400, { error: 'business_name is required' });
  }

  const businessUrl = businessSlug
    ? `${SITE_URL}/business/${businessSlug}`
    : `${SITE_URL}/biz`;

  const results = { email_sent: false, sms_sent: false };

  // ─── שליחת SMS ────────────────────────────────────────────
  if (phone) {
    try {
      const name = firstName || '';
      const hello = name ? `שלום ${name},\n\n` : '';
      const smsText = `${hello}העסק "${businessName}" אושר ופעיל באופקים שלי!\n\nתושבי העיר כבר רואים את העסק בקטלוג, יכולים להתקשר ולהזמין.\n\nלעדכון פרטים, תמונות וקופונים:\nmyofaqim.co.il/biz\n\nשדרוג חבילה: ${SUPPORT_PHONE}`;

      await sendSms(phone, smsText);
      results.sms_sent = true;
    } catch (e) {
      console.warn('[approve] SMS error:', e.message);
    }
  }

  // ─── שליחת מייל ────────────────────────────────────────────
  if (email && RESEND_API_KEY) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: SENDER,
          to: [email],
          subject: `העסק "${businessName}" אושר! ברוכים הבאים לאופקים שלי`,
          html: buildApprovalEmail({ firstName, businessName, businessUrl, planTier }),
        }),
      });
      results.email_sent = emailRes.ok;
      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.warn('[approve] Email failed:', emailRes.status, errText);
      }
    } catch (e) {
      console.warn('[approve] Email error:', e.message);
    }
  }

  return json(200, { ok: true, ...results });
};

// ════════════════════════════════════════════════════
// טמפלייט מייל אישור עסק
// ════════════════════════════════════════════════════
function buildApprovalEmail({ firstName, businessName, businessUrl, planTier }) {
  const name = escapeHtml(firstName) || 'שותף יקר';
  const biz = escapeHtml(businessName);
  const bizUrl = escapeHtml(businessUrl);
  const currentPlan = planTier || 'free';

  // ─── חבילות ─── (זהה לאתר)
  const plans = [
    {
      id: 'free', name: 'חינמי', price: '0', priceLabel: '₪/חודש',
      tagline: 'התחלה פשוטה',
      features: ['כרטיס עסק בסיסי', 'הופעה בקטלוג העסקים', 'קופון אחד פעיל בו זמנית', 'מענה לפניות'],
      color: '#65A30D', highlight: false,
    },
    {
      id: 'basic', name: 'בסיסי', price: '99', priceLabel: '₪/חודש',
      tagline: 'לעסקים מתפתחים',
      features: ['כל מה שבחינמי', 'עד 3 קופונים פעילים', 'תמונות + גלריה', 'סטטיסטיקות בסיסיות', 'מיקום במפה'],
      color: '#2563EB', highlight: false,
    },
    {
      id: 'pro', name: 'פרו', price: '149', priceLabel: '₪/חודש',
      tagline: 'המומלץ ביותר',
      features: ['כל מה שבבסיסי', 'קופונים ללא הגבלה', 'תווית "מאומת" כתומה', 'הופעה ראשונה בחיפוש', 'דוחות מתקדמים', 'תמיכה מועדפת', 'WhatsApp ישיר מהכרטיס'],
      color: '#F59E0B', highlight: true,
    },
    {
      id: 'enterprise', name: 'עסקי', price: '449', priceLabel: '₪/חודש',
      tagline: 'לרשתות וענקים',
      features: ['כל מה שבפרו', 'באנר ראשי באתר', 'דף נחיתה מותאם אישית', 'מנהל לקוח אישי', 'אינטגרציה ל-CRM', 'דוחות שבועיים בפועל'],
      color: '#1A2E5C', highlight: false,
    },
  ];

  const plansHtml = plans.map(p => {
    const isCurrent = p.id === currentPlan;
    const featuresList = p.features.map(f => `
      <li style="padding: 6px 0; color: #4A4A4A; font-size: 13px; line-height: 1.5;">
        <span style="color: ${p.color}; font-weight: 700; margin-left: 6px;">✓</span> ${escapeHtml(f)}
      </li>
    `).join('');

    return `
      <td valign="top" style="padding: 0 6px; width: 25%;">
        <div style="
          background: #fff;
          border-radius: 12px;
          padding: 18px 14px;
          border: ${p.highlight ? `2px solid ${p.color}` : '1px solid #E5E7EB'};
          ${p.highlight ? `box-shadow: 0 8px 24px rgba(245, 158, 11, 0.15);` : ''}
          height: 100%;
          position: relative;
        ">
          ${p.highlight ? `
            <div style="
              position: absolute; top: -10px; right: 14px;
              background: ${p.color}; color: #1A2E5C;
              padding: 3px 10px; border-radius: 100px;
              font-size: 10px; font-weight: 900; letter-spacing: 0.5px;
            ">מומלץ</div>
          ` : ''}

          ${isCurrent ? `
            <div style="
              position: absolute; top: -10px; left: 14px;
              background: #65A30D; color: #fff;
              padding: 3px 10px; border-radius: 100px;
              font-size: 10px; font-weight: 900;
            ">החבילה שלך</div>
          ` : ''}

          <div style="text-align: center; margin-bottom: 14px;">
            <div style="
              color: ${p.color};
              font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
              text-transform: uppercase; margin-bottom: 6px;
            ">${escapeHtml(p.tagline)}</div>
            <h3 style="
              margin: 0 0 8px; font-size: 22px; font-weight: 900;
              color: #1A2E5C; letter-spacing: -0.02em;
            ">${escapeHtml(p.name)}</h3>
            <div style="margin-bottom: 4px;">
              <span style="font-size: 32px; font-weight: 900; color: #1A2E5C; line-height: 1;">${escapeHtml(p.price)}</span>
              <span style="color: #8A8A8A; font-size: 12px; font-weight: 700;">${escapeHtml(p.priceLabel)}</span>
            </div>
          </div>

          <ul style="margin: 0; padding: 0; list-style: none; border-top: 1px solid #F0F0F0; padding-top: 12px;">
            ${featuresList}
          </ul>
        </div>
      </td>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>העסק שלך אושר באופקים שלי</title>
</head>
<body style="margin: 0; padding: 0; background: #F5F5F0; font-family: 'Heebo', Arial, sans-serif; direction: rtl;">

<div style="max-width: 680px; margin: 0 auto; background: #fff;">

  <!-- ═══ HEADER ═══ -->
  <div style="background: linear-gradient(135deg, #1A2E5C 0%, #2563EB 100%); padding: 36px 24px; text-align: center; color: #fff; position: relative;">
    <div style="display: inline-block; background: rgba(255,255,255,0.12); backdrop-filter: blur(8px); padding: 6px 16px; border-radius: 100px; font-size: 11px; font-weight: 800; letter-spacing: 2px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.2);">
      ✓ העסק אושר
    </div>
    <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">
      ברוכים הבאים, ${name}!
    </h1>
    <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9; font-weight: 500;">
      העסק <strong style="color: #F59E0B;">"${biz}"</strong> פעיל באתר
    </p>
  </div>

  <!-- ═══ הודעה ראשית ═══ -->
  <div style="padding: 32px 28px;">
    <h2 style="margin: 0 0 12px; color: #1A2E5C; font-size: 22px; font-weight: 900; letter-spacing: -0.01em;">
      שלום ${name},
    </h2>
    <p style="color: #4A4A4A; font-size: 15px; line-height: 1.7; margin: 0 0 18px;">
      העסק שלך <strong style="color: #1A2E5C;">"${biz}"</strong> אושר בהצלחה ופעיל באופקים שלי - הפלטפורמה הקהילתית של אופקים. תושבי העיר כבר יכולים לראות את העסק, להתקשר ולהזמין דרכך.
    </p>

    <!-- כפתורי פעולה -->
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; width: 100%;">
      <tr>
        <td>
          <a href="${bizUrl}" style="
            display: inline-block;
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            color: #1A2E5C;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 15px;
            box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
          ">
            צפה בכרטיס העסק שלך ←
          </a>
        </td>
        <td style="padding-right: 12px;">
          <a href="${SITE_URL}/biz" style="
            display: inline-block;
            background: #fff;
            color: #1A2E5C;
            text-decoration: none;
            padding: 14px 24px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 14px;
            border: 1.5px solid #E5E7EB;
          ">
            איזור אישי לניהול
          </a>
        </td>
      </tr>
    </table>

    <!-- מה אפשר לעשות -->
    <div style="background: #F5F5F0; border-radius: 14px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px; color: #1A2E5C; font-size: 16px; font-weight: 900;">
        מה אפשר לעשות עכשיו באיזור האישי
      </h3>
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li style="padding: 7px 0; color: #4A4A4A; font-size: 14px;">
          <span style="color: #2563EB; font-weight: 900; margin-left: 8px;">›</span>
          לערוך את פרטי העסק, תיאור, כתובת ושעות פתיחה
        </li>
        <li style="padding: 7px 0; color: #4A4A4A; font-size: 14px;">
          <span style="color: #2563EB; font-weight: 900; margin-left: 8px;">›</span>
          להעלות תמונות, לוגו וגלריה
        </li>
        <li style="padding: 7px 0; color: #4A4A4A; font-size: 14px;">
          <span style="color: #2563EB; font-weight: 900; margin-left: 8px;">›</span>
          לפרסם קופונים ומבצעים לתושבי אופקים
        </li>
        <li style="padding: 7px 0; color: #4A4A4A; font-size: 14px;">
          <span style="color: #2563EB; font-weight: 900; margin-left: 8px;">›</span>
          לצפות בסטטיסטיקות צפיות ופניות
        </li>
      </ul>
    </div>
  </div>

  <!-- ═══ חבילות ═══ -->
  <div style="background: linear-gradient(180deg, #F5F5F0 0%, #fff 100%); padding: 36px 20px; border-top: 1px solid #E5E7EB;">

    <div style="text-align: center; margin-bottom: 28px;">
      <div style="
        display: inline-block; color: #F59E0B; font-size: 11px;
        font-weight: 800; letter-spacing: 2px; margin-bottom: 8px;
        text-transform: uppercase;
      ">החבילות שלנו</div>
      <h2 style="margin: 0 0 8px; color: #1A2E5C; font-size: 26px; font-weight: 900; letter-spacing: -0.02em;">
        רוצה להגיע ליותר תושבים?
      </h2>
      <p style="margin: 0; color: #4A4A4A; font-size: 14px; line-height: 1.6;">
        שדרוג לחבילה בתשלום פותח לך הופעה מועדפת, קופונים ללא הגבלה, סטטיסטיקות מתקדמות ועוד.
      </p>
    </div>

    <!-- כרטיסי חבילות -->
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 640px; margin: 0 auto; border-collapse: separate; border-spacing: 0;">
      <tr>
        ${plansHtml}
      </tr>
    </table>

    <!-- הצעת השקה -->
    <div style="
      max-width: 520px; margin: 28px auto 0;
      background: linear-gradient(135deg, #FFF8E1 0%, #FFF 100%);
      border: 1.5px solid #F59E0B;
      border-radius: 14px;
      padding: 20px 24px;
      text-align: center;
    ">
      <div style="
        display: inline-block; background: #F59E0B; color: #1A2E5C;
        padding: 4px 12px; border-radius: 100px; font-size: 10px;
        font-weight: 900; letter-spacing: 1px; margin-bottom: 10px;
      ">מבצע השקה - מוגבל בזמן</div>
      <h3 style="margin: 0 0 6px; color: #1A2E5C; font-size: 18px; font-weight: 900;">
        30% הנחה בחודשיים הראשונים
      </h3>
      <p style="margin: 0; color: #4A4A4A; font-size: 13px; line-height: 1.5;">
        תקף לכל החבילות בתשלום. מציינים את הקוד <strong style="color: #D97706;">OFAKIM30</strong> בעת השדרוג.
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 28px;">
      <a href="tel:${SUPPORT_PHONE}" style="
        display: inline-block;
        background: #1A2E5C;
        color: #fff;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 12px;
        font-weight: 900;
        font-size: 15px;
      ">
        ${SUPPORT_PHONE} - דברו איתנו לשדרוג
      </a>
      <p style="margin: 12px 0 0; color: #8A8A8A; font-size: 12px;">
        ימים א'-ה' 09:00-18:00 | יום ו' 09:00-13:00
      </p>
    </div>
  </div>

  <!-- ═══ FOOTER ═══ -->
  <div style="background: #1A2E5C; color: #fff; padding: 28px 24px; text-align: center;">
    <div style="margin-bottom: 12px;">
      <strong style="font-size: 18px; font-weight: 900; letter-spacing: -0.02em;">
        אופקים <span style="color: #60A5FA;">שלי</span>
      </strong>
      <div style="font-size: 11px; opacity: 0.7; letter-spacing: 1px; margin-top: 4px;">MYOFAQIM.CO.IL</div>
    </div>
    <p style="margin: 12px 0; font-size: 12px; opacity: 0.75; line-height: 1.6;">
      הפלטפורמה הקהילתית של אופקים<br>
      WhatsApp: <a href="https://wa.me/972542338233" style="color: #F59E0B; text-decoration: none;">${SUPPORT_PHONE}</a> | <a href="mailto:hello@myofaqim.co.il" style="color: #F59E0B; text-decoration: none;">hello@myofaqim.co.il</a>
    </p>
    <p style="margin: 16px 0 0; font-size: 10px; opacity: 0.5;">
      קיבלת מייל זה כי רשמת עסק לאופקים שלי.<br>
      <a href="${SITE_URL}/unsubscribe" style="color: rgba(255,255,255,0.5);">הסר את עצמך מהרשימה</a>
    </p>
  </div>

</div>
</body>
</html>`;
}
