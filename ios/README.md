# אפליקציית iPhone / iPad — "אופקים שלי"

כמו באנדרואיד, האפליקציה ל‑iOS עוטפת את אותו ה‑PWA
(`https://myofaqim.co.il`) — כאן בתוך **WKWebView** של אפל. הפרויקט נוצר
ע"י **PWABuilder iOS** ונפתח כפרויקט **Xcode (Swift)**.
**עדכון תוכן באתר מתעדכן אוטומטית גם באפליקציה.**

> ⚠️ **שלוש נקודות קריטיות שמבדילות מאנדרואיד:**
> 1. **חובה Mac + Xcode** כדי לבנות ולחתום. אי אפשר מ‑Linux/Windows.
> 2. **Apple Developer Program — 99$ לשנה** (לא חד‑פעמי).
>    → https://developer.apple.com/programs/
> 3. **בדיקת אפל מחמירה (Guideline 4.2 — Minimum Functionality):**
>    אפליקציה שהיא "רק אתר עטוף" עלולה להידחות. ראה סעיף
>    "איך לעבור את בדיקת אפל" למטה.

---

## דרישות מקדימות

1. **Mac** עם **macOS** עדכני.
2. **Xcode** (חינם מ‑App Store).
3. **Node.js 18+** ו‑npm (להרצת מחולל PWABuilder).
4. **חשבון Apple Developer** פעיל (99$/שנה).

---

## בנייה — צעד אחר צעד (על Mac)

### 1) יצירת פרויקט ה‑iOS
הדרך הקלה — דרך הדפדפן:
1. כנס ל‑https://www.pwabuilder.com
2. הזן `https://myofaqim.co.il` → Analyze.
3. בחר **iOS → Download Package**.
4. בעת ההורדה הזן את הערכים מתוך
   [`pwabuilder-config.json`](./pwabuilder-config.json):
   - **Bundle ID:** `il.co.myofaqim`
   - **App name:** `אופקים שלי`
   - **URL:** `https://myofaqim.co.il`
   - **Image URL:** `https://myofaqim.co.il/icon-512.png`

> חלופה ב‑CLI (ללא דפדפן):
> ```bash
> npx @pwabuilder/cli build --platform ios
> ```

### 2) פתיחה ובנייה ב‑Xcode
1. פתח את `App.xcodeproj` שב‑ZIP שהורדת.
2. בחר את ה‑**Team** שלך (Signing & Capabilities → Team).
3. ודא שה‑**Bundle Identifier** הוא `il.co.myofaqim`.
4. הוסף יכולת **Push Notifications** אם רוצים התראות (Capability → Push Notifications).
5. Product → Archive → Distribute App → **App Store Connect**.

---

## חיבור הדומיין (Universal Links — אופציונלי)

הקובץ [`../.well-known/apple-app-site-association`](../.well-known/apple-app-site-association)
מאפשר שקישורים ל‑`myofaqim.co.il` ייפתחו ישירות באפליקציה. כדי להפעיל:

1. השג את ה‑**Team ID** שלך (Apple Developer → Membership).
2. החלף בקובץ את שני המופעים של `REPLACE_WITH_TEAMID` ב‑Team ID האמיתי
   (לדוגמה `A1B2C3D4E5.il.co.myofaqim`).
3. ב‑Xcode הוסף Capability → **Associated Domains** → `applinks:myofaqim.co.il`.
4. דחוף לאתר ושחרר Deploy. ודא שהקובץ נגיש (ללא סיומת!) ב:
   `https://myofaqim.co.il/.well-known/apple-app-site-association`

> זה לא חובה כדי לפרסם — רק משפר את חוויית הקישורים.

---

## העלאה ל‑App Store

1. https://appstoreconnect.apple.com → My Apps → **+** → New App.
2. Platform: iOS · שם · שפה ראשית: עברית · Bundle ID: `il.co.myofaqim`.
3. אחרי ה‑Archive ב‑Xcode — ה‑build יופיע ב‑App Store Connect.
4. מלא: תיאור, מילות מפתח, צילומי מסך (חובה למספר גדלים: 6.7", 6.5", 5.5"),
   אייקון 1024×1024, ומדיניות פרטיות (`https://myofaqim.co.il/privacy`).
5. Submit for Review.

---

## איך לעבור את בדיקת אפל (Guideline 4.2)

אפל דוחה אפליקציות שהן "אתר ארוז" בלי ערך מוסף. כדי לעבור:

- ✅ **הפעל Push Notifications נטיביות** — לאתר כבר יש תשתית התראות.
- ✅ הדגש בתיאור החנות תכונות שמרגישות "אפליקציה": התראות, גישה מהירה
  לזמני תפילה, קופונים, פורום.
- ✅ ודא שה‑PWA עובד **offline** סביר (Service Worker קיים — `sw.js`).
- ✅ הוסף צילומי מסך שמראים פונקציונליות, לא רק דף בית.
- ⚠️ אם נדחה — אפשר לערער דרך Resolution Center ולהסביר את הערך הקהילתי
  והתכונות הנטיביות.

---

## הערה: תגיות Apple ב‑HTML

`index.html` כבר כולל את התגיות הדרושות
(`apple-mobile-web-app-capable`, `apple-touch-icon`, `apple-mobile-web-app-title`).
**34 מתוך 58 דפים פנימיים עדיין חסרים אותן** — לא קריטי למעטפת ה‑WKWebView,
אבל משפר את חוויית "הוסף למסך הבית" ב‑Safari. אפשר להשלים בנפרד.

---

## קבצים בתיקייה זו

| קובץ | תיאור |
|---|---|
| `pwabuilder-config.json` | ערכי הבנייה (bundle id, url, צבעים, דומיינים מורשים) |
| `../.well-known/apple-app-site-association` | Universal Links (עם placeholder ל‑Team ID) |
