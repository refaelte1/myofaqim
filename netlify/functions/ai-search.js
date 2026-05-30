/**
 * ai-search.js — מנוע חיפוש חכם משולב AI ל"אופקים שלי"
 * ------------------------------------------------------------
 * POST /.netlify/functions/ai-search   body: { q, lat?, lng? }
 *
 * שלוש שכבות:
 *   1. שכבת כוונה (OpenAI): מתרגמת שאילתה חופשית ("איפה יש מניין קרוב")
 *      ל-JSON מובנה — קטגוריות, מילות מפתח+נרדפות, האם רוצה "קרוב", תפילה/שעה.
 *   2. שכבת אחזור (Supabase): שולפת תוכן רלוונטי, מדרגת לפי התאמת מילים +
 *      מרחק גאוגרפי (Haversine) מהמשתמש.
 *   3. שכבת תשובה (OpenAI): מנסחת משפט תשובה טבעי בעברית מעל התוצאות.
 *
 * עמיד לתקלות: אם אין מפתח OpenAI או שהקריאה נכשלת — נופל אוטומטית
 * לחיפוש מילולי (fallback intent) כך שהחיפוש לעולם לא "נשבר".
 *
 * env: OPENAI_API_KEY (חובה ל-AI), OPENAI_MODEL (ברירת מחדל gpt-4o-mini),
 *      SUPABASE_URL, SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY (אופציונלי).
 */

const { createClient } = require('@supabase/supabase-js');
const { rateLimited } = require('./_antispam');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ברירת מחדל לערכים הציבוריים (זהים למה שכבר חשוף ב-site.js)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
  || process.env.SUPABASE_PUBLISHABLE_KEY
  || 'sb_publishable_OewpLipzA15en2yUlMKQsQ_HGHo8sVk';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// מאמרים סטטיים (לא ב-DB) — תואם ל-search.html
const STATIC_ARTICLES = [
  { id: 'history-of-ofaqim', title: 'היסטוריה של אופקים - מ-1955 ועד היום', desc: 'הסיפור המלא של העיר', url: '/articles/history-of-ofaqim', keywords: 'היסטוריה אופקים 1955 עיר' },
  { id: 'new-resident-guide', title: 'מדריך לתושב חדש באופקים', desc: 'כל מה שצריך לדעת', url: '/articles/new-resident-guide', keywords: 'תושב חדש מדריך מעבר' },
  { id: 'coupons-guide', title: 'איך לקבל קופון או הטבה באופקים', desc: 'המדריך המלא', url: '/articles/coupons-guide', keywords: 'קופון הטבה מבצע' },
  { id: 'business-signup', title: 'רוצה לרשום את העסק שלך באופקים?', desc: 'המדריך לעסקים', url: '/articles/business-signup', keywords: 'עסק רישום פרסום שיווק' },
  { id: 'professionals-guide', title: 'בעלי מקצוע באופקים - איך למצוא ולקבל לידים', desc: 'מדריך מקיף', url: '/articles/professionals-guide', keywords: 'בעל מקצוע ליד חשמלאי אינסטלטור' },
];

// הקטגוריות שה-AI רשאי לבחור מהן (חייב להתאים למפתחות renderAIResults בלקוח)
const ALLOWED_CATEGORIES = ['business', 'professional', 'coupon', 'synagogue', 'mikveh', 'lesson', 'service', 'event', 'article'];

// ── עזרי מרחק וזמן ─────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// מנקה זמן לפורמט HH:MM להשוואה
function toMinutes(t) {
  if (!t) return null;
  const m = String(t).match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return (+m[1]) * 60 + (+m[2]);
}

// ── שכבה 1: ניתוח כוונה דרך OpenAI ────────────────────────────
async function parseIntent(q) {
  if (!OPENAI_API_KEY) return fallbackIntent(q);

  const system = `אתה מנוע ניתוח כוונות חיפוש לאתר קהילתי של העיר אופקים בישראל.
המשתמש מקליד שאילתה בשפה חופשית (עברית) ואתה מחזיר JSON בלבד.

הקטגוריות הזמינות באתר:
- "business" — עסקים (מסעדות, חנויות, מספרות, פיצריות...)
- "professional" — בעלי מקצוע (חשמלאי, אינסטלטור, שיפוצניק, עו"ד...)
- "coupon" — קופונים והטבות
- "synagogue" — בתי כנסת ומנייני תפילה (שחרית/מנחה/ערבית)
- "mikveh" — מקוואות
- "lesson" — שיעורי תורה
- "service" — שירותים ציבוריים (עירייה, קופת חולים, דואר, מוקד, חירום...)
- "event" — אירועי קהילה
- "article" — מאמרים ומדריכים

החזר אובייקט JSON בלבד עם השדות:
{
  "categories": [רשימת קטגוריות רלוונטיות מהרשימה למעלה; אם כללי/לא ברור — החזר את כולן],
  "keywords": [מילות חיפוש בעברית כולל מילים נרדפות והרחבות. לדוגמה ל"מניין" הוסף "בית כנסת","תפילה"; ל"רופא" הוסף "קופת חולים","מרפאה"],
  "wants_nearby": true אם המשתמש מבקש משהו "קרוב"/"ליד"/"באזור"/"הכי קרוב" אחרת false,
  "prayer": אחד מ "shacharit"/"mincha"/"arvit" אם הוזכרה תפילה ספציפית, אחרת null,
  "time": "HH:MM" אם הוזכרה שעה (למשל "בשבע בבוקר"→"07:00"), אחרת null,
  "intent_summary": "תיאור קצר של מה שהמשתמש מחפש"
}`;

  try {
    const data = await openai({
      model: OPENAI_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      max_tokens: 400,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: q },
      ],
    });
    const parsed = JSON.parse(data.choices[0].message.content);
    // ולידציה והקשחה
    let cats = Array.isArray(parsed.categories)
      ? parsed.categories.filter(c => ALLOWED_CATEGORIES.includes(c)) : [];
    if (!cats.length) cats = ALLOWED_CATEGORIES.slice();
    let kws = Array.isArray(parsed.keywords)
      ? parsed.keywords.map(k => String(k).trim()).filter(Boolean) : [];
    if (!kws.includes(q)) kws.unshift(q);
    return {
      categories: cats,
      keywords: [...new Set(kws)].slice(0, 12),
      wants_nearby: !!parsed.wants_nearby,
      prayer: ['shacharit', 'mincha', 'arvit'].includes(parsed.prayer) ? parsed.prayer : null,
      time: typeof parsed.time === 'string' && /^\d{1,2}:\d{2}$/.test(parsed.time) ? parsed.time : null,
      intent_summary: typeof parsed.intent_summary === 'string' ? parsed.intent_summary : '',
      _ai: true,
    };
  } catch (e) {
    return fallbackIntent(q);
  }
}

// מילון נרדפות בסיסי למסלול הגיבוי (כשאין מפתח OpenAI) — מאפשר חיפוש
// סביר גם בלי AI. ה-AI עצמו עושה הרחבה עשירה הרבה יותר.
const SYNONYMS = [
  { re: /מניין|מנין|תפיל|שחרית|מנחה|ערבית|מעריב|דאוונ/, add: ['בית כנסת', 'תפילה'] },
  { re: /רופא|בריאות|חולה|מרפא|קליניק|כללית|מכבי|מאוחדת|לאומית/, add: ['קופת חולים', 'כללית', 'מכבי', 'מאוחדת', 'לאומית', 'מרפאה'] },
  { re: /תרופ|מרקחת|בית מרקחת|פארם/, add: ['בית מרקחת', 'פארם'] },
  { re: /טביל|מקוו/, add: ['מקווה'] },
  { re: /עיריי|רשות|מוקד|דואר|ביטוח לאומי/, add: ['עירייה', 'מוקד', 'דואר'] },
  { re: /שיעור|דרש|לימוד תורה|הרצא/, add: ['שיעור', 'תורה'] },
  { re: /קופון|הטב|מבצע|הנח/, add: ['קופון', 'הטבה', 'מבצע'] },
];

// מילות עצירה גנריות שלא כדאי להפוך למילות-מפתח במסלול הגיבוי
const STOP = new Set(['בית', 'קרוב', 'קרובה', 'קרובים', 'ליד', 'איפה', 'יש', 'של', 'עם', 'מה', 'את', 'על', 'אני', 'רוצה', 'צריך', 'אצל', 'באזור', 'כאן', 'הכי', 'כל', 'איזה', 'איזו']);

// כוונת חירום ללא AI — חיפוש מילולי על כל הקטגוריות + הרחבה בסיסית
function fallbackIntent(q) {
  const words = q.split(/\s+/).map(w => w.trim()).filter(w => w.length >= 3 && !STOP.has(w));
  const expanded = [];
  for (const s of SYNONYMS) if (s.re.test(q)) expanded.push(...s.add);
  return {
    categories: ALLOWED_CATEGORIES.slice(),
    keywords: [...new Set([q, ...words, ...expanded])].slice(0, 14),
    wants_nearby: /(קרוב|ליד |באזור|סמוך|בקרבת|הכי קרוב)/.test(q),
    prayer: /שחרית/.test(q) ? 'shacharit' : /מנחה/.test(q) ? 'mincha' : /ערבית|מעריב/.test(q) ? 'arvit' : null,
    time: (q.match(/(\d{1,2}:\d{2})/) || [])[1] || null,
    intent_summary: '',
    _ai: false,
  };
}

// ── שכבה 2: אחזור ודירוג מ-Supabase ───────────────────────────
// בגלל היקף נתונים קטן כיום, נשלף את כל השורות הפעילות ומדרגים ב-JS.
// כשהמאגר יגדל — אפשר לדחוף את הסינון ל-DB או לעבור ל-pgvector.
async function retrieve(intent, coords) {
  const out = {};
  const kws = intent.keywords.map(k => k.toLowerCase());

  // ציון התאמת מילות מפתח: התאמה בכותרת שווה יותר מהתאמה בגוף
  function score(title, body) {
    const t = (title || '').toLowerCase();
    const b = (body || '').toLowerCase();
    let s = 0;
    for (const k of kws) {
      if (t.includes(k)) s += 3;
      else if (b.includes(k)) s += 1;
    }
    return s;
  }

  function withDistance(item, lat, lng) {
    if (coords && lat != null && lng != null) {
      item.distance_km = Math.round(haversineKm(coords.lat, coords.lng, +lat, +lng) * 10) / 10;
    }
    return item;
  }

  const inIntent = c => intent.categories.includes(c);

  // בחירה ודירוג של תוצאות בקטגוריה:
  //  • אם יש התאמות מילות-מפתח — מחזירים אותן בלבד.
  //  • אם אין התאמות אך זו קטגוריית-הכוונה ובוקש "קרוב" — מחזירים את כולן
  //    ממוינות לפי מרחק (כך "מניין קרוב" יחזיר את בתי הכנסת הקרובים גם
  //    בלי שם תואם). בכל מקרה אחר — לא מחזירים (נמנע רעש).
  function keep(items) {
    const cat = items.length ? items[0].type : null;
    const scored = items.filter(it => it._score > 0);
    let chosen;
    const focused = intent.categories.length < ALLOWED_CATEGORIES.length;
    if (scored.length) chosen = scored;
    else if (cat && inIntent(cat) && intent.wants_nearby && focused) chosen = items;
    else chosen = [];

    return chosen.sort((a, b) => {
      if (intent.wants_nearby) {
        const da = a.distance_km ?? 9999, db = b.distance_km ?? 9999;
        if (da !== db) return da - db;
      }
      if (b._score !== a._score) return b._score - a._score;
      const da = a.distance_km ?? 9999, db = b.distance_km ?? 9999;
      return da - db;
    }).slice(0, 8);
  }

  const tasks = [];

  // עסקים
  tasks.push((async () => {
    const { data } = await sb.from('businesses')
      .select('id,name,business_name,short_description,description,category,sub_category,tags,city,address,neighborhood,lat,lng,status,is_active,slug')
      .limit(100);
    out.business = keep((data || [])
      .filter(b => b.is_active !== false && !['pending', 'rejected', 'suspended', 'draft'].includes(b.status))
      .map(b => {
        const name = b.name || b.business_name || 'עסק';
        const it = withDistance({
          type: 'business', id: b.id,
          title: name,
          subtitle: b.short_description || b.description || (b.category ? String(b.category) : 'עסק באופקים'),
          footer: b.city || 'אופקים',
          url: `/business?id=${b.id}`,
          _inIntent: inIntent('business'),
          _score: score(name, [b.short_description, b.description, b.category, b.sub_category, b.tags, b.address].join(' ')),
        }, b.lat, b.lng);
        return it;
      }));
  })());

  // בעלי מקצוע
  tasks.push((async () => {
    const { data } = await sb.from('professionals')
      .select('id,name,category,tagline,description,phone,status,is_available,service_areas')
      .limit(100);
    out.professional = keep((data || [])
      .filter(p => !['pending', 'rejected', 'suspended'].includes(p.status))
      .map(p => ({
        type: 'professional', id: p.id,
        title: p.name || 'בעל מקצוע',
        subtitle: [p.category, p.tagline].filter(Boolean).join(' · ') || (p.description || '').slice(0, 90),
        footer: 'אופקים',
        url: '/professionals',
        _inIntent: inIntent('professional'),
        _score: score(p.name, [p.category, p.tagline, p.description].join(' ')),
      })));
  })());

  // קופונים
  tasks.push((async () => {
    const { data } = await sb.from('coupons')
      .select('id,title,description,status,expires_at')
      .limit(100);
    const now = Date.now();
    out.coupon = keep((data || [])
      .filter(c => c.status !== 'rejected' && c.status !== 'pending' && (!c.expires_at || new Date(c.expires_at).getTime() > now))
      .map(c => ({
        type: 'coupon', id: c.id,
        title: c.title || 'הטבה',
        subtitle: c.description || 'הטבה לתושבי אופקים',
        footer: c.expires_at ? 'תוקף: ' + new Date(c.expires_at).toLocaleDateString('he-IL') : 'פעיל',
        url: '/deals',
        _inIntent: inIntent('coupon'),
        _score: score(c.title, c.description),
      })));
  })());

  // בתי כנסת + מנייני תפילה
  tasks.push((async () => {
    const { data } = await sb.from('synagogues')
      .select('id,name,address,neighborhood,nusach,lat,lng,shacharit,mincha,maariv,shacharit_time,mincha_time,arvit_time,is_active')
      .limit(100);
    out.synagogue = keep((data || [])
      .filter(s => s.is_active !== false)
      .map(s => {
        const prayerTimes = {
          shacharit: s.shacharit_time || s.shacharit,
          mincha: s.mincha_time || s.mincha,
          arvit: s.arvit_time || s.maariv,
        };
        let bonus = 0;
        const bits = [];
        if (s.nusach) bits.push('נוסח ' + s.nusach);
        if (s.address) bits.push(s.address);
        // אם בוקשה תפילה/שעה — הצג והעדף בתי כנסת תואמים
        if (intent.prayer && prayerTimes[intent.prayer]) {
          bits.push(prayerName(intent.prayer) + ' ' + prayerTimes[intent.prayer]);
          bonus += 2;
          if (intent.time) {
            const want = toMinutes(intent.time), got = toMinutes(prayerTimes[intent.prayer]);
            if (want != null && got != null && Math.abs(want - got) <= 30) bonus += 3;
          }
        }
        return withDistance({
          type: 'synagogue', id: s.id,
          title: s.name || 'בית כנסת',
          subtitle: bits.join(' · ') || 'בית כנסת באופקים',
          footer: 'פרטים מלאים',
          url: '/synagogues',
          _inIntent: inIntent('synagogue'),
          _score: score(s.name, [s.address, s.nusach, s.neighborhood].join(' ')) + bonus,
        }, s.lat, s.lng);
      }));
  })());

  // מקוואות
  tasks.push((async () => {
    const { data } = await sb.from('mikvehs')
      .select('id,name,address,neighborhood,type,hours,phone,lat,lng,is_active')
      .limit(100);
    out.mikveh = keep((data || [])
      .filter(m => m.is_active !== false)
      .map(m => withDistance({
        type: 'mikveh', id: m.id,
        title: m.name || 'מקווה',
        subtitle: [m.type, m.address].filter(Boolean).join(' · ') || 'מקווה באופקים',
        footer: m.phone || 'פרטים',
        url: '/mikvaot',
        _inIntent: inIntent('mikveh'),
        _score: score(m.name, [m.type, m.address, m.neighborhood].join(' ')),
      }, m.lat, m.lng)));
  })());

  // שיעורי תורה
  tasks.push((async () => {
    const { data } = await sb.from('torah_lessons')
      .select('id,title,topic,rabbi_name,location,day_of_week,time_str,is_active')
      .limit(100);
    out.lesson = keep((data || [])
      .filter(l => l.is_active !== false)
      .map(l => {
        const day = (l.day_of_week != null && HE_DAYS[l.day_of_week]) ? 'יום ' + HE_DAYS[l.day_of_week] : '';
        return {
          type: 'lesson', id: l.id,
          title: l.title || l.topic || 'שיעור תורה',
          subtitle: [l.rabbi_name, l.location, day, l.time_str].filter(Boolean).join(' · ') || 'שיעור תורה',
          footer: 'שיעור תורה',
          url: '/torah-lessons',
          _inIntent: inIntent('lesson'),
          _score: score(l.title || l.topic, [l.rabbi_name, l.location, l.topic].join(' ')),
        };
      }));
  })());

  // שירותים ציבוריים (public_services + municipal_services)
  tasks.push((async () => {
    const [ps, ms] = await Promise.all([
      sb.from('public_services').select('id,category,name,subname,address,neighborhood,lat,lng,phone,is_active').limit(100),
      sb.from('municipal_services').select('id,name_he,description,category,address,phone,is_active').limit(100),
    ]);
    const a = (ps.data || []).filter(s => s.is_active !== false).map(s => withDistance({
      type: 'service', id: 'ps-' + s.id,
      title: s.name || 'שירות',
      subtitle: [s.subname, s.address].filter(Boolean).join(' · ') || (s.category || 'שירות ציבורי'),
      footer: s.phone || '',
      url: '/public-services',
      _inIntent: inIntent('service'),
      _score: score(s.name, [s.subname, s.address, s.category].join(' ')),
    }, s.lat, s.lng));
    const b = (ms.data || []).filter(s => s.is_active !== false).map(s => ({
      type: 'service', id: 'ms-' + s.id,
      title: s.name_he || 'שירות',
      subtitle: [s.description, s.address].filter(Boolean).join(' · ') || (s.category || 'שירות עירוני'),
      footer: s.phone || '',
      url: '/public-services',
      _inIntent: inIntent('service'),
      _score: score(s.name_he, [s.description, s.address, s.category].join(' ')),
    }));
    out.service = keep([...a, ...b]);
  })());

  // אירועי קהילה
  tasks.push((async () => {
    const { data } = await sb.from('events')
      .select('id,title,description,location_name,address,lat,lng,starts_at,status')
      .limit(100);
    const now = Date.now();
    out.event = keep((data || [])
      .filter(e => e.status !== 'rejected' && e.status !== 'draft' && (!e.starts_at || new Date(e.starts_at).getTime() > now - 86400000))
      .map(e => withDistance({
        type: 'event', id: e.id,
        title: e.title || 'אירוע',
        subtitle: [e.location_name || e.address, e.starts_at ? new Date(e.starts_at).toLocaleDateString('he-IL') : ''].filter(Boolean).join(' · ') || 'אירוע קהילתי',
        footer: 'אירוע',
        url: '/community-events',
        _inIntent: inIntent('event'),
        _score: score(e.title, [e.description, e.location_name, e.address].join(' ')),
      }, e.lat, e.lng)));
  })());

  await Promise.allSettled(tasks);

  // מאמרים סטטיים
  out.article = STATIC_ARTICLES
    .map(a => ({
      type: 'article', id: a.id,
      title: a.title, subtitle: a.desc, footer: 'מאמר באתר', url: a.url,
      _inIntent: inIntent('article'),
      _score: score(a.title, a.desc + ' ' + a.keywords),
    }))
    .filter(a => a._score > 0)
    .sort((a, b) => b._score - a._score).slice(0, 6);

  // ניקוי שדות פנימיים מהפלט
  for (const k of Object.keys(out)) {
    out[k] = (out[k] || []).map(({ _score, _inIntent, ...rest }) => rest);
  }
  return out;
}

function prayerName(p) {
  return { shacharit: 'שחרית', mincha: 'מנחה', arvit: 'ערבית' }[p] || '';
}

// ── שכבה 3: ניסוח תשובה טבעית ─────────────────────────────────
const GROUP_HE = {
  business: 'עסקים', professional: 'בעלי מקצוע', coupon: 'קופונים',
  synagogue: 'בתי כנסת', mikveh: 'מקוואות', lesson: 'שיעורי תורה',
  service: 'שירותי קהילה', event: 'אירועים', article: 'מאמרים',
};

async function composeAnswer(q, intent, results, coords) {
  const flat = [];
  for (const [cat, items] of Object.entries(results)) {
    for (const it of items.slice(0, 4)) {
      flat.push({ קטגוריה: GROUP_HE[cat] || cat, שם: it.title, פרטים: it.subtitle, מרחק_קמ: it.distance_km });
    }
  }
  const total = flat.length;

  if (!total) {
    return `לא מצאתי תוצאות עבור "${q}". אפשר לנסות ניסוח אחר — למשל "פיצה", "חשמלאי", "בית כנסת קרוב" או "קופת חולים".`;
  }

  if (!OPENAI_API_KEY) return templateAnswer(q, results, coords);

  try {
    const data = await openai({
      model: OPENAI_MODEL,
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        {
          role: 'system',
          content: `אתה עוזר חיפוש ידידותי לאתר הקהילתי של אופקים. נסח משפט-שניים קצרים בעברית שמסכמים את תוצאות החיפוש למשתמש. ${coords ? 'למשתמש יש מיקום, אז ציין את הקרוב ביותר אם רלוונטי.' : 'אין למשתמש מיקום פעיל — אם השאלה הייתה על משהו "קרוב", ציין בעדינות שאפשר לאפשר שיתוף מיקום לתוצאות מדויקות יותר.'} אל תמציא פרטים שאינם ברשימה. אל תשתמש ב-markdown.`,
        },
        {
          role: 'user',
          content: `שאילתה: "${q}"\nתוצאות (JSON):\n${JSON.stringify(flat)}`,
        },
      ],
    });
    return data.choices[0].message.content.trim();
  } catch (e) {
    return templateAnswer(q, results, coords);
  }
}

function templateAnswer(q, results, coords) {
  const total = Object.values(results).reduce((s, a) => s + a.length, 0);
  const parts = Object.entries(results).filter(([, a]) => a.length)
    .map(([c, a]) => `${a.length} ${GROUP_HE[c] || c}`);
  return `נמצאו ${total} תוצאות עבור "${q}": ${parts.join(', ')}.`;
}

// ── קריאת OpenAI ──────────────────────────────────────────────
async function openai(body) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

// ── Handler ───────────────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }

  // הגבלת קצב — הגנה מפני שימוש לרעה בעלויות AI (30 בקשות/דקה לכל IP)
  if (rateLimited(event, 'ai-search', 30, 60000)) {
    return { statusCode: 429, headers, body: JSON.stringify({ ok: false, error: 'יותר מדי בקשות, נסו בעוד רגע' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Bad JSON' }) };
  }

  const q = String(payload.q || '').trim().slice(0, 200);
  if (!q) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'חסרה שאילתה' }) };
  }

  let coords = null;
  const lat = parseFloat(payload.lat), lng = parseFloat(payload.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) coords = { lat, lng };

  try {
    const intent = await parseIntent(q);
    const results = await retrieve(intent, coords);
    const answer = await composeAnswer(q, intent, results, coords);
    const total = Object.values(results).reduce((s, a) => s + a.length, 0);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        query: q,
        answer,
        total,
        ai: intent._ai,
        wants_nearby: intent.wants_nearby,
        has_geo: !!coords,
        intent_summary: intent.intent_summary,
        results,
      }),
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'שגיאת שרת בחיפוש' }) };
  }
};
