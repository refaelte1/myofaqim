// ============================================================
//  send-welcome — Netlify Function
//  שולח מייל ברוכים הבאים לאחר הרשמה
//  POST /.netlify/functions/send-welcome
//  body: { type: 'business'|'professional'|'resident', name, email, extra? }
// ============================================================

const T = require('./_email-template');

const FROM_EMAIL = 'אופקים שלי <welcome@myofaqim.co.il>';

// ── תבניות לפי סוג משתמש ────────────────────────────────────
function getEmailContent(type, name, extra = {}) {
  const firstName = T.esc((name || '').split(' ')[0] || '');
  const helloLine = firstName ? `שלום ${firstName},` : 'שלום,';

  // ===== עסק =====
  if (type === 'business') {
    const bizName = T.esc(extra.bizName || 'העסק שלך');
    const plan = (extra.plan || 'free').toLowerCase();
    const planLabels = {
      free: 'FREE — חינם',
      basic: 'BASIC — 99 ₪ לחודש (מחיר השקה)',
      pro: 'PRO — 149 ₪ לחודש (מחיר השקה)',
      enterprise: 'ENTERPRISE — 449 ₪ לחודש (מחיר השקה)',
    };
    const planLabel = planLabels[plan] || planLabels.free;

    const content = `
      ${T.h1(helloLine)}

      ${T.p(`ברוכים הבאים לאופקים שלי. קיבלנו את הרשמת העסק <strong style="color:${T.C.navy};">${bizName}</strong> והבקשה נמצאת כעת בבדיקה אצל הצוות.`)}

      ${T.infoBox(
        'השלבים הבאים',
        T.steps([
          'הבקשה התקבלה ונרשמה במערכת',
          'צוות הניהול עובר על הפרטים — תהליך שאורך עד 24 שעות',
          'תקבלו מייל נוסף ברגע שהעסק יעלה לאוויר ויהיה זמין באלפון',
        ]),
        'navy'
      )}

      ${plan !== 'free' ? T.infoBox(
        'פרטי המסלול שבחרתם',
        `<div style="margin-bottom:10px;font-weight:700;color:${T.C.navy};font-size:15px;">${planLabel}</div>
         <div>נציג שלנו יצור איתכם קשר לסיום הליך התשלום באמצעות מערכת סליקה מאובטחת.</div>
         <div style="margin-top:8px;color:${T.C.green};font-weight:700;">הביטול אפשרי בכל עת. ללא התחייבות.</div>`,
        'orange'
      ) : T.infoBox(
        'המסלול שבחרתם',
        `<div style="font-weight:700;color:${T.C.navy};font-size:15px;margin-bottom:6px;">${planLabel}</div>
         <div>תוכלו לשדרג בכל עת לתכונות מתקדמות יותר (קופונים, גלריה, סטטיסטיקות ועוד).</div>`,
        'blue'
      )}

      ${T.h2('ניהול העסק')}
      ${T.p('דרך אזור הניהול תוכלו לעדכן את פרטי העסק, להוסיף תמונות, ליצור קופונים, לקבל לידים ועוד.')}
      ${T.btn('כניסה לאזור הניהול', T.SITE_URL + '/biz', 'navy')}

      ${T.signature()}
    `;

    return {
      subject: `אישור הרשמה — ${bizName}`,
      preheader: `קיבלנו את הרשמת ${bizName}. אישור תוך 24 שעות.`,
      html: T.wrapEmail({
        preheader: `קיבלנו את הרשמת ${extra.bizName || 'העסק שלך'}. אישור תוך 24 שעות.`,
        content
      })
    };
  }

  // ===== בעל מקצוע =====
  if (type === 'professional') {
    const trade = T.esc(extra.trade || extra.profession || 'בעל מקצוע');
    const plan = (extra.plan || 'free').toLowerCase();
    const planLabels = {
      free: 'FREE — חינם',
      basic: 'BASIC — 99 ₪ לחודש (מחיר השקה)',
      pro: 'PRO — 149 ₪ לחודש (מחיר השקה)',
      enterprise: 'ENTERPRISE — 449 ₪ לחודש (מחיר השקה)',
    };
    const planLabel = planLabels[plan] || planLabels.free;

    const content = `
      ${T.h1(helloLine)}

      ${T.p(`ברוכים הבאים לאופקים שלי. הפרופיל המקצועי שלכם בתחום <strong style="color:${T.C.navy};">${trade}</strong> התקבל בהצלחה ועומד לאישור הצוות.`)}

      ${T.infoBox(
        'השלבים הבאים',
        T.steps([
          'הפרופיל שלכם נקלט במערכת',
          'צוות הניהול בודק את הפרטים — אישור תוך 24 שעות',
          'מיד עם האישור תקבלו מייל נוסף ותושבים יוכלו לפנות אליכם ישירות',
        ]),
        'navy'
      )}

      ${T.h2('מה תקבלו במסגרת השירות')}
      ${T.infoBox('', `
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding:4px 0;font-size:14px;color:${T.C.inkSoft};">פרופיל מלא באינדקס בעלי המקצוע של העיר</td></tr>
          <tr><td style="padding:4px 0;font-size:14px;color:${T.C.inkSoft};">פניות ישירות מתושבים — לטלפון, אימייל או WhatsApp</td></tr>
          <tr><td style="padding:4px 0;font-size:14px;color:${T.C.inkSoft};">שליטה מלאה בזמינות שלכם — מעודכן בזמן אמת</td></tr>
          <tr><td style="padding:4px 0;font-size:14px;color:${T.C.inkSoft};">מערכת דירוגים ובניית מוניטין בקרב לקוחות מהעיר</td></tr>
        </table>
      `, 'green')}

      ${plan !== 'free' ? T.infoBox(
        'פרטי המסלול שבחרתם',
        `<div style="margin-bottom:10px;font-weight:700;color:${T.C.navy};font-size:15px;">${planLabel}</div>
         <div>נציג יצור איתכם קשר לסיום הליך התשלום ולעדכון פרטים נוספים על הפרופיל.</div>`,
        'orange'
      ) : ''}

      ${T.btn('כניסה לאזור הניהול שלי', T.SITE_URL + '/biz', 'navy')}

      ${T.signature()}
    `;

    return {
      subject: `אישור הרשמה כבעל מקצוע — ${trade}`,
      preheader: `הפרופיל המקצועי שלך התקבל. אישור תוך 24 שעות.`,
      html: T.wrapEmail({
        preheader: `הפרופיל המקצועי שלך התקבל. אישור תוך 24 שעות.`,
        content
      })
    };
  }

  // ===== תושב (ניוזלטר) =====
  const content = `
    ${T.h1(`${helloLine} ברוכים הבאים לקהילה`)}

    ${T.p('תודה שהצטרפתם לרשימת התפוצה של אופקים שלי. מעכשיו תקבלו ישירות לאימייל את כל מה שחשוב לדעת על העיר שלנו.')}

    ${T.infoBox(
      'מה תקבלו מאיתנו',
      `<table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding:6px 0;border-bottom:1px solid ${T.C.lineSoft};">
          <div style="font-weight:700;color:${T.C.navy};font-size:14px;margin-bottom:2px;">חדשות מקומיות</div>
          <div style="font-size:13px;color:${T.C.inkMute};">עדכוני העירייה, פרויקטים, אירועים ודיווחים מהקהילה</div>
        </td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid ${T.C.lineSoft};">
          <div style="font-weight:700;color:${T.C.navy};font-size:14px;margin-bottom:2px;">קופונים והטבות בלעדיות</div>
          <div style="font-size:13px;color:${T.C.inkMute};">הטבות מהעסקים המקומיים — לתושבי העיר בלבד</div>
        </td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid ${T.C.lineSoft};">
          <div style="font-weight:700;color:${T.C.navy};font-size:14px;margin-bottom:2px;">אירועים ופעילויות</div>
          <div style="font-size:13px;color:${T.C.inkMute};">מה קורה בעיר השבוע — בידור, תרבות וקהילה</div>
        </td></tr>
        <tr><td style="padding:6px 0;">
          <div style="font-weight:700;color:${T.C.navy};font-size:14px;margin-bottom:2px;">סקירת מבצעי הסופרים</div>
          <div style="font-size:13px;color:${T.C.inkMute};">השוואת מחירים שבועית מהסופרים בעיר</div>
        </td></tr>
      </table>`,
      'blue'
    )}

    ${T.p(`אנחנו שולחים מייל אחד לשבוע — לא יותר. ניתן להסיר את הרישום בכל עת באמצעות הקישור בתחתית כל מייל.`)}

    ${T.signature()}
  `;

  return {
    subject: 'ברוכים הבאים לאופקים שלי',
    preheader: 'הרשמתכם לניוזלטר התקבלה. בכל שבוע נשלח לכם סקירה של מה שקורה בעיר.',
    html: T.wrapEmail({
      preheader: 'הרשמתכם לניוזלטר התקבלה. בכל שבוע נשלח לכם סקירה של מה שקורה בעיר.',
      content
    })
  };
}

// ── Handler ──────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { type, name, email, extra = {} } = body;

  if (!type || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing type or email' }) };
  }

  const { subject, html } = getEmailContent(type, name, extra);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Resend API error');

    console.log('[send-welcome] Sent to', email, 'type:', type, 'id:', data.id);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch (err) {
    console.error('[send-welcome] Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// ── ייצוא לשימוש חוזר משרת-לשרת (למשל business-register-notify) ──
// שמירה על exports.handler הקיים — הוספת properties בלבד.
module.exports.getEmailContent = getEmailContent;
module.exports.FROM_EMAIL = FROM_EMAIL;
