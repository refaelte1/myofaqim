// Netlify Function: newsletter-unsubscribe
// מופעלת מלינק "הסרה מרשימת התפוצה" בתחתית כל מייל.
// GET /.netlify/functions/newsletter-unsubscribe?token=UUID
// מעדכן status=unsubscribed ומחזיר דף HTML.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = 'https://myofaqim.co.il';

function htmlPage(title, heading, message, isError) {
  const NAVY = '#1A2E5C';
  const BLUE = '#2563EB';
  const ORANGE = '#F59E0B';
  const GREEN = '#65A30D';
  const RED = '#DC2626';
  const INK_MUTE = '#8A8A8A';

  const accent = isError ? RED : INK_MUTE;
  const accentSoft = isError ? 'rgba(220,38,38,0.08)' : 'rgba(138,138,138,0.08)';
  const accentBorder = isError ? 'rgba(220,38,38,0.25)' : 'rgba(138,138,138,0.2)';
  const symbol = isError
    ? `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${RED}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
    : `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${INK_MUTE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

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
    .resub{
      display:block;
      margin-top:16px;
      color:${BLUE};
      font-size:13px;
      text-decoration:none;
      font-weight:600;
    }
    .resub:hover{ text-decoration:underline; }
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
    ${!isError ? `<a class="resub" href="${SITE_URL}/subscribe">טעות? להרשמה מחדש</a>` : ''}

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
      'נראה שהקישור שגוי או חסר.', true);
  }
  if (!SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    return htmlResponse(500, 'שגיאה', 'שגיאת שרת',
      'משהו השתבש מצידנו. נסה שוב מאוחר יותר.', true);
  }

  const apiHeaders = {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const lookupUrl = `${SUPABASE_URL}/rest/v1/newsletter_subscribers?confirmation_token=eq.${encodeURIComponent(token)}&select=id,first_name,status`;
    const lookupRes = await fetch(lookupUrl, { headers: apiHeaders });
    const rows = await lookupRes.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return htmlResponse(404, 'לא נמצא', 'הקישור לא נמצא',
        'לא מצאנו רישום שמתאים לקישור הזה.', true);
    }

    const sub = rows[0];

    if (sub.status === 'unsubscribed') {
      return htmlResponse(200, 'כבר הוסר', 'כבר הוסרת מהרשימה',
        'הכתובת שלך כבר אינה ברשימת התפוצה. לא תקבל מאיתנו עוד הודעות.', false);
    }

    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?id=eq.${sub.id}`, {
      method: 'PATCH',
      headers: apiHeaders,
      body: JSON.stringify({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('Unsubscribe update failed:', updateRes.status, errText);
      return htmlResponse(500, 'שגיאה', 'שגיאה בהסרה',
        'לא הצלחנו להסיר אותך מהרשימה. נסה שוב מאוחר יותר.', true);
    }

    return htmlResponse(200, 'הוסרת מהרשימה', 'הוסרת בהצלחה',
      'הכתובת שלך הוסרה מרשימת התפוצה. אנחנו מצטערים לראות אותך עוזב - תמיד אפשר לחזור.', false);
  } catch (e) {
    console.error('newsletter-unsubscribe error:', e);
    return htmlResponse(500, 'שגיאה', 'שגיאה לא צפויה',
      'משהו השתבש. נסה שוב מאוחר יותר.', true);
  }
};
