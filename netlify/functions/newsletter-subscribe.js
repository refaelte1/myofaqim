// Netlify Function: newsletter-subscribe
// מקבלת פרטי נרשם, שומרת ב-Supabase (status=pending),
// ושולחת מייל אישור דרך Resend.
// POST /.netlify/functions/newsletter-subscribe
// body: { first_name, email, phone, wants_email, wants_sms, source }

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = 'https://myofaqim.co.il';
const SENDER = 'אופקים שלי <noreply@myofaqim.co.il>';

const CORS = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(statusCode, body) {
  return { statusCode, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function isValidEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}
function isValidPhone(p) {
  if (typeof p !== 'string') return false;
  const clean = p.replace(/[\s\-\(\)]/g, '');
  // מקבל: 0501234567, +972501234567, 972501234567
  return /^(\+?972|0)[2-9]\d{7,8}$/.test(clean);
}
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const T = require('./_email-template');

// ─── תבניות מייל לפי סוג נרשם ────────────────────────────────

function residentEmailHtml(firstName, confirmUrl) {
  const name = escapeHtml(firstName);
  const helloLine = name ? `שלום ${name},` : 'שלום,';

  const content = `
    ${T.h1(helloLine)}

    ${T.p('תודה שנרשמתם לרשימת התפוצה של <strong>אופקים שלי</strong> — הקהילה הדיגיטלית של העיר אופקים.')}

    ${T.p('כדי להפעיל את ההרשמה ולקבל את העדכונים השבועיים מהעיר, נדרש אישור הכתובת:')}

    ${T.btn('לאישור ההרשמה', confirmUrl, 'blue')}

    ${T.h2('מה תקבלו אצלנו?')}

    ${T.infoBox('עדכונים שבועיים מהעיר',
      'חדשות, אירועים, מבצעים והטבות חדשות — ישירות לאימייל בכל שבוע. בלי ספאם, ביטול בלחיצה.',
      'blue'
    )}

    ${T.infoBox('קופונים בלעדיים',
      'הטבות חמות בעסקים מקומיים שלא תמצאו בשום מקום אחר.',
      'orange'
    )}

    ${T.infoBox('פורום קהילתי חי',
      'שאלות והמלצות מהשכנים — איפה לאכול, מי החשמלאי הכי טוב, מה קורה בעיר.',
      'green'
    )}

    ${T.divider()}

    ${T.p(`<span style="font-size:13px;color:${T.C.inkMute};">לא ביקשתם להירשם? פשוט התעלמו מהמייל ולא תקבלו ממנו עוד הודעות.</span>`)}

    ${T.signature()}
  `;

  return T.wrapEmail({
    preheader: 'נשאר רק אישור הכתובת — לחיצה אחת וההרשמה תופעל.',
    content
  });
}

function businessOwnerEmailHtml(firstName, businessName, confirmUrl) {
  const name = escapeHtml(firstName);
  const biz = escapeHtml(businessName || '');
  const helloLine = name ? `שלום ${name},` : 'שלום,';

  const content = `
    ${T.h1(helloLine)}

    ${T.p(biz
      ? `תודה שרשמתם את <strong>${biz}</strong> ל<strong>אופקים שלי</strong>! אנחנו שמחים שאתם איתנו בקהילת העסקים המקומית.`
      : `תודה שרשמתם את העסק שלכם ל<strong>אופקים שלי</strong>!`
    )}

    ${T.p('כדי להפעיל את החשבון ולקבל גישה לכל הכלים, נדרש אישור הכתובת:')}

    ${T.btn('לאישור החשבון', confirmUrl, 'blue')}

    ${T.h2('מה הצעדים הבאים?')}

    ${T.steps([
      `<strong>אישור המייל</strong> — לחיצה על הכפתור למעלה`,
      `<strong>השלמת פרטי העסק</strong> — נציג שלנו ייצור איתכם קשר תוך 24 שעות לקבלת תמונות, תיאור ופרטים`,
      `<strong>אישור והעלאה לאוויר</strong> — תוך 48 שעות העסק שלכם יופיע באלפון ובחיפוש`,
      `<strong>קבלת גישה לדשבורד</strong> — לעדכון פרטים, ניהול קופונים, מעקב סטטיסטיקות וקבלת לידים`
    ])}

    ${T.infoBox('מסלולים בתשלום',
      `אם בחרתם מסלול BASIC / PRO / ENTERPRISE — נציג יחזור אליכם לבירור פרטי החיוב. תעריפי ההשקה תקפים לחודשי הפעילות הראשונים.`,
      'orange'
    )}

    ${T.infoBox('זקוקים לעזרה?',
      `נציג זמין בטלפון <a href="tel:0542338233" style="color:${T.C.blue};font-weight:700;text-decoration:none;" dir="ltr">054-233-8233</a> או ב<a href="https://wa.me/972542338233" style="color:${T.C.blue};font-weight:700;text-decoration:none;">WhatsApp</a>.`,
      'navy'
    )}

    ${T.signature()}
  `;

  return T.wrapEmail({
    preheader: biz ? `${biz} — לאישור החשבון לחצו על הכפתור.` : 'לאישור החשבון לחצו על הכפתור.',
    content
  });
}

function professionalEmailHtml(firstName, trade, confirmUrl) {
  const name = escapeHtml(firstName);
  const tradeName = escapeHtml(trade || 'בעל מקצוע');
  const helloLine = name ? `שלום ${name},` : 'שלום,';

  const content = `
    ${T.h1(helloLine)}

    ${T.p(`תודה שהצטרפתם ל<strong>אופקים שלי</strong> כ<strong>${tradeName}</strong>! בעלי המקצוע בעיר הם עמוד התווך של הקהילה, ושמחים לארח אתכם.`)}

    ${T.p('כדי להפעיל את הפרופיל המקצועי שלכם ולהתחיל לקבל לידים, נדרש אישור הכתובת:')}

    ${T.btn('לאישור החשבון', confirmUrl, 'blue')}

    ${T.h2('מה הצעדים הבאים?')}

    ${T.steps([
      `<strong>אישור המייל</strong> — לחיצה על הכפתור למעלה`,
      `<strong>שיחת התאמה</strong> — נציג ייצור איתכם קשר תוך 24 שעות לאסוף פרטים: תחומי שירות, ניסיון, וזמינות`,
      `<strong>פרסום הפרופיל</strong> — תוך 48 שעות הפרופיל שלכם יופיע באינדקס בעלי המקצוע`,
      `<strong>קבלת לידים בזמן אמת</strong> — תושבים מהעיר ימצאו אתכם וישלחו פניות ישירות`
    ])}

    ${T.infoBox('כפתור זמינות',
      `הדשבורד שלכם כולל כפתור "זמין עכשיו" שמעלה אתכם לראש הרשימה ומאפשר לתושבים שצריכים שירות דחוף לזהות אתכם מיד.`,
      'green'
    )}

    ${T.infoBox('מסלולים בתשלום',
      `אם בחרתם מסלול BASIC / PRO / ENTERPRISE — נציג יחזור אליכם לבירור פרטי החיוב. תעריפי ההשקה תקפים לחודשי הפעילות הראשונים.`,
      'orange'
    )}

    ${T.signature()}
  `;

  return T.wrapEmail({
    preheader: `${tradeName} — לאישור הפרופיל לחצו על הכפתור.`,
    content
  });
}

function confirmationEmailHtml(firstName, confirmUrl, subscriberType, businessName, trade) {
  switch (subscriberType) {
    case 'business_owner':
      return businessOwnerEmailHtml(firstName, businessName, confirmUrl);
    case 'professional':
      return professionalEmailHtml(firstName, trade, confirmUrl);
    case 'resident':
    default:
      return residentEmailHtml(firstName, confirmUrl);
  }
}

function emailSubject(subscriberType, businessName) {
  switch (subscriberType) {
    case 'business_owner':
      return businessName
        ? `אישור הרשמה - ${businessName} | אופקים שלי`
        : 'אישור הרשמת עסק - אופקים שלי';
    case 'professional':
      return 'אישור הצטרפות כבעל מקצוע - אופקים שלי';
    case 'resident':
    default:
      return 'אישור הרשמה לקהילה - אופקים שלי';
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }
  // RESEND_API_KEY הכרחי לשליחת מייל
  if (!RESEND_API_KEY) {
    console.error('Missing env var: RESEND_API_KEY');
    return json(500, { error: 'שגיאת הגדרות שרת — חסר מפתח שליחת מיילים. נסה שוב מאוחר יותר.' });
  }
  // SERVICE_ROLE_KEY רק לשמירה ב-DB - לא קריטי, נציין warning
  if (!SERVICE_ROLE_KEY) {
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY - will send email but skip DB save');
  }

  // ── פירוק הבקשה ──────────────────────────────────────────
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'בקשה לא תקינה' });
  }

  const firstName = (payload.first_name || '').trim();
  const email = (payload.email || '').trim().toLowerCase();
  const phoneRaw = (payload.phone || '').trim();
  const phone = phoneRaw ? phoneRaw.replace(/[\s\-]/g, '') : null;
  const wantsEmail = payload.wants_email !== false;
  const wantsSms = !!payload.wants_sms && !!phone;
  const source = (payload.source || 'subscribe_page').toString().slice(0, 60);

  // סוג הנרשם — תושב/בעל עסק/בעל מקצוע
  const allowedTypes = ['resident', 'business_owner', 'professional'];
  const subscriberType = allowedTypes.includes(payload.subscriber_type)
    ? payload.subscriber_type
    : 'resident';

  // פרטים נוספים לפי סוג
  const businessName = (payload.business_name || '').trim().slice(0, 120) || null;
  const businessCategory = (payload.business_category || '').trim().slice(0, 60) || null;
  const trade = (payload.trade || '').trim().slice(0, 60) || null;

  // ── ולידציה ─────────────────────────────────────────────
  if (firstName.length < 2) {
    return json(400, { error: 'נא להזין שם פרטי' });
  }
  if (!isValidEmail(email)) {
    return json(400, { error: 'כתובת אימייל לא תקינה' });
  }
  if (phoneRaw && !isValidPhone(phoneRaw)) {
    return json(400, { error: 'מספר טלפון לא תקין' });
  }

  const apiHeaders = SERVICE_ROLE_KEY ? {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  } : null;

  // ─── טוקן אישור (יצירה מקומית) ─────────────────────────
  // אם נכשל ה-DB - נשתמש בטוקן זה לקישור (יוצר UUID זמני)
  let confirmationToken = null;
  let dbSaved = false;

  // ─── שמירה ב-DB (best-effort, לא קריטי) ────────────────
  if (apiHeaders) {
    try {
      // בדיקה אם המייל כבר קיים לסוג הרשמה הזה (תושב/עסק/מקצוע)
      // אדם אחד יכול להיות גם תושב וגם בעל עסק - לכן בודקים גם לפי הסוג
      const checkUrl = `${SUPABASE_URL}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}&subscriber_type=eq.${subscriberType}&select=id,status,confirmation_token`;
      const checkRes = await fetch(checkUrl, { headers: apiHeaders });

      if (checkRes.ok) {
        const existing = await checkRes.json();

        if (Array.isArray(existing) && existing.length > 0) {
          const sub = existing[0];
          // עדכון רשומה קיימת
          confirmationToken = sub.confirmation_token;
          await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?id=eq.${sub.id}`, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({
              first_name: firstName,
              name: firstName,
              phone,
              wants_email: wantsEmail,
              wants_sms: wantsSms,
              source,
              subscriber_type: subscriberType,
              business_name: businessName,
              business_category: businessCategory,
              trade,
            }),
          }).catch(() => {});
          dbSaved = true;
        } else {
          // הוספת רשומה חדשה
          const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
            method: 'POST',
            headers: { ...apiHeaders, Prefer: 'return=representation' },
            body: JSON.stringify({
              first_name: firstName,
              name: firstName,
              email,
              phone,
              wants_email: wantsEmail,
              wants_sms: wantsSms,
              status: 'pending',
              source,
              subscriber_type: subscriberType,
              business_name: businessName,
              business_category: businessCategory,
              trade,
            }),
          });

          if (insertRes.ok) {
            const inserted = await insertRes.json();
            const newSub = Array.isArray(inserted) ? inserted[0] : inserted;
            confirmationToken = newSub?.confirmation_token;
            dbSaved = true;
          } else {
            const errText = await insertRes.text();
            console.warn('[newsletter] DB insert failed:', insertRes.status, errText);
            // ממשיך לשליחת המייל גם בלי DB
          }
        }
      } else {
        console.warn('[newsletter] DB check failed:', checkRes.status);
      }
    } catch (dbErr) {
      console.warn('[newsletter] DB error (non-fatal):', dbErr.message);
    }
  }

  // ─── שליחת המייל (הכרחי) ──────────────────────────────
  const confirmUrl = confirmationToken
    ? `${SITE_URL}/.netlify/functions/newsletter-confirm?token=${confirmationToken}`
    : `${SITE_URL}/`;

  try {
    await sendConfirmationEmail(email, firstName, confirmUrl, subscriberType, businessName, trade);

    // ─── אין שליחת SMS כאן ─────────────────────────────────
    // SMS נשלח רק אחרי שהמשתמש לחץ על הקישור במייל ואימת את ההרשמה.
    // ראה: newsletter-confirm.js (sendConfirmationSms)

    return json(200, {
      ok: true,
      saved: dbSaved,
      message: dbSaved
        ? 'כמעט סיימנו! שלחנו לך מייל אישור - בדוק את תיבת הדואר (וגם ספאם).'
        : 'שלחנו לך מייל - בדוק את תיבת הדואר (וגם ספאם).'
    });
  } catch (mailErr) {
    console.error('[newsletter] Email send failed:', mailErr);
    return json(500, { error: 'שגיאה בשליחת המייל. נסה שוב או צור קשר ב-WhatsApp.' });
  }
};

async function sendConfirmationEmail(email, firstName, confirmUrl, subscriberType, businessName, trade) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: SENDER,
      to: [email],
      subject: emailSubject(subscriberType, businessName),
      html: confirmationEmailHtml(firstName, confirmUrl, subscriberType, businessName, trade),
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Resend send failed:', res.status, errText);
    throw new Error('email send failed: ' + errText);
  }
  return res.json();
}
