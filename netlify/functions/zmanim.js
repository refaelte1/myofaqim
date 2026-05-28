// Netlify Function: zmanim
// מושכת זמני תפילה לאופקים לפי שיטת אור החיים מ-2net,
// מפרסרת את ה-HTML ומחזירה JSON.
// GET /.netlify/functions/zmanim
//
// Cache-Control מוגדר לשעה - Netlify CDN יקש את התגובה,
// כך שגם אם דף הבית נטען 1000 פעמים בשעה, אנחנו פונים ל-2net
// פעם אחת בלבד. שומר על אדיבות מול האתר שלהם.

const ZMANIM_URL = 'https://calendar.2net.co.il/todaytimes.aspx'
  + '?city=' + encodeURIComponent('אופקים')
  + '&methodId=3'; // 3 = שיטת אור החיים

// השדות שאנחנו רוצים לחלץ מהטבלה. שם השדה ב-2net → key באנגלית.
const FIELD_MAP = {
  'עלות השחר':              'alot_hashachar',
  'זמן טלית ותפילין':       'talit_tefilin',
  'זריחה מישורית':          'sunrise_flat',
  'זריחה הנראית':           'sunrise',
  'סוף זמן קריאת שמע מג"א': 'shma_mga',
  'סוף זמן קריאת שמע גרא':  'shma_gra',
  'סוף זמן תפילה מג"א':     'tefila_mga',
  'סוף זמן תפילה גרא':      'tefila_gra',
  'חצות היום והלילה':       'chatzot',
  'תחילת זמן מנחה גדולה':   'mincha_gedola',
  'מנחה קטנה':              'mincha_ktana',
  'פלג המנחה':              'plag_mincha',
  'שקיעה מישורית':          'sunset_flat',
  'שקיעה הנראית':           'sunset',
  'צאת הכוכבים':            'tzet_hakochavim',
  'צאת הכוכבים לרבנו תם':   'tzet_rabenu_tam',
  'דף יומי בבלי':           'daf_yomi_bavli',
  'דף יומי ירושלמי':        'daf_yomi_yerushalmi',
  'רמבם יומי':              'rambam_yomi',
  'ספירת העומר':            'sefirat_haomer',
  'הדלקת נרות':             'candle_lighting',
  'צאת השבת':               'shabbat_end',
  'צאת השבת לרבינו תם':     'shabbat_end_rt',
};

// regex לחילוץ זמן: HH:MM
const TIME_PATTERN = /^\d{1,2}:\d{2}$/;

function stripHtml(s) {
  if (!s) return '';
  return s
    .replace(/<img[^>]*>/g, '')     // הסר תמונות
    .replace(/<[^>]+>/g, '')         // הסר את כל ה-tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseZmanim(html) {
  const result = {
    times: {},          // זמנים (HH:MM)
    info: {},           // מידע טקסטואלי (ספירת העומר, דף יומי)
    hebrew_date: null,
    gregorian_date: null,
    parasha: null,
    has_shabbat: false,
  };

  // 1. חילוץ תאריך עברי ולועזי (מהכותרת)
  // לדוגמה: "ראשון - א' סיוון ה'תשפ"ו, 17/05/2026"
  const dateMatch = html.match(/(?:ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)\s*-\s*([^,<]+),\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (dateMatch) {
    result.hebrew_date = stripHtml(dateMatch[1]).trim();
    result.gregorian_date = dateMatch[2].trim();
  }

  // 2. חילוץ פרשת השבוע
  const parashaMatch = html.match(/פרשת השבוע:\s*<[^>]*>\s*([^<]+)</);
  if (parashaMatch) {
    result.parasha = stripHtml(parashaMatch[1]).trim();
  }

  // 3. חילוץ שורות הטבלה. ה-pattern של 2net:
  //    <tr>...<td>NAME</td><td>VALUE</td></tr>
  // אבל יש גם <span> ועיטורים, אז ה-regex צריך להיות סלחני.
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  let rowMatch;
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = [];
    let cellMatch;
    cellPattern.lastIndex = 0;
    while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
      cells.push(stripHtml(cellMatch[1]));
    }
    if (cells.length < 2) continue;

    const label = cells[0];
    const value = cells[1];
    const key = FIELD_MAP[label];
    if (!key) continue;
    if (!value) continue;

    if (TIME_PATTERN.test(value)) {
      result.times[key] = value;
      // הדלקת נרות / צאת השבת מסמנים שיש מידע שבת
      if (key === 'candle_lighting' || key === 'shabbat_end') {
        result.has_shabbat = true;
      }
    } else {
      result.info[key] = value;
    }
  }

  return result;
}

exports.handler = async (event) => {
  // קבלת זמני אופקים מ-2net
  try {
    const response = await fetch(ZMANIM_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; myofaqim-zmanim/1.0)',
        'Accept': 'text/html',
        'Accept-Language': 'he-IL,he;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error('Upstream returned ' + response.status);
    }

    const html = await response.text();
    const zmanim = parseZmanim(html);

    // ולידציה - חייב להיות לפחות זריחה ושקיעה כדי להחזיר נתונים
    if (!zmanim.times.sunrise && !zmanim.times.sunset) {
      throw new Error('Failed to parse zmanim - no times found');
    }

    // הזמנים מתעדכנים יומית, אז cache עד חצות הלילה.
    // נחשב כמה שניות עד חצות באזור זמן ישראל (UTC+3 בקיץ, UTC+2 בחורף).
    // לצורך פשטות, cache של שעה - מספיק טוב.
    const cacheSeconds = 3600;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
        'Access-Control-Allow-Origin': '*',
        'X-Source': '2net.co.il',
      },
      body: JSON.stringify({
        ok: true,
        source: '2net.co.il',
        method: 'אור החיים',
        city: 'אופקים',
        fetched_at: new Date().toISOString(),
        ...zmanim,
      }),
    };
  } catch (err) {
    console.error('zmanim error:', err);
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ok: false,
        error: err.message || 'Failed to fetch zmanim',
      }),
    };
  }
};
