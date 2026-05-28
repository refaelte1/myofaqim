// Netlify Function: newsletter-confirm
// מופעלת כשהמשתמש לוחץ על לינק האישור במייל.
// GET /.netlify/functions/newsletter-confirm?token=UUID
// מעדכן status=confirmed ומחזיר דף HTML ידידותי.

const { sendSms } = require('./_sms');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_OewpLipzA15en2yUlMKQsQ_HGHo8sVk';
const SITE_URL = 'https://myofaqim.co.il';

function htmlPage(title, heading, message, isError) {
  const NAVY = '#1A2E5C';
  const BLUE = '#2563EB';
  const ORANGE = '#F59E0B';
  const ORANGE_DK = '#D97706';
  const GREEN = '#65A30D';
  const RED = '#DC2626';

  const accent = isError ? RED : GREEN;
  const accentSoft = isError ? 'rgba(220,38,38,0.08)' : 'rgba(101,163,13,0.08)';
  const accentBorder = isError ? 'rgba(220,38,38,0.25)' : 'rgba(101,163,13,0.25)';
  const symbol = isError
    ? `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${RED}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
    : `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} | אופקים שלי</title>
  <link rel="icon" type="image/png" href="${SITE_URL}/favicon-32.png">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}
    body{
      margin:0;
      font-family:'Heebo',system-ui,sans-serif;
      background:linear-gradient(180deg,#FFFFFF 0%,#FEFAF3 50%,#EBF2FE 100%);
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:32px 16px;
      direction:rtl;
      color:#1A1A1A;
    }
    .card{
      background:#fff;
      border:1px solid #E5E7EB;
      border-radius:14px;
      max-width:480px;
      width:100%;
      padding:48px 36px 40px;
      text-align:center;
      box-shadow:0 12px 40px rgba(26,46,92,0.08);
      position:relative;
      overflow:hidden;
    }
    .card::before{
      content:'';
      position:absolute;
      top:0;left:0;right:0;
      height:4px;
      background:linear-gradient(90deg,${BLUE} 0%,${ORANGE} 100%);
    }
    .brand{
      font-family:'Heebo',sans-serif;
      font-weight:900;
      font-size:26px;
      color:${NAVY};
      letter-spacing:-0.02em;
      margin-bottom:6px;
      line-height:1;
    }
    .brand .accent{ color:${BLUE}; }
    .brand-sub{
      font-size:10px;
      font-weight:700;
      color:${BLUE};
      letter-spacing:2.5px;
      text-transform:uppercase;
      margin-bottom:32px;
      direction:ltr;
    }
    .symbol{
      width:64px;
      height:64px;
      border-radius:50%;
      background:${accentSoft};
      border:1.5px solid ${accentBorder};
      color:${accent};
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:36px;
      font-weight:900;
      margin:0 auto 24px;
      line-height:1;
    }
    h1{
      font-family:'Heebo',sans-serif;
      color:${NAVY};
      font-size:24px;
      font-weight:900;
      margin:0 0 12px;
      letter-spacing:-0.01em;
    }
    p{
      color:#4A4A4A;
      font-size:15px;
      line-height:1.7;
      margin:0 0 28px;
    }
    .btn{
      background:${NAVY};
      color:#fff;
      padding:14px 32px;
      border-radius:8px;
      text-decoration:none;
      font-weight:800;
      font-size:14px;
      display:inline-block;
      letter-spacing:0.3px;
      transition:background .2s;
    }
    .btn:hover{ background:${BLUE}; }
    .contact{
      margin-top:28px;
      padding-top:24px;
      border-top:1px solid #F1F2F4;
      font-size:12px;
      color:#8A8A8A;
      line-height:1.7;
    }
    .contact a{ color:${BLUE}; text-decoration:none; font-weight:700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">אופקים <span class="accent">שלי</span></div>
    <div class="brand-sub">MyOfaqim.co.il</div>

    <div class="symbol">${symbol}</div>
    <h1>${heading}</h1>
    <p>${message}</p>
    <a class="btn" href="${SITE_URL}">חזרה לדף הבית</a>

    <div class="contact">
      שאלות? <a href="tel:0542338233" dir="ltr">054-233-8233</a> · <a href="https://wa.me/972542338233">WhatsApp</a>
    </div>
  </div>
</body>
</html>`;
}

function htmlResponse(statusCode, title, heading, message, isError) {
  return {
    statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: htmlPage(title, heading, message, isError),
  };
}

exports.handler = async (event) => {
  const token = (event.queryStringParameters || {}).token;

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return htmlResponse(400, 'קישור לא תקין', 'הקישור אינו תקין',
      'נראה שהקישור שגוי או חסר. נסה להירשם שוב מדף ההרשמה.', true);
  }

  // אם יש SERVICE_ROLE_KEY - מעולה. אחרת ננסה עם המפתח הציבורי
  const apiKey = SERVICE_ROLE_KEY || PUBLIC_KEY;

  if (!apiKey) {
    console.error('No API keys configured');
    return htmlResponse(500, 'שגיאה', 'שגיאת שרת',
      'משהו השתבש מצידנו. צרו קשר ב-WhatsApp ונאשר ידנית.', true);
  }

  const apiHeaders = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    // ── איתור הנרשם לפי הטוקן ──────────────────────────────
    const lookupUrl = `${SUPABASE_URL}/rest/v1/newsletter_subscribers?confirmation_token=eq.${encodeURIComponent(token)}&select=id,first_name,status,phone,subscriber_type,wants_sms`;
    const lookupRes = await fetch(lookupUrl, { headers: apiHeaders });

    if (!lookupRes.ok) {
      const errText = await lookupRes.text();
      console.error('Lookup failed:', lookupRes.status, errText);
      return htmlResponse(500, 'שגיאה', 'שגיאה בחיפוש',
        'לא הצלחנו לאמת את הקישור. צרו קשר ב-WhatsApp.', true);
    }

    const rows = await lookupRes.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return htmlResponse(404, 'לא נמצא', 'הקישור לא נמצא',
        'ייתכן שהקישור פג תוקף או כבר נעשה בו שימוש. נסה להירשם שוב.', true);
    }

    const sub = rows[0];

    if (sub.status === 'confirmed') {
      return htmlResponse(200, 'כבר אושר', `הכל מוכן, ${escapeName(sub.first_name)}!`,
        'הכתובת שלך כבר אושרה בעבר. אתה ברשימת התפוצה ותקבל את העדכונים הבאים שלנו.', false);
    }

    // ── עדכון לאישור ───────────────────────────────────────
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?id=eq.${sub.id}`, {
      method: 'PATCH',
      headers: apiHeaders,
      body: JSON.stringify({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        unsubscribed_at: null,
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('Confirm update failed:', updateRes.status, errText);
      // גם אם העדכון נכשל - נדגיש את ההצלחה כי הלקוח בא לכאן
      return htmlResponse(200, 'ההרשמה התקבלה', `שלום ${escapeName(sub.first_name)}!`,
        'תודה שאישרת את ההרשמה. נציג שלנו יחזור אליך בקרוב.', false);
    }

    // ── שליחת SMS אישור סופי (לאחר אימות המייל) ─────────────
    // נשלח רק אם יש טלפון - אינו דורש wants_sms כי זה אישור עסקאי
    if (sub.phone) {
      sendConfirmationSms(sub.phone, sub.first_name, sub.subscriber_type).catch(err => {
        console.warn('[confirm] SMS failed (non-fatal):', err.message);
      });
    }

    return htmlResponse(200, 'ההרשמה אושרה', `ברוך הבא, ${escapeName(sub.first_name)}!`,
      'ההרשמה שלך אושרה בהצלחה. מעכשיו תקבל מאיתנו מבצעים בלעדיים והתראות חשובות מהעיר אופקים.', false);
  } catch (e) {
    console.error('newsletter-confirm error:', e);
    return htmlResponse(500, 'שגיאה', 'שגיאה לא צפויה',
      'משהו השתבש. צרו קשר ב-WhatsApp ונאשר ידנית.', true);
  }
};

// ─── שליחת SMS אישור סופי ──────────────────────────────────
// 019 תומך ב-201 תווים בעברית בעלות של הודעה אחת
async function sendConfirmationSms(phone, firstName, subscriberType) {
  const name = firstName || '';

  // הודעות מותאמות לכל סוג נרשם - ממקסמות את 201 התווים
  const messages = {
    // תושב - הצטרף לרשימת התפוצה לקבלת מבצעים
    resident: name
      ? `שלום ${name}, ההרשמה לאופקים שלי אושרה!\n\nמעכשיו תקבל ראשון את הקופונים והמבצעים הכי חמים בעיר, חדשות מקומיות והתראות חשובות.\n\nwww.myofaqim.co.il\n\nלהסרה: השב הסר`
      : `ההרשמה לאופקים שלי אושרה!\n\nמעכשיו תקבל ראשון את הקופונים והמבצעים הכי חמים בעיר, חדשות מקומיות והתראות חשובות.\n\nwww.myofaqim.co.il\n\nלהסרה: השב הסר`,

    // בעל עסק - רשם עסק חדש לבדיקה
    business_owner: name
      ? `שלום ${name}, אימות המייל הושלם!\n\nבקשת רישום העסק שלך נכנסה למערכת ועוברת בדיקה.\n\nנציג מאופקים שלי יחזור אליך תוך 24 שעות עסקיות לאישור סופי והקמת כרטיס העסק.\n\nשאלות: 054-233-8233`
      : `אימות המייל לבעל עסק הושלם!\n\nבקשת הרישום נכנסה למערכת ועוברת בדיקה.\n\nנציג מאופקים שלי יחזור אליך תוך 24 שעות עסקיות לאישור סופי והקמת כרטיס העסק.\n\nשאלות: 054-233-8233`,

    // בעל מקצוע - רשם פרופיל לבדיקה
    professional: name
      ? `שלום ${name}, אימות המייל הושלם!\n\nבקשת ההרשמה כבעל מקצוע נכנסה למערכת ועוברת בדיקה.\n\nנציג מאופקים שלי יחזור אליך תוך 24 שעות להקמת הפרופיל וקבלת לידים מתושבי העיר.\n\nשאלות: 054-233-8233`
      : `אימות המייל לבעל מקצוע הושלם!\n\nבקשת ההרשמה נכנסה למערכת ועוברת בדיקה.\n\nנציג מאופקים שלי יחזור אליך תוך 24 שעות להקמת הפרופיל וקבלת לידים מתושבי העיר.\n\nשאלות: 054-233-8233`,
  };

  const message = messages[subscriberType] || messages.resident;

  // קריאה ישירה למודול המשותף (server-to-server, ללא חשיפת endpoint ציבורי)
  return sendSms(phone, message);
}

function escapeName(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
