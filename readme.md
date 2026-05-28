# אופקים שלי — MyOfaqim.co.il

הפלטפורמה הקהילתית של העיר אופקים: עסקים, קופונים, נדל"ן, פורום, חדשות, יהדות ועוד.

---

## מבנה הפרויקט

```
myofaqim-clean/
├── index.html              ← דף הבית
├── site.css                ← עיצוב משותף (designed system)
├── site.js                 ← JS משותף (header, footer, מצב שבת)
│
├── businesses.html         ← אלפון עסקים
├── business.html           ← דף עסק בודד
├── biz.html                ← דשבורד עסק (פרטי)
├── biz-signup.html         ← הרשמת עסק (4 מסלולים)
│
├── professionals.html      ← בעלי מקצוע
├── pro-signup.html         ← הרשמת בעל מקצוע
│
├── deals.html              ← קופונים והטבות
├── supermarket-manage.html ← ניהול מבצעי סופרמרקטים (אדמין)
│
├── jobs.html               ← לוח דרושים
├── realestate.html         ← נדל"ן
│
├── forum.html              ← פורום תושבים
├── community-events.html   ← לוח אירועים
├── whatsapp-groups.html    ← קבוצות וואטסאפ
├── subscribe.html          ← הצטרפות לניוזלטר
│
├── zmanim.html             ← זמני תפילה (14 זמנים)
├── synagogues.html         ← בתי כנסת
├── mikvaot.html            ← מקוואות
├── religious-services.html ← שירותי דת
│
├── news.html               ← חדשות העיר
├── article.html            ← כתבה בודדת
├── public-services.html    ← שירותי קהילה
│
├── contact.html            ← יצירת קשר
├── about.html              ← אודות
├── privacy.html, terms.html, accessibility.html
│
├── admin.html              ← פאנל ניהול (לאדמין בלבד)
│
├── netlify.toml            ← קונפיגורציה של Netlify
├── netlify/functions/
│   ├── zmanim.js           ← API לזמני תפילה
│   ├── newsletter-*.js     ← ניוזלטר
│   ├── contact-submit.js   ← טופס יצירת קשר
│   └── ...
│
├── database-setup.sql      ← סכמת DB מלאה
└── seed-data.sql           ← נתונים התחלתיים
```

---

## הוראות העלאה (Deploy)

### שלב 1: Supabase

1. כניסה ל-https://supabase.com → New project (אם עוד אין)
2. SQL Editor → הריצי את `database-setup.sql`
3. SQL Editor → הריצי את `seed-data.sql`
4. Authentication → Providers → הפעלת Google
5. URL Configuration:
   - Site URL: `https://myofaqim.co.il`
   - Redirect URLs: `https://myofaqim.co.il/biz`, `https://myofaqim.co.il/admin`, `https://myofaqim.co.il/forum`

### שלב 2: Admin User

לאחר התחברות ראשונית עם Google בכתובת `refael@tedgi.co.il`:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'refael@tedgi.co.il';
```

### שלב 3: Netlify

1. Push the folder to Git (GitHub/GitLab)
2. Netlify → New site from Git
3. Build settings:
   - Build command: (ריק)
   - Publish directory: `/`
4. Environment Variables:
   - `SUPABASE_URL` = https://uexrxkzewfmhthrllsmd.supabase.co
   - `SUPABASE_SERVICE_KEY` = (שלח שלך מ-Supabase Settings → API)
   - `RESEND_API_KEY` = (אופציונלי — לשליחת מיילים)
   - `MAKE_BUSINESS_WEBHOOK_URL` = (אופציונלי — Make.com)
   - `MAKE_CONTACT_WEBHOOK_URL` = (אופציונלי — Make.com)
   - `ADMIN_EMAIL` = refael@tedgi.co.il
5. Domain: לחבר `myofaqim.co.il`

### שלב 4: בדיקות לאחר העלאה

- [ ] דף הבית נטען
- [ ] זמני תפילה ב-`/zmanim` עובדים
- [ ] התחברות Google ב-`/biz` עובדת
- [ ] התחברות אדמין ב-`/admin` עובדת
- [ ] טופס יצירת קשר שולח
- [ ] מצב שבת מופיע בכניסת השבת (`?shabbat=1` לתצוגה מוקדמת)

---

## עיצוב

**צבעים:**
- Navy: `#0D1B3E` (ראשי)
- Gold: `#C8A95E` (אקצנט)
- Cream: `#FBFAF7` (רקע)

**פונטים:**
- Frank Ruhl Libre (כותרות)
- Heebo (גוף)

**עקרונות:**
- ללא אימוג'י בממשק
- מובייל-first
- RTL מלא
- WCAG 2.1 AA

---

## תכוניות (4 מסלולים)

| מסלול | מחיר השקה | רגיל |
|---|---|---|
| FREE | 0 ₪ | — |
| BASIC | 99 ₪/ח | 149 ₪ |
| PRO | 149 ₪/ח | 249 ₪ |
| ENTERPRISE | 449 ₪/ח | 649 ₪ |

---

## יצירת קשר

- טלפון: 054-233-8233
- WhatsApp: 972-542338233
- מנהל: רפאל תדגי
