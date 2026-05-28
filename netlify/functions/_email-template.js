// ============================================================
//  _email-template.js
//  תבנית מייל אחידה לכל הפונקציות.
//  קבצים שמתחילים ב-_ אינם נטענים כ-Netlify functions בעצמם.
//
//  שימוש:
//    const { wrapEmail, btn, infoBox, divider } = require('./_email-template');
//    const html = wrapEmail({ preheader: '...', title: '...', content: '...' });
// ============================================================

// ── צבעי האתר ───────────────────────────────────────────────
const C = {
  navy:       '#1A2E5C',
  navy700:    '#243B6E',
  blue:       '#2563EB',
  blueSoft:   '#EBF2FE',
  orange:     '#F59E0B',
  orangeDk:   '#D97706',
  orangeSoft: '#FEF3E8',
  green:      '#65A30D',
  greenSoft:  '#F0FDF4',
  cream:      '#FBFAF7',
  paper:      '#FFFFFF',
  ink:        '#1A1A1A',
  inkSoft:    '#4A4A4A',
  inkMute:    '#8A8A8A',
  line:       '#E5E7EB',
  lineSoft:   '#F1F2F4',
};

const LOGO_URL = 'https://myofaqim.co.il/logo-email.png';
const SITE_URL = 'https://myofaqim.co.il';
const CONTACT_PHONE = '054-233-8233';
const WA_LINK = 'https://wa.me/972542338233';

// ── פונקציית escape בסיסית ────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

// ── עוטף ראשי - מבנה מייל מלא ──────────────────────────────
function wrapEmail({ preheader = '', content = '' }) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>אופקים שלי</title>
<!--[if mso]>
<style type="text/css">
table, td { font-family: Arial, sans-serif !important; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.cream};font-family:'Heebo','Segoe UI',Arial,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;direction:rtl;">

<!-- preheader (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.cream};padding:32px 16px;">
  <tr>
    <td align="center">

      <!-- Card -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:${C.paper};border:1px solid ${C.line};border-radius:10px;overflow:hidden;">

        <!-- Logo header -->
        <tr>
          <td style="padding:36px 40px 24px;text-align:center;background:${C.paper};">
            <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
              <img src="${LOGO_URL}" alt="אופקים שלי" width="160" height="160" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;width:160px;height:160px;max-width:160px;">
            </a>
          </td>
        </tr>

        <!-- Divider line under logo -->
        <tr>
          <td style="padding:0 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="border-top:1px solid ${C.lineSoft};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Main content -->
        <tr>
          <td style="padding:32px 40px 36px;background:${C.paper};">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${C.cream};padding:28px 40px;border-top:1px solid ${C.line};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="font-size:13px;color:${C.inkSoft};line-height:1.7;text-align:right;">
                  <div style="font-family:'Heebo','Segoe UI',Arial,sans-serif;font-weight:900;color:${C.navy};font-size:15px;letter-spacing:-0.01em;">
                    אופקים <span style="color:${C.blue};">שלי</span>
                  </div>
                  <div style="font-size:11px;color:${C.blue};letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-top:2px;direction:ltr;text-align:right;">
                    MyOfaqim.co.il
                  </div>
                </td>
                <td style="font-size:12px;color:${C.inkMute};line-height:1.8;text-align:left;">
                  <a href="tel:0542338233" style="color:${C.navy};text-decoration:none;font-weight:700;" dir="ltr">${CONTACT_PHONE}</a><br>
                  <a href="${WA_LINK}" style="color:${C.blue};text-decoration:none;font-weight:600;">WhatsApp</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

      <!-- copyright -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;margin-top:16px;">
        <tr>
          <td style="text-align:center;padding:0 16px;font-size:11px;color:${C.inkMute};line-height:1.6;">
            © 2026 MyOfaqim.co.il · הקהילה הדיגיטלית של עיר אופקים
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}

// ── רכיבי תוכן ────────────────────────────────────────────

// כותרת ראשית
function h1(text) {
  return `<h1 style="margin:0 0 12px;font-family:'Heebo','Segoe UI',Arial,sans-serif;font-size:28px;font-weight:900;color:${C.navy};letter-spacing:-0.02em;line-height:1.2;">${text}</h1>`;
}

// תת-כותרת
function h2(text) {
  return `<h2 style="margin:24px 0 12px;font-family:'Heebo','Segoe UI',Arial,sans-serif;font-size:18px;font-weight:800;color:${C.navy};letter-spacing:-0.01em;">${text}</h2>`;
}

// פסקה
function p(text) {
  return `<p style="margin:0 0 16px;font-size:15px;color:${C.inkSoft};line-height:1.7;">${text}</p>`;
}

// כפתור CTA
function btn(label, href, variant = 'navy') {
  const colors = {
    navy:   { bg: C.navy,   color: C.paper },
    blue:   { bg: C.blue,   color: C.paper },
    orange: { bg: C.orange, color: C.navy  },
    green:  { bg: C.green,  color: C.paper },
  };
  const c = colors[variant] || colors.navy;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr><td style="background:${c.bg};border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;font-family:'Heebo','Segoe UI',Arial,sans-serif;font-size:15px;font-weight:800;color:${c.color};text-decoration:none;letter-spacing:0.3px;">${label}</a>
    </td></tr>
  </table>`;
}

// קופסת מידע - 4 וריאנטים
function infoBox(label, content, variant = 'navy') {
  const styles = {
    navy:   { bg: C.cream,      border: C.navy,   label: C.navy },
    orange: { bg: C.orangeSoft, border: C.orange, label: C.orangeDk },
    blue:   { bg: C.blueSoft,   border: C.blue,   label: C.blue },
    green:  { bg: C.greenSoft,  border: C.green,  label: C.green },
  };
  const s = styles[variant] || styles.navy;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
    <tr>
      <td style="background:${s.bg};border-right:3px solid ${s.border};padding:18px 24px;border-radius:6px;">
        ${label ? `<div style="font-size:11px;font-weight:800;color:${s.label};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">${label}</div>` : ''}
        <div style="font-size:14px;color:${C.inkSoft};line-height:1.7;">${content}</div>
      </td>
    </tr>
  </table>`;
}

// רשימת צעדים ממוספרת
function steps(items) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">${items.map((item, i) => `
    <tr>
      <td width="32" valign="top" style="padding:6px 0;">
        <div style="width:24px;height:24px;background:${C.blue};color:${C.paper};border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:800;font-family:Arial,sans-serif;">${i + 1}</div>
      </td>
      <td valign="top" style="padding:8px 12px 8px 0;font-size:14px;color:${C.inkSoft};line-height:1.6;">
        ${item}
      </td>
    </tr>`).join('')}</table>`;
}

// טבלת פרטים (label : value)
function detailsTable(rows) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;border:1px solid ${C.line};border-radius:6px;">${rows.map((r, i) => `
    <tr>
      <td width="35%" style="padding:12px 18px;background:${i % 2 ? C.paper : C.cream};border-bottom:${i < rows.length - 1 ? `1px solid ${C.lineSoft}` : 'none'};font-size:12px;font-weight:700;color:${C.inkMute};letter-spacing:0.5px;text-transform:uppercase;vertical-align:top;">${esc(r[0])}</td>
      <td style="padding:12px 18px;background:${i % 2 ? C.paper : C.cream};border-bottom:${i < rows.length - 1 ? `1px solid ${C.lineSoft}` : 'none'};font-size:14px;color:${C.ink};font-weight:600;">${r[1]}</td>
    </tr>`).join('')}</table>`;
}

// קו מפריד
function divider() {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">
    <tr><td style="border-top:1px solid ${C.lineSoft};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
}

// קופסת חתימה (footer of message, before page footer)
function signature() {
  return `<p style="margin:24px 0 0;font-size:14px;color:${C.inkSoft};line-height:1.7;">
    בברכה,<br>
    <strong style="color:${C.navy};">צוות אופקים שלי</strong>
  </p>`;
}

module.exports = {
  C, LOGO_URL, SITE_URL, CONTACT_PHONE, WA_LINK,
  esc, wrapEmail,
  h1, h2, p, btn, infoBox, steps, detailsTable, divider, signature,
};
