#!/usr/bin/env bash
# ============================================================
#  build.sh — בניית אפליקציית האנדרואיד (TWA) של "אופקים שלי"
#  עוטף את ה-PWA בכתובת https://myofaqim.co.il לחבילת .aab
#  להעלאה ל-Google Play.
#
#  שימוש:
#    cd android
#    ./build.sh init     # פעם ראשונה בלבד — יוצר את פרויקט האנדרואיד
#    ./build.sh build    # מייצר app-release-bundle.aab + app-release-signed.apk
#    ./build.sh update   # מעדכן את הפרויקט אחרי שינוי ב-twa-manifest.json
#    ./build.sh fingerprint  # מדפיס את ה-SHA256 לקובץ assetlinks.json
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"

# ודא ש-Bubblewrap מותקן (דורש Node 14+ ו-JDK 17 + Android SDK)
if ! command -v bubblewrap >/dev/null 2>&1; then
  echo "Bubblewrap לא מותקן. מתקין גלובלית..."
  npm install -g @bubblewrap/cli
fi

CMD="${1:-build}"

case "$CMD" in
  init)
    # יוצר את פרויקט האנדרואיד מתוך ה-Web Manifest החי
    bubblewrap init --manifest https://myofaqim.co.il/manifest.json --directory .
    ;;
  build)
    bubblewrap build
    echo ""
    echo "✅ נבנה בהצלחה:"
    echo "   • app-release-bundle.aab   ← להעלאה ל-Google Play"
    echo "   • app-release-signed.apk   ← להתקנה ידנית/בדיקה"
    ;;
  update)
    bubblewrap update
    ;;
  fingerprint)
    # מדפיס את טביעת ה-SHA256 שצריך להכניס ל-.well-known/assetlinks.json
    bubblewrap fingerprint list
    ;;
  *)
    echo "פקודה לא מוכרת: $CMD  (init | build | update | fingerprint)"
    exit 1
    ;;
esac
