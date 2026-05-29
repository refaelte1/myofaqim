# אפליקציית אנדרואיד — "אופקים שלי"

האפליקציה נבנית כ‑**TWA (Trusted Web Activity)** — מעטפת אנדרואיד שמציגה את
ה‑PWA הקיים שלך (`https://myofaqim.co.il`) במסך מלא, בלי סרגל דפדפן, עם אייקון
משלה ב‑Google Play. **כל עדכון לאתר מתעדכן אוטומטית גם באפליקציה** — אין צורך
לפרסם גרסה חדשה בכל שינוי תוכן.

---

## דרישות מקדימות (חד‑פעמי)

על המחשב שבו תבנה את האפליקציה צריך:

1. **Node.js 18+** ו‑**npm**
2. **JDK 17** (Bubblewrap מוריד אוטומטית אם חסר)
3. **Android SDK** (Bubblewrap מוריד אוטומטית אם חסר)
4. **חשבון Google Play Developer** — תשלום חד‑פעמי של 25$
   → https://play.google.com/console/signup

> אפשר גם לבנות בלי כלום מקומית דרך **PWABuilder** בדפדפן:
> https://www.pwabuilder.com → הזן `https://myofaqim.co.il` → Package for Android.
> אבל הקבצים כאן נותנים שליטה מלאה ובנייה חוזרת מהירה.

---

## בנייה — צעד אחר צעד

כל הפקודות מתוך תיקיית `android/`:

```bash
cd android

# 1) פעם ראשונה בלבד — יוצר את פרויקט האנדרואיד ואת ה-keystore לחתימה
./build.sh init

# 2) בכל בנייה — מייצר את החבילות
./build.sh build
```

הפלט:
- **`app-release-bundle.aab`** ← הקובץ שמעלים ל‑Google Play Console
- **`app-release-signed.apk`** ← להתקנה ידנית על מכשיר לבדיקה

> ⚠️ **שמור היטב את קובץ ה‑`android.keystore` ואת הסיסמאות שלו!**
> בלעדיו לא תוכל לפרסם עדכונים לאפליקציה ל‑Play בעתיד.
> הקובץ הזה לא נשמר ב‑Git בכוונה (ראה `.gitignore`).

---

## חיבור הדומיין לאפליקציה (Digital Asset Links)

כדי שאנדרואיד יסמוך על הדומיין ויסיר את סרגל הדפדפן, צריך לקשר בין שניהם:

1. קבל את טביעת ה‑SHA256 של מפתח החתימה:
   ```bash
   ./build.sh fingerprint
   ```
2. העתק את ה‑`SHA256` והדבק אותו בקובץ
   [`../.well-known/assetlinks.json`](../.well-known/assetlinks.json)
   במקום `REPLACE_WITH_YOUR_SHA256_FINGERPRINT`.
3. דחוף לאתר ושחרר Deploy. ודא שהקובץ נגיש ב:
   `https://myofaqim.co.il/.well-known/assetlinks.json`

> **חשוב:** אם תשתמש ב‑**Play App Signing** (מומלץ ע"י גוגל), Google חותם את
> האפליקציה במפתח משלו ותקבל **SHA256 שונה** מ‑Play Console
> (Setup → App integrity → App signing key certificate). יש להוסיף **גם** אותו
> ל‑`assetlinks.json` — מותר לשים כמה טביעות במערך.

---

## העלאה ל‑Google Play

1. כנס ל‑https://play.google.com/console → Create app.
2. מלא פרטים: שם, שפה (עברית), קטגוריה, מדיניות פרטיות
   (`https://myofaqim.co.il/privacy`).
3. Production → Create new release → העלה את `app-release-bundle.aab`.
4. מלא נכסי חנות: תיאור, צילומי מסך, אייקון 512×512 (יש לך `icon-512.png`),
   באנר Feature Graphic 1024×500.
5. שלח לבדיקה. אישור ראשון אצל גוגל לוקח בד"כ כמה ימים.

---

## עדכון גרסה עתידי

עדכון תוכן באתר → לא דורש כלום (ה‑TWA טוען את האתר החי).

עדכון של האפליקציה עצמה (אייקון, שם, הרשאות):
```bash
# העלה את appVersionCode ב-twa-manifest.json (1 → 2 → 3 ...)
./build.sh update
./build.sh build
```
ואז העלה את ה‑`.aab` החדש כ‑Release חדש ב‑Play Console.

---

## קבצים בתיקייה זו

| קובץ | תיאור |
|---|---|
| `twa-manifest.json` | קונפיגורציית Bubblewrap (שם, צבעים, אייקונים, קיצורי דרך) |
| `build.sh` | סקריפט עזר ל‑init / build / update / fingerprint |
| `.gitignore` | מונע העלאת keystore וקבצי build רגישים ל‑Git |
| `../.well-known/assetlinks.json` | קישור הדומיין לאפליקציה (Digital Asset Links) |
