/* ════════════════════════════════════════════════════
   MyOfaqim.co.il - Site-wide JavaScript
   ════════════════════════════════════════════════════ */

// ── Supabase Constants ──
const SB_URL = 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SB_KEY = 'sb_publishable_OewpLipzA15en2yUlMKQsQ_HGHo8sVk';

// ── Helpers ──
const $ = id => document.getElementById(id);
const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const fmt = n => n == null ? '' : Number(n).toLocaleString('he-IL');

const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

// ── HEADER HTML ──
const HEADER_HTML = `
<header class="site-header">
  <style id="mof-tb-style">
    #mof-tb-wrap { background: #0F1E3D !important; color: #fff !important; width: 100% !important; border-bottom: 1px solid rgba(245,158,11,0.2) !important; font-family: 'Heebo', sans-serif !important; }
    #mof-tb-inner { max-width: 1280px !important; margin: 0 auto !important; height: 36px !important; padding: 0 16px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 12px !important; }
    .mof-side { display: flex !important; align-items: center !important; gap: 8px !important; flex-shrink: 0 !important; white-space: nowrap !important; }
    .mof-mid { flex: 1 1 0 !important; min-width: 0 !important; text-align: center !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; }
    .mof-time { color: #F59E0B !important; font-weight: 900 !important; font-size: 13px !important; letter-spacing: 1px !important; font-variant-numeric: tabular-nums !important; direction: ltr !important; }
    .mof-date { color: rgba(255,255,255,0.5) !important; font-size: 11px !important; font-weight: 600 !important; padding-right: 8px !important; border-right: 1px solid rgba(255,255,255,0.12) !important; }
    .mof-greet { color: rgba(255,255,255,0.92) !important; font-size: 12px !important; font-weight: 700 !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    .mof-greet .name { color: #F59E0B !important; font-weight: 900 !important; }
    .mof-temp { color: #fff !important; font-size: 13px !important; font-weight: 900 !important; font-variant-numeric: tabular-nums !important; direction: ltr !important; }
    .mof-desc { color: rgba(255,255,255,0.5) !important; font-size: 11px !important; font-weight: 600 !important; padding-right: 8px !important; border-right: 1px solid rgba(255,255,255,0.12) !important; }
    .mof-icon { color: #F59E0B !important; display: inline-flex !important; align-items: center !important; flex-shrink: 0 !important; }
    @media (max-width: 600px) {
      #mof-tb-inner { padding: 0 10px !important; gap: 6px !important; }
      .mof-date { display: none !important; }
      .mof-desc { display: none !important; }
      .mof-greet { font-size: 11px !important; }
      .mof-time { font-size: 12px !important; letter-spacing: 0.5px !important; }
      .mof-temp { font-size: 12px !important; }
    }
  </style>
  <div id="mof-tb-wrap">
    <div id="mof-tb-inner">
      <div class="mof-side">
        <span class="mof-time" id="tb-time">--:--</span>
        <span class="mof-date" id="tb-date">—</span>
      </div>
      <div class="mof-mid">
        <span class="mof-icon" id="tb-icon"></span>
        <span class="mof-greet" id="tb-greeting">—</span>
      </div>
      <div class="mof-side">
        <span class="mof-desc" id="tb-desc">—</span>
        <span class="mof-temp" id="tb-temp">—°</span>
        <span class="mof-icon" id="tb-wicon"></span>
      </div>
    </div>
  </div>

  <div class="header-main container">
    <a href="/" class="brand">
      <img src="/logo.png" alt="אופקים שלי" class="brand-logo-img" onerror="this.style.display='none'">
      <div>
        <div class="brand-mark">אופקים <span class="accent">שלי</span></div>
        <div class="brand-sub">MyOfaqim.co.il</div>
      </div>
    </a>

    <nav class="main-nav" aria-label="ניווט ראשי">
      <div class="nav-item"><a href="/" class="nav-link">בית</a></div>

      <div class="nav-item">
        <span class="nav-link">עסקים <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10L6 8z"/></svg></span>
        <div class="nav-dropdown">
          <div class="nav-label">אינדקסים</div>
          <a href="/businesses" class="featured">אלפון עסקים</a>
          <a href="/professionals" class="featured">בעלי מקצוע</a>
          <div class="nav-divider"></div>
          <a href="/biz-register">הצטרפות עסק חדש</a>
          <a href="/biz">כניסה לאיזור עסקים</a>
        </div>
      </div>

      <div class="nav-item">
        <span class="nav-link">מבצעים <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10L6 8z"/></svg></span>
        <div class="nav-dropdown">
          <a href="/deals" class="featured">קופונים והטבות</a>
          <a href="/deals?type=supermarket">מבצעי סופרמרקטים</a>
          <a href="/deals?type=stores">מבצעי חנויות</a>
          <a href="/deals?type=weekly">מבצעי השבוע</a>
        </div>
      </div>

      <div class="nav-item">
        <span class="nav-link">קהילה <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10L6 8z"/></svg></span>
        <div class="nav-dropdown">
          <a href="/forum" class="featured">פורום תושבים</a>
          <a href="/community-events">לוח אירועים</a>
          <a href="/whatsapp-groups">קבוצות וואטסאפ</a>
          <a href="/subscribe">הצטרפות לניוזלטר</a>
        </div>
      </div>

      <div class="nav-item">
        <span class="nav-link">יהדות <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10L6 8z"/></svg></span>
        <div class="nav-dropdown">
          <a href="/zmanim" class="featured">זמני תפילה</a>
          <a href="/prayer-times#lessons">שיעורי תורה</a>
          <a href="/synagogues">בתי כנסת</a>
          <a href="/mikvaot">מקוואות</a>
          <a href="/religious-services">שירותי דת</a>
        </div>
      </div>

      <div class="nav-item">
        <span class="nav-link">לוחות <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10L6 8z"/></svg></span>
        <div class="nav-dropdown">
          <a href="/realestate" class="featured">לוח נדל"ן</a>
          <a href="/jobs" class="featured">לוח דרושים</a>
        </div>
      </div>

      <div class="nav-item">
        <span class="nav-link">מידע <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10L6 8z"/></svg></span>
        <div class="nav-dropdown">
          <a href="/news">חדשות העיר</a>
          <a href="/public-services?cat=municipal">אלפון עירייה</a>
          <a href="/public-services?cat=transport">תחבורה</a>
          <a href="/public-services?cat=health">קופות חולים</a>
          <a href="/public-services?cat=mail_bank">בנקים ודואר</a>
          <a href="/public-services?cat=emergency">חירום</a>
          <div class="nav-divider"></div>
          <a href="/contact" class="featured">יצירת קשר</a>
        </div>
      </div>
    </nav>

    <div class="header-actions">
      <button class="header-search-btn" id="mof-auth-btn" onclick="mofOpenAuth()" aria-label="התחברות" title="התחברות / הרשמה">
        <svg id="mof-auth-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span id="mof-auth-avatar" style="display:none;"></span>
      </button>
      <button class="header-search-btn" onclick="toggleSearch()" aria-label="חיפוש">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </button>
      <a href="/biz-register" class="btn-filled">הצטרפות כעסק</a>
      <button class="mobile-toggle" onclick="toggleMobileMenu()" aria-label="תפריט">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<div class="mobile-overlay" id="mobile-overlay" onclick="toggleMobileMenu()"></div>
<div class="mobile-drawer" id="mobile-drawer">
  <div class="mobile-drawer-head">
    <div class="brand-mark" style="font-size:24px">אופקים <span class="accent">שלי</span></div>
    <button class="mobile-drawer-close" onclick="toggleMobileMenu()">×</button>
  </div>
  <nav>
    <a href="/" class="mobile-main">בית</a>
    <details class="mobile-section"><summary>עסקים<span class="arrow">+</span></summary><div class="mobile-sub"><a href="/businesses">אלפון עסקים</a><a href="/professionals">בעלי מקצוע</a><a href="/biz-register">הצטרפות עסק</a><a href="/biz">כניסה לעסקים</a></div></details>
    <details class="mobile-section"><summary>מבצעים<span class="arrow">+</span></summary><div class="mobile-sub"><a href="/deals">קופונים</a><a href="/deals?type=supermarket">סופרמרקטים</a><a href="/deals?type=stores">חנויות</a></div></details>
    <details class="mobile-section"><summary>קהילה<span class="arrow">+</span></summary><div class="mobile-sub"><a href="/forum">פורום תושבים</a><a href="/community-events">אירועים</a><a href="/whatsapp-groups">וואטסאפ</a><a href="/subscribe">ניוזלטר</a></div></details>
    <details class="mobile-section"><summary>יהדות<span class="arrow">+</span></summary><div class="mobile-sub"><a href="/zmanim">זמני תפילה</a><a href="/prayer-times#lessons">שיעורי תורה</a><a href="/synagogues">בתי כנסת</a><a href="/mikvaot">מקוואות</a><a href="/religious-services">שירותי דת</a></div></details>
    <details class="mobile-section"><summary>לוחות<span class="arrow">+</span></summary><div class="mobile-sub"><a href="/realestate">נדל"ן</a><a href="/jobs">דרושים</a></div></details>
    <details class="mobile-section"><summary>מידע<span class="arrow">+</span></summary><div class="mobile-sub"><a href="/news">חדשות</a><a href="/public-services?cat=municipal">עירייה</a><a href="/public-services?cat=transport">תחבורה</a><a href="/public-services?cat=health">קופות חולים</a><a href="/contact">יצירת קשר</a></div></details>
  </nav>
  <div class="mobile-drawer-actions">
    <a href="/search" class="btn-outline" style="text-align:center;display:flex;align-items:center;justify-content:center;gap:8px" onclick="toggleMobileMenu()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      חיפוש באתר
    </a>
    <button id="mof-mobile-auth-btn" class="btn-filled" style="text-align:center;width:100%;font-family:inherit;cursor:pointer;border:none" onclick="mofOpenAuth();toggleMobileMenu()">
      <span id="mof-mobile-auth-label">התחברות / הרשמה</span>
    </button>
    <a href="/biz-register" class="btn-outline" style="text-align:center">הצטרפות כעסק</a>
  </div>
</div>
`;

// ── FOOTER HTML ──
const FOOTER_HTML = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-brand-row">
          <img src="/logo.png" alt="אופקים שלי" class="footer-logo-img" onerror="this.style.display='none'">
          <div class="brand-mark">אופקים <span class="accent">שלי</span></div>
        </div>
        <p>הפלטפורמה הקהילתית של העיר אופקים. מקור מהימן אחד לכל מה שקורה בעיר.</p>
        <div class="footer-social">
          <a href="https://wa.me/972542338233" target="_blank" rel="noopener" aria-label="WhatsApp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
          </a>
          <a href="https://facebook.com/myofaqim" target="_blank" rel="noopener" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://instagram.com/myofaqim" target="_blank" rel="noopener" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://t.me/myofaqim" target="_blank" rel="noopener" aria-label="Telegram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <h5>עסקים ושירותים</h5>
        <ul>
          <li><a href="/businesses">אלפון עסקים</a></li>
          <li><a href="/professionals">בעלי מקצוע</a></li>
          <li><a href="/deals">קופונים והטבות</a></li>
          <li><a href="/realestate">נדל"ן</a></li>
          <li><a href="/jobs">דרושים</a></li>
          <li><a href="/biz-register">הצטרפות עסק</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h5>יהדות וקהילה</h5>
        <ul>
          <li><a href="/zmanim">זמני תפילה</a></li>
          <li><a href="/synagogues">בתי כנסת</a></li>
          <li><a href="/mikvaot">מקוואות</a></li>
          <li><a href="/religious-services">שירותי דת</a></li>
          <li><a href="/forum">פורום</a></li>
          <li><a href="/community-events">אירועים</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h5>מידע ועירייה</h5>
        <ul>
          <li><a href="/news">חדשות העיר</a></li>
          <li><a href="/public-services?cat=municipal">אלפון עירייה</a></li>
          <li><a href="/public-services?cat=transport">תחבורה</a></li>
          <li><a href="/public-services?cat=health">קופות חולים</a></li>
          <li><a href="/public-services?cat=mail_bank">בנקים ודואר</a></li>
          <li><a href="/public-services?cat=emergency">חירום</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h5>צור קשר</h5>
        <div class="footer-contact">
          <a href="tel:0542338233">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.58 2.18 2 2 0 012.55 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.5a16 16 0 006.59 6.59l.88-.88a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            054-233-8233
          </a>
          <a href="https://wa.me/972542338233" target="_blank" rel="noopener">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/></svg>
            WhatsApp
          </a>
          <a href="mailto:hello@myofaqim.co.il">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            hello@myofaqim.co.il
          </a>
          <a href="/contact" style="margin-top:6px;color:var(--gold);font-weight:600">טופס יצירת קשר ←</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div>© 2026 MyOfaqim.co.il · כל הזכויות שמורות</div>
      <div class="legal">
        <a href="/about">אודות</a>
        <a href="/privacy">מדיניות פרטיות</a>
        <a href="/terms">תנאי שימוש</a>
        <a href="/accessibility">הצהרת נגישות</a>
      </div>
    </div>
  </div>
</footer>
`;

// ── SHABBAT MODE HTML ──
const SHABBAT_HTML = `
<div class="shabbat-mode" id="shabbat-mode" aria-hidden="true">
  <div class="shabbat-stars" id="shabbat-stars"></div>
  <div class="shabbat-content">
    <div class="shabbat-frame">
      <div class="shabbat-greeting">אופקים שלי · MyOfaqim.co.il</div>
      <h1 class="shabbat-title">
        שבת שלום
        <em id="shabbat-or-chag">ומבורכת</em>
      </h1>
      <div class="shabbat-divider"></div>
      <p class="shabbat-verse">
        "וַיְבָרֶךְ אֱלֹהִים אֶת יוֹם הַשְּׁבִיעִי וַיְקַדֵּשׁ אֹתוֹ"
        <span class="shabbat-verse-source">— בראשית ב', ג'</span>
      </p>
      <div class="shabbat-info">
        <div class="shabbat-info-item">
          <div class="shabbat-info-lbl">כניסת שבת</div>
          <div class="shabbat-info-val" id="sh-mode-in">—</div>
        </div>
        <div class="shabbat-info-item">
          <div class="shabbat-info-lbl">צאת שבת</div>
          <div class="shabbat-info-val" id="sh-mode-out">—</div>
        </div>
      </div>
      <p class="shabbat-message">
        האתר סגור לכבוד שבת קודש.<br>
        ניפגש במוצאי השבת לעדכונים, חדשות וכל מה שקורה בעיר.
      </p>
      <div class="shabbat-bottom">לכבוד שבת מלכתא</div>
    </div>
  </div>
</div>
`;

// ── Minimal header/footer for signup/payment pages (Coming Soon mode) ──
const MINIMAL_HEADER_HTML = `
<header class="minimal-header">
  <div class="minimal-header-inner">
    <a href="/" class="minimal-brand">
      <img src="/logo.png" alt="אופקים שלי" class="minimal-brand-img" onerror="this.style.display='none'">
      <div class="minimal-brand-text">
        <span class="minimal-brand-name">אופקים <span class="blue">שלי</span></span>
        <span class="minimal-brand-sub">MyOfaqim.co.il</span>
      </div>
    </a>
    <div class="minimal-contact">
      <a href="tel:0542338233" dir="ltr">054-233-8233</a>
      <a href="https://wa.me/972542338233" target="_blank" rel="noopener" class="minimal-wa">WhatsApp</a>
    </div>
  </div>
</header>
<style>
  .minimal-header {
    background: var(--paper);
    border-bottom: 1px solid var(--line);
    padding: 16px 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .minimal-header-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .minimal-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
  }
  .minimal-brand-img {
    height: 44px;
    width: auto;
  }
  .minimal-brand-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .minimal-brand-name {
    font-family: var(--brand);
    font-weight: 900;
    font-size: 22px;
    color: var(--navy);
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .minimal-brand-name .blue { color: var(--blue); }
  .minimal-brand-sub {
    font-size: 10px;
    color: var(--blue);
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 700;
    direction: ltr;
  }
  .minimal-contact {
    display: flex;
    gap: 14px;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
  }
  .minimal-contact a {
    color: var(--navy);
    text-decoration: none;
    transition: color .15s;
  }
  .minimal-contact a:hover { color: var(--blue); }
  .minimal-wa {
    padding: 8px 16px;
    background: var(--blue);
    color: #fff !important;
    border-radius: 6px;
    font-weight: 700;
  }
  .minimal-wa:hover { background: var(--navy); }
  @media (max-width: 560px) {
    .minimal-brand-img { height: 36px; }
    .minimal-brand-name { font-size: 18px; }
    .minimal-brand-sub { font-size: 9px; letter-spacing: 1.5px; }
    .minimal-contact { gap: 8px; font-size: 12px; }
    .minimal-wa { padding: 6px 12px; }
  }
</style>
`;

const MINIMAL_FOOTER_HTML = `
<footer class="minimal-footer">
  <div class="minimal-footer-inner">
    © 2026 MyOfaqim.co.il · כל הזכויות שמורות ·
    <a href="tel:0542338233" dir="ltr">054-233-8233</a> ·
    <a href="https://wa.me/972542338233" target="_blank" rel="noopener">WhatsApp</a>
  </div>
</footer>
<style>
  .minimal-footer {
    background: var(--cream);
    border-top: 1px solid var(--line);
    padding: 24px 20px;
    margin-top: 40px;
    text-align: center;
  }
  .minimal-footer-inner {
    font-size: 13px;
    color: var(--ink-mute);
    line-height: 1.8;
  }
  .minimal-footer a {
    color: var(--blue);
    font-weight: 700;
    text-decoration: none;
  }
  .minimal-footer a:hover { color: var(--navy); }
</style>
`;

// ── Inject header/footer ──
function injectChrome() {
  const hp = document.getElementById('header-placeholder');
  const fp = document.getElementById('footer-placeholder');

  // Detect minimal mode (signup pages during Coming Soon)
  const isMinimal = document.body.classList.contains('minimal-chrome');

  if (hp) hp.outerHTML = isMinimal ? MINIMAL_HEADER_HTML : HEADER_HTML;
  if (fp) fp.outerHTML = isMinimal ? MINIMAL_FOOTER_HTML : FOOTER_HTML;

  // הוסף את ה-shabbat mode בסוף ה-body (גם במצב minimal)
  if (!document.getElementById('shabbat-mode')) {
    document.body.insertAdjacentHTML('beforeend', SHABBAT_HTML);
  }
}

// ── Mobile menu ──
function toggleMobileMenu() {
  const d = document.getElementById('mobile-drawer');
  const o = document.getElementById('mobile-overlay');
  if (d) d.classList.toggle('open');
  if (o) o.classList.toggle('active');
}
function toggleSearch() {
  window.location.href = '/search';
}

// ── Live Clock ──
function updateLiveClock() {
  // ── Smart TopBar Clock ──
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');

  // שעון
  const tbTime = document.getElementById('tb-time');
  if (tbTime) tbTime.textContent = `${h}:${m}:${s}`;

  // תאריך עברי
  const tbDate = document.getElementById('tb-date');
  if (tbDate) {
    const dateStr = `יום ${HE_DAYS[now.getDay()]}, ${now.getDate()} ב${HE_MONTHS[now.getMonth()]}`;
    tbDate.textContent = dateStr;
  }

  // ברכה לפי שעה
  updateSmartGreeting(now.getHours());

  // תאימות לישן
  const el = document.getElementById('live-clock');
  if (el) el.textContent = `${h}:${m}:${s}`;
}

// ── Smart Greeting לפי שעה ──
function updateSmartGreeting(hour) {
  const greetingEl = document.getElementById('tb-greeting');
  const iconEl = document.getElementById('tb-icon');
  if (!greetingEl) return;

  // שם המשתמש מ-localStorage
  let name = '';
  try {
    const saved = localStorage.getItem('user_name') || localStorage.getItem('sb_user_name') || '';
    name = saved.trim().split(' ')[0]; // שם פרטי בלבד
  } catch {}

  // אייקוני SVG (לא תלויים באימוג'ים של המכשיר)
  const SUN_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="6.34" y1="17.66" x2="4.93" y2="19.07"/><line x1="19.07" y1="4.93" x2="17.66" y2="6.34"/></svg>';
  const SUNRISE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>';
  const SUNSET_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="16 5 12 9 8 5"/></svg>';
  const MOON_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  let greeting, icon;
  if (hour >= 5 && hour < 12) {
    greeting = 'בוקר טוב';
    icon = SUNRISE_SVG;
  } else if (hour >= 12 && hour < 15) {
    greeting = 'צהריים טובים';
    icon = SUN_SVG;
  } else if (hour >= 15 && hour < 19) {
    greeting = 'אחר הצהריים';
    icon = SUN_SVG;
  } else if (hour >= 19 && hour < 22) {
    greeting = 'ערב טוב';
    icon = SUNSET_SVG;
  } else {
    greeting = 'לילה טוב';
    icon = MOON_SVG;
  }

  const nameHtml = name
    ? `, <span class="name-highlight">${name}</span>`
    : '';

  greetingEl.innerHTML = `${greeting}${nameHtml}`;
  if (iconEl) iconEl.innerHTML = icon;
}

// ── Hebrew date (legacy) ──
function setDateHeader() {
  const now = new Date();
  const dateStr = `יום ${HE_DAYS[now.getDay()]}, ${now.getDate()} ב${HE_MONTHS[now.getMonth()]}`;
  const el = document.getElementById('hebrew-date');
  if (el) el.textContent = dateStr;
}

// ── מזג אוויר - Open-Meteo (חינם, ללא API key) ──
// קואורדינטות אופקים: 31.3100° N, 34.6200° E
async function fetchOfaqimWeather() {
  const WEATHER_CODES = {
    0: ['שמיים בהירים', 'sunny'],
    1: ['בעיקר בהיר', 'sunny'],
    2: ['מעונן חלקית', 'partly'],
    3: ['מעונן', 'cloudy'],
    45: ['ערפל', 'fog'],
    48: ['ערפל', 'fog'],
    51: ['גשם קל', 'rain'],
    53: ['גשם', 'rain'],
    55: ['גשם חזק', 'rain'],
    61: ['גשם קל', 'rain'],
    63: ['גשם', 'rain'],
    65: ['גשם חזק', 'rain'],
    71: ['שלג קל', 'snow'],
    73: ['שלג', 'snow'],
    75: ['שלג חזק', 'snow'],
    80: ['גשמים', 'rain'],
    81: ['גשמים', 'rain'],
    82: ['גשמים חזקים', 'rain'],
    95: ['סערה', 'storm'],
    96: ['סערה עם ברד', 'storm'],
    99: ['סערה חזקה', 'storm'],
  };

  const WEATHER_ICONS = {
    sunny: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    partly: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
    cloudy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
    rain: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`,
    fog: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="3" y1="20" x2="21" y2="20"/></svg>`,
    snow: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/></svg>`,
    storm: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>`,
  };

  try {
    const CACHE_KEY = 'ofaqim_weather';
    const CACHE_TTL = 30 * 60 * 1000; // 30 דקות

    // בדוק cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      if (cached.ts && Date.now() - cached.ts < CACHE_TTL && cached.temp !== undefined) {
        applyWeather(cached, WEATHER_CODES, WEATHER_ICONS);
        return;
      }
    } catch {}

    const url = 'https://api.open-meteo.com/v1/forecast?latitude=31.31&longitude=34.62&current=temperature_2m,weather_code&timezone=Asia/Jerusalem';
    const res = await fetch(url);
    const data = await res.json();

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    const weatherData = { temp, code, ts: Date.now() };

    try { localStorage.setItem(CACHE_KEY, JSON.stringify(weatherData)); } catch {}

    applyWeather(weatherData, WEATHER_CODES, WEATHER_ICONS);
  } catch (err) {
    // שגיאה שקטה - לא מציג כלום
    const wb = document.getElementById('tb-weather');
    if (wb) wb.style.display = 'none';
  }
}

function applyWeather(data, WEATHER_CODES, WEATHER_ICONS) {
  const info = WEATHER_CODES[data.code] || ['אופקים', 'sunny'];
  const desc = info[0];
  const type = info[1];

  const tempEl = document.getElementById('tb-temp');
  const descEl = document.getElementById('tb-desc');
  const iconEl = document.getElementById('tb-wicon');

  if (tempEl) tempEl.textContent = `${data.temp}°`;
  if (descEl) descEl.textContent = desc;
  if (iconEl) iconEl.innerHTML = WEATHER_ICONS[type] || WEATHER_ICONS.sunny;
}

// ── Format time ──
function fmtTimeStr(s) {
  if (!s) return '—';
  if (/^\d{1,2}:\d{2}$/.test(s)) return s;
  try {
    const d = new Date(s);
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  } catch { return s; }
}

// ── Shabbat detection ──
let shabbatTimes = null;

function generateStars() {
  const container = document.getElementById('shabbat-stars');
  if (!container) return;
  let html = '';
  for (let i = 0; i < 80; i++) {
    const size = (Math.random() * 2 + 1).toFixed(1);
    const top = (Math.random() * 100).toFixed(1);
    const left = (Math.random() * 100).toFixed(1);
    const delay = (Math.random() * 3).toFixed(2);
    html += `<div class="star" style="width:${size}px;height:${size}px;top:${top}%;left:${left}%;animation-delay:${delay}s"></div>`;
  }
  container.innerHTML = html;
}

function isInShabbat() {
  if (!shabbatTimes || !shabbatTimes.candles || !shabbatTimes.havdalah) return false;
  const now = new Date();
  const candles = new Date(shabbatTimes.candles);
  const havdalah = new Date(shabbatTimes.havdalah);
  return now >= candles && now < havdalah;
}

function checkAndApplyShabbat() {
  if (isInShabbat()) {
    const modal = document.getElementById('shabbat-mode');
    if (modal && !modal.classList.contains('active')) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const inEl = document.getElementById('sh-mode-in');
      const outEl = document.getElementById('sh-mode-out');
      if (inEl) inEl.textContent = fmtTimeStr(shabbatTimes.candles);
      if (outEl) outEl.textContent = fmtTimeStr(shabbatTimes.havdalah);
      if (shabbatTimes.is_chag) {
        const eEl = document.getElementById('shabbat-or-chag');
        if (eEl) eEl.textContent = 'וחג שמח';
      }
      generateStars();
    }
  }
}

async function loadShabbatTimes() {
  try {
    const res = await fetch('/.netlify/functions/zmanim');
    if (!res.ok) return;
    const data = await res.json();
    const T = data.times || {};

    if (T.candle_lighting || T.shabbat_end) {
      // המרה ל-ISO על בסיס יום שישי הקרוב
      const today = new Date();
      const dow = today.getDay();
      const fridayOffset = (5 - dow + 7) % 7;
      const friday = new Date(today);
      friday.setDate(today.getDate() + fridayOffset);
      const saturday = new Date(friday);
      saturday.setDate(friday.getDate() + 1);

      function buildDate(dateObj, hhmm) {
        if (!hhmm) return null;
        const [h, m] = hhmm.split(':').map(Number);
        const d = new Date(dateObj);
        d.setHours(h, m, 0, 0);
        return d.toISOString();
      }

      shabbatTimes = {
        candles: buildDate(friday, T.candle_lighting),
        havdalah: buildDate(saturday, T.shabbat_end),
        is_chag: false
      };

      const hdr = document.getElementById('shabbat-times-hdr');
      if (hdr && T.candle_lighting) {
        hdr.textContent = 'כניסת שבת ' + T.candle_lighting;
      }

      checkAndApplyShabbat();
      setInterval(checkAndApplyShabbat, 60000);
    }
  } catch(e) { console.warn('[shabbat]', e); }
}

// ── Preview mode (?shabbat=1) ──
function checkShabbatPreview() {
  if (new URLSearchParams(window.location.search).get('shabbat') === '1') {
    shabbatTimes = {
      candles: new Date(Date.now() - 60000).toISOString(),
      havdalah: new Date(Date.now() + 86400000).toISOString(),
      is_chag: false
    };
    setTimeout(() => {
      const modal = document.getElementById('shabbat-mode');
      const inEl = document.getElementById('sh-mode-in');
      const outEl = document.getElementById('sh-mode-out');
      if (inEl) inEl.textContent = '17:30';
      if (outEl) outEl.textContent = '18:45';
      if (modal) {
        modal.classList.add('active');
        generateStars();
        document.body.style.overflow = 'hidden';
      }
    }, 100);
    return true;
  }
  return false;
}

// ── Init ──
function siteInit() {
  injectChrome();
  setDateHeader();
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // Smart TopBar: ברכה + מזג אוויר
  updateSmartGreeting(new Date().getHours());
  fetchOfaqimWeather();

  if (!checkShabbatPreview()) {
    loadShabbatTimes();
  }
}

// Expose globally
window.toggleMobileMenu = toggleMobileMenu;
window.toggleSearch = toggleSearch;
window.SB_URL = SB_URL;
window.SB_KEY = SB_KEY;
window.esc = esc;
window.fmt = fmt;
window.$ = $;
window.fmtTimeStr = fmtTimeStr;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', siteInit);
} else {
  siteInit();
}

/* ════════════════════════════════════════════════════
   ווידג'ט נגישות - WCAG 2.1 AA
   ════════════════════════════════════════════════════ */

const A11Y_CSS = `
<style id="a11y-widget-styles">
  .a11y-btn {
    position: fixed;
    bottom: 80px;
    left: 16px;
    z-index: 9998;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #1A2E5C;
    color: #fff;
    border: 3px solid #fff;
    box-shadow: 0 6px 20px rgba(26, 46, 92, 0.35);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .a11y-btn:hover { transform: scale(1.05); }
  .a11y-btn:focus-visible { outline: 3px solid #F59E0B; outline-offset: 3px; }

  .a11y-panel {
    position: fixed;
    bottom: 140px;
    left: 16px;
    z-index: 9999;
    width: 300px;
    max-width: calc(100vw - 32px);
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
    padding: 16px;
    display: none;
    font-family: 'Heebo', sans-serif;
    direction: rtl;
  }
  .a11y-panel.open { display: block; animation: a11ySlideUp 0.25s ease-out; }
  @keyframes a11ySlideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .a11y-panel h3 {
    font-size: 15px;
    color: #1A2E5C;
    margin: 0 0 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 900;
  }
  .a11y-close {
    background: #F5F5F0;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4A4A4A;
  }
  .a11y-close:hover { background: #E5E7EB; }

  .a11y-section {
    margin-bottom: 12px;
  }
  .a11y-label {
    font-size: 11px;
    color: #8A8A8A;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .a11y-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  .a11y-buttons.three { grid-template-columns: repeat(3, 1fr); }
  .a11y-buttons button {
    padding: 8px 10px;
    background: #F5F5F0;
    border: 1.5px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    color: #1A2E5C;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.15s;
  }
  .a11y-buttons button:hover { background: #fff; border-color: #2563EB; }
  .a11y-buttons button.active {
    background: #1A2E5C;
    color: #fff;
    border-color: #1A2E5C;
  }
  .a11y-reset {
    width: 100%;
    padding: 10px;
    background: #F59E0B;
    color: #1A2E5C;
    border: none;
    border-radius: 10px;
    font-weight: 800;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    margin-top: 4px;
  }
  .a11y-reset:hover { background: #D97706; color: #fff; }

  .a11y-link {
    display: block;
    text-align: center;
    margin-top: 10px;
    font-size: 11px;
    color: #2563EB;
    text-decoration: none;
    font-weight: 700;
  }

  /* ─── מצבי נגישות ─── */
  html.a11y-font-large { font-size: 18px; }
  html.a11y-font-xlarge { font-size: 21px; }

  html.a11y-high-contrast body { background: #000 !important; }
  html.a11y-high-contrast body * {
    background-color: #000 !important;
    color: #FFEB3B !important;
    border-color: #FFEB3B !important;
  }
  html.a11y-high-contrast a,
  html.a11y-high-contrast button { color: #FFEB3B !important; }
  html.a11y-high-contrast img,
  html.a11y-high-contrast svg { filter: grayscale(1) contrast(1.5) !important; }

  html.a11y-invert {
    filter: invert(1) hue-rotate(180deg);
  }
  html.a11y-invert img,
  html.a11y-invert video { filter: invert(1) hue-rotate(180deg); }

  html.a11y-highlight-links a {
    background: #FFEB3B !important;
    color: #000 !important;
    text-decoration: underline !important;
    padding: 2px 4px !important;
    border-radius: 3px;
  }

  html.a11y-no-animations *,
  html.a11y-no-animations *::before,
  html.a11y-no-animations *::after {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }

  html.a11y-readable * {
    font-family: Arial, sans-serif !important;
    letter-spacing: 0.1em !important;
    line-height: 1.8 !important;
  }

  /* Skip to content link - חובה לפי תקנות */
  .skip-to-content {
    position: absolute;
    top: -100px;
    right: 0;
    background: #F59E0B;
    color: #1A2E5C;
    padding: 12px 20px;
    font-weight: 900;
    text-decoration: none;
    z-index: 10000;
    border-radius: 0 0 8px 0;
  }
  .skip-to-content:focus {
    top: 0;
    outline: 3px solid #1A2E5C;
  }

  @media (max-width: 480px) {
    .a11y-btn { width: 44px; height: 44px; bottom: 70px; left: 12px; }
    .a11y-panel { bottom: 122px; left: 12px; }
  }
</style>
`;

function buildA11yWidget() {
  // אל תכפיל אם כבר קיים
  if (document.getElementById('a11y-widget-styles')) return;

  // הוסף CSS
  document.head.insertAdjacentHTML('beforeend', A11Y_CSS);

  // הוסף "דלג לתוכן" (חובה לפי תקנות)
  if (!document.querySelector('.skip-to-content')) {
    const skip = document.createElement('a');
    skip.href = '#main-content';
    skip.className = 'skip-to-content';
    skip.textContent = 'דלג לתוכן הראשי';
    document.body.insertBefore(skip, document.body.firstChild);
  }

  // הוסף את הכפתור
  const btn = document.createElement('button');
  btn.className = 'a11y-btn';
  btn.setAttribute('aria-label', 'פתח אפשרויות נגישות');
  btn.setAttribute('title', 'נגישות');
  btn.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="4" r="2"/>
    <path d="M19 13V8.5L12 6 5 8.5V13"/>
    <path d="M12 13v8"/>
    <path d="M9 21l3-3 3 3"/>
  </svg>`;
  document.body.appendChild(btn);

  // הוסף את הפאנל
  const panel = document.createElement('div');
  panel.className = 'a11y-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'אפשרויות נגישות');
  panel.innerHTML = `
    <h3>
      <span>אפשרויות נגישות</span>
      <button class="a11y-close" aria-label="סגור">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </h3>

    <div class="a11y-section">
      <div class="a11y-label">גודל טקסט</div>
      <div class="a11y-buttons three">
        <button data-action="font" data-value="normal">רגיל</button>
        <button data-action="font" data-value="large">גדול</button>
        <button data-action="font" data-value="xlarge">ענק</button>
      </div>
    </div>

    <div class="a11y-section">
      <div class="a11y-label">ניגודיות וצבע</div>
      <div class="a11y-buttons">
        <button data-action="contrast">ניגודיות גבוהה</button>
        <button data-action="invert">היפוך צבעים</button>
      </div>
    </div>

    <div class="a11y-section">
      <div class="a11y-label">אפשרויות נוספות</div>
      <div class="a11y-buttons">
        <button data-action="links">הדגש קישורים</button>
        <button data-action="animations">בטל אנימציות</button>
        <button data-action="readable">פונט קריא</button>
      </div>
    </div>

    <button class="a11y-reset">איפוס כל ההגדרות</button>

    <a href="/accessibility" class="a11y-link">למידע נוסף על נגישות</a>
  `;
  document.body.appendChild(panel);

  // ─── אירועים ───
  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  panel.querySelector('.a11y-close').addEventListener('click', () => {
    panel.classList.remove('open');
  });

  // סגירה בלחיצה מחוץ
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.remove('open');
    }
  });

  // טיפול בכפתורים
  panel.querySelectorAll('[data-action]').forEach(b => {
    b.addEventListener('click', () => {
      const action = b.dataset.action;
      const value = b.dataset.value;
      const html = document.documentElement;

      if (action === 'font') {
        html.classList.remove('a11y-font-large', 'a11y-font-xlarge');
        if (value === 'large') html.classList.add('a11y-font-large');
        if (value === 'xlarge') html.classList.add('a11y-font-xlarge');
        panel.querySelectorAll('[data-action="font"]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        saveA11ySettings();
      } else {
        const cls = `a11y-${action}` === 'a11y-contrast' ? 'a11y-high-contrast' :
                    `a11y-${action}` === 'a11y-animations' ? 'a11y-no-animations' :
                    `a11y-${action}` === 'a11y-links' ? 'a11y-highlight-links' :
                    `a11y-${action}`;
        html.classList.toggle(cls);
        b.classList.toggle('active');
        saveA11ySettings();
      }
    });
  });

  // איפוס
  panel.querySelector('.a11y-reset').addEventListener('click', () => {
    document.documentElement.className = '';
    panel.querySelectorAll('.active').forEach(x => x.classList.remove('active'));
    try { localStorage.removeItem('a11y-settings'); } catch {}
  });

  // שמירה ב-localStorage
  function saveA11ySettings() {
    try {
      const settings = {
        classes: Array.from(document.documentElement.classList).filter(c => c.startsWith('a11y-'))
      };
      localStorage.setItem('a11y-settings', JSON.stringify(settings));
    } catch {}
  }

  // טעינת הגדרות שמורות
  try {
    const saved = JSON.parse(localStorage.getItem('a11y-settings') || '{}');
    if (saved.classes && Array.isArray(saved.classes)) {
      saved.classes.forEach(c => {
        document.documentElement.classList.add(c);
        // סמן כפתורים פעילים
        if (c === 'a11y-font-large') panel.querySelector('[data-value="large"]')?.classList.add('active');
        else if (c === 'a11y-font-xlarge') panel.querySelector('[data-value="xlarge"]')?.classList.add('active');
        else if (c === 'a11y-high-contrast') panel.querySelector('[data-action="contrast"]')?.classList.add('active');
        else if (c === 'a11y-invert') panel.querySelector('[data-action="invert"]')?.classList.add('active');
        else if (c === 'a11y-highlight-links') panel.querySelector('[data-action="links"]')?.classList.add('active');
        else if (c === 'a11y-no-animations') panel.querySelector('[data-action="animations"]')?.classList.add('active');
        else if (c === 'a11y-readable') panel.querySelector('[data-action="readable"]')?.classList.add('active');
      });
    }
  } catch {}
}

// טען את הווידג'ט אחרי שהדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildA11yWidget);
} else {
  buildA11yWidget();
}

/* ════════════════════════════════════════════════════
   PWA - Service Worker Registration
   ════════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] Service Worker מוטמע'))
      .catch(err => console.warn('[PWA] שגיאה ברישום SW:', err));
  });
}

/* ════════════════════════════════════════════════════
   PWA - "הוסף למסך הבית" - באנר מותאם
   ════════════════════════════════════════════════════ */
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // מנע את ה-prompt האוטומטי
  e.preventDefault();
  deferredPrompt = e;

  // הראה את הבאנר רק אם המשתמש כבר 30 שניות באתר
  setTimeout(showInstallBanner, 30000);
});

function showInstallBanner() {
  if (!deferredPrompt) return;
  if (localStorage.getItem('pwa-install-dismissed')) return;

  // אל תציג בדפי אדמין
  if (location.pathname.startsWith('/admin')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.innerHTML = `
    <style>
      #pwa-install-banner {
        position: fixed;
        bottom: 80px;
        right: 16px;
        z-index: 9999;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 12px 32px rgba(26, 46, 92, 0.2);
        padding: 14px;
        max-width: 320px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: pwaSlide 0.4s ease-out;
        border: 1.5px solid #2563EB;
      }
      @keyframes pwaSlide {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #pwa-install-banner .pwa-icon {
        width: 44px; height: 44px; background: #1A2E5C;
        border-radius: 10px; display: flex; align-items: center;
        justify-content: center; flex-shrink: 0; color: #F59E0B;
      }
      #pwa-install-banner .pwa-text { flex: 1; }
      #pwa-install-banner .pwa-text strong {
        display: block; color: #1A2E5C; font-size: 13px;
        font-weight: 900; margin-bottom: 2px;
      }
      #pwa-install-banner .pwa-text small {
        color: #4A4A4A; font-size: 11px; line-height: 1.4;
      }
      #pwa-install-banner .pwa-actions {
        display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;
      }
      #pwa-install-banner button {
        padding: 6px 12px; border-radius: 8px; border: none;
        font-family: inherit; font-weight: 800; font-size: 11px;
        cursor: pointer; white-space: nowrap;
      }
      #pwa-install-banner .install { background: #F59E0B; color: #1A2E5C; }
      #pwa-install-banner .dismiss { background: transparent; color: #8A8A8A; }
      @media (max-width: 480px) {
        #pwa-install-banner { right: 8px; left: 8px; max-width: none; bottom: 76px; }
      }
    </style>
    <div class="pwa-icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 8h14M5 8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/>
        <line x1="10" y1="12" x2="14" y2="12"/>
      </svg>
    </div>
    <div class="pwa-text">
      <strong>הוסף למסך הבית</strong>
      <small>גישה מהירה לאופקים שלי בלחיצה אחת</small>
    </div>
    <div class="pwa-actions">
      <button class="install" onclick="installPwa()">התקן</button>
      <button class="dismiss" onclick="dismissPwa()">לא עכשיו</button>
    </div>
  `;
  document.body.appendChild(banner);
}

window.installPwa = async function() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    console.log('[PWA] משתמש התקין את האפליקציה');
  }
  deferredPrompt = null;
  document.getElementById('pwa-install-banner')?.remove();
};

window.dismissPwa = function() {
  try { localStorage.setItem('pwa-install-dismissed', '1'); } catch {}
  document.getElementById('pwa-install-banner')?.remove();
};

/* ════════════════════════════════════════════════════════════
   Auth Modal + Login Button
   ════════════════════════════════════════════════════════════ */

function mofInjectAuthModal() {
  if (document.getElementById('mof-auth-modal')) return;

  const modalHtml = `
    <style id="mof-auth-modal-style">
      #mof-auth-modal {
        position: fixed !important;
        inset: 0 !important;
        z-index: 99999 !important;
        background: rgba(15, 30, 61, 0.7) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        display: none !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
        font-family: 'Heebo', sans-serif !important;
      }
      #mof-auth-modal.open { display: flex !important; animation: mofFadeIn 0.2s ease-out !important; }
      @keyframes mofFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes mofSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

      #mof-auth-card {
        background: #fff !important;
        border-radius: 24px !important;
        max-width: 420px !important;
        width: 100% !important;
        padding: 32px 28px !important;
        position: relative !important;
        box-shadow: 0 24px 60px rgba(0,0,0,0.3) !important;
        direction: rtl !important;
        text-align: center !important;
        animation: mofSlideUp 0.3s ease-out !important;
      }

      #mof-auth-close {
        position: absolute !important;
        top: 14px !important;
        left: 14px !important;
        width: 32px !important;
        height: 32px !important;
        border-radius: 50% !important;
        background: #F5F5F0 !important;
        border: none !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #4A4A4A !important;
        font-size: 18px !important;
      }
      #mof-auth-close:hover { background: #E5E7EB !important; }

      .mof-auth-logo {
        width: 64px !important;
        height: 64px !important;
        margin: 0 auto 16px !important;
        background: linear-gradient(135deg, #1A2E5C 0%, #2563EB 100%) !important;
        border-radius: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #F59E0B !important;
      }

      #mof-auth-card h3 {
        font-size: 22px !important;
        font-weight: 900 !important;
        color: #1A2E5C !important;
        margin: 0 0 8px !important;
        letter-spacing: -0.02em !important;
      }
      #mof-auth-card .subtitle {
        color: #4A4A4A !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        margin: 0 0 24px !important;
      }

      #mof-google-btn {
        width: 100% !important;
        padding: 14px 20px !important;
        background: #fff !important;
        border: 1.5px solid #E5E7EB !important;
        border-radius: 14px !important;
        font-family: inherit !important;
        font-weight: 700 !important;
        font-size: 15px !important;
        color: #1A2E5C !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 10px !important;
        transition: all 0.15s !important;
        margin-bottom: 16px !important;
      }
      #mof-google-btn:hover { border-color: #2563EB !important; transform: translateY(-1px) !important; box-shadow: 0 6px 16px rgba(26, 46, 92, 0.1) !important; }

      .mof-divider {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        margin: 20px 0 !important;
        color: #8A8A8A !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        letter-spacing: 1px !important;
      }
      .mof-divider::before, .mof-divider::after {
        content: '' !important;
        flex: 1 !important;
        height: 1px !important;
        background: #E5E7EB !important;
      }

      .mof-newsletter-link {
        display: block !important;
        padding: 12px 16px !important;
        background: #F5F5F0 !important;
        border-radius: 12px !important;
        color: #1A2E5C !important;
        text-decoration: none !important;
        font-weight: 700 !important;
        font-size: 14px !important;
        transition: background 0.15s !important;
      }
      .mof-newsletter-link:hover { background: #E5E7EB !important; }
      .mof-newsletter-link small { display: block !important; font-weight: 500 !important; color: #4A4A4A !important; font-size: 12px !important; margin-top: 2px !important; }

      .mof-terms {
        color: #8A8A8A !important;
        font-size: 11px !important;
        line-height: 1.6 !important;
        margin: 16px 0 0 !important;
      }
      .mof-terms a { color: #2563EB !important; font-weight: 700 !important; }

      /* ── מצב מחובר ── */
      #mof-auth-card.logged-in .login-only { display: none !important; }
      #mof-auth-card:not(.logged-in) .logout-only { display: none !important; }

      .mof-user-info {
        display: flex !important;
        align-items: center !important;
        gap: 14px !important;
        background: #F5F5F0 !important;
        border-radius: 16px !important;
        padding: 16px !important;
        margin-bottom: 16px !important;
        text-align: right !important;
      }
      .mof-user-avatar {
        width: 56px !important; height: 56px !important;
        border-radius: 50% !important;
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
        color: #1A2E5C !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        font-size: 22px !important; font-weight: 900 !important;
        flex-shrink: 0 !important;
        overflow: hidden !important;
      }
      .mof-user-avatar img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
      .mof-user-details { flex: 1 !important; min-width: 0 !important; }
      .mof-user-name { font-size: 16px !important; font-weight: 900 !important; color: #1A2E5C !important; line-height: 1.2 !important; margin-bottom: 2px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
      .mof-user-email { font-size: 12px !important; color: #4A4A4A !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }

      #mof-logout-btn {
        width: 100% !important; padding: 12px 20px !important;
        background: #fff !important; border: 1.5px solid #DC2626 !important;
        border-radius: 12px !important; cursor: pointer !important;
        font-family: inherit !important; font-weight: 800 !important; font-size: 14px !important;
        color: #DC2626 !important;
      }
      #mof-logout-btn:hover { background: #DC2626 !important; color: #fff !important; }

      /* ── כפתור Auth ב-Header (אווטר) ── */
      #mof-auth-avatar {
        width: 26px !important; height: 26px !important;
        border-radius: 50% !important;
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
        color: #1A2E5C !important;
        font-size: 12px !important; font-weight: 900 !important;
        display: inline-flex !important; align-items: center !important; justify-content: center !important;
        overflow: hidden !important;
      }
      #mof-auth-avatar img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
    </style>

    <div id="mof-auth-modal" onclick="if(event.target.id==='mof-auth-modal') mofCloseAuth()">
      <div id="mof-auth-card">
        <button id="mof-auth-close" onclick="mofCloseAuth()" aria-label="סגור">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <!-- מצב לא מחובר -->
        <div class="login-only">
          <div class="mof-auth-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3>ברוכים הבאים</h3>
          <p class="subtitle">התחברו לפלטפורמה של אופקים שלי כדי לכתוב בפורום, לשמור עסקים מועדפים ולעקוב אחר קופונים</p>

          <button id="mof-google-btn" onclick="mofLoginGoogle()">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            המשך עם Google
          </button>

          <div class="mof-divider">או</div>

          <a href="/subscribe" class="mof-newsletter-link" onclick="mofCloseAuth()">
            הירשמו לניוזלטר חינם
            <small>קבלו עדכונים על קופונים וחדשות העיר</small>
          </a>

          <p class="mof-terms">
            המשך משמעו הסכמה ל<a href="/terms">תקנון</a> ול<a href="/privacy">מדיניות הפרטיות</a>
          </p>
        </div>

        <!-- מצב מחובר -->
        <div class="logout-only">
          <h3 style="margin-bottom:18px;">החשבון שלי</h3>
          <div class="mof-user-info">
            <div class="mof-user-avatar" id="mof-modal-avatar">?</div>
            <div class="mof-user-details">
              <div class="mof-user-name" id="mof-modal-name">משתמש</div>
              <div class="mof-user-email" id="mof-modal-email"></div>
            </div>
          </div>
          <a href="/favorites" class="mof-newsletter-link" onclick="mofCloseAuth()" style="margin-bottom:10px">
            המועדפים שלי
            <small>עסקים, קופונים, פוסטים והתראות</small>
          </a>
          <a href="/biz-dashboard" class="mof-newsletter-link" onclick="mofCloseAuth()" style="margin-bottom:10px">
            דשבורד עסקי
            <small>סטטיסטיקות, צפיות וקופונים שמומשו</small>
          </a>
          <button id="mof-logout-btn" onclick="mofLogout()">התנתק</button>
        </div>

      </div>
    </div>
  `;

  const wrap = document.createElement('div');
  wrap.innerHTML = modalHtml;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
}

window.mofOpenAuth = function() {
  mofInjectAuthModal();
  document.getElementById('mof-auth-modal').classList.add('open');
};
window.mofCloseAuth = function() {
  const m = document.getElementById('mof-auth-modal');
  if (m) m.classList.remove('open');
};

// טוען את supabase-js דינמית אם חסר
function mofLoadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) { resolve(); return; }
    const existing = document.querySelector('script[src*="supabase"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', reject, { once: true });
      // אם כבר נטען בעבר
      setTimeout(() => { if (window.supabase) resolve(); }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load supabase-js'));
    document.head.appendChild(script);
  });
}

window.mofLoginGoogle = async function() {
  try {
    if (!window.supabase) {
      await mofLoadSupabase();
    }
    if (!window.mofSB) {
      window.mofSB = window.supabase.createClient(SB_URL, SB_KEY);
    }
    await window.mofSB.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    });
  } catch (e) {
    alert('שגיאה בהתחברות: ' + (e.message || e));
    console.error('Auth error:', e);
  }
};

window.mofLogout = async function() {
  if (!window.mofSB) return;
  try {
    await window.mofSB.auth.signOut();
    try { localStorage.removeItem('user_name'); } catch {}
    mofCloseAuth();
    location.reload();
  } catch (e) {
    alert('שגיאה: ' + e.message);
  }
};

async function mofInitAuth() {
  try {
    // הזרק את המודאל מיד (כדי שכל ה-elements יהיו זמינים)
    mofInjectAuthModal();

    // טען supabase-js אם חסר
    if (!window.supabase) {
      await mofLoadSupabase();
    }
    if (!window.SB_KEY) return;

    window.mofSB = window.supabase.createClient(SB_URL, SB_KEY);

    // בדוק session נוכחי
    const { data: { session } } = await window.mofSB.auth.getSession();
    mofUpdateUI(session?.user || null);

    // האזן לשינויים
    window.mofSB.auth.onAuthStateChange((_event, session) => {
      mofUpdateUI(session?.user || null);
    });
  } catch (e) {
    console.warn('Auth init failed:', e);
  }
}

function mofUpdateUI(user) {
  const card = document.getElementById('mof-auth-card');
  const iconEl = document.getElementById('mof-auth-icon');
  const avatarEl = document.getElementById('mof-auth-avatar');
  const mobileLabel = document.getElementById('mof-mobile-auth-label');

  if (user) {
    // מחובר
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email?.split('@')[0] || 'משתמש';
    const firstName = name.trim().split(' ')[0];
    const initial = firstName.charAt(0).toUpperCase();
    const picture = meta.picture || meta.avatar_url;

    // עדכון אווטר ב-header
    if (iconEl) iconEl.style.display = 'none';
    if (avatarEl) {
      avatarEl.style.display = 'inline-flex';
      avatarEl.innerHTML = picture
        ? `<img src="${picture}" alt="${name}" onerror="this.parentNode.textContent='${initial}'">`
        : initial;
    }

    // עדכון תווית במובייל
    if (mobileLabel) mobileLabel.textContent = `שלום, ${firstName} · החשבון שלי`;

    // עדכון שם ב-TopBar (לברכה)
    try { localStorage.setItem('user_name', firstName); } catch {}
    if (typeof updateSmartGreeting === 'function') {
      updateSmartGreeting(new Date().getHours());
    }

    // עדכון מודאל (אם קיים)
    if (card) {
      card.classList.add('logged-in');
      const modalAvatar = document.getElementById('mof-modal-avatar');
      if (modalAvatar) {
        modalAvatar.innerHTML = picture
          ? `<img src="${picture}" alt="${name}" onerror="this.parentNode.textContent='${initial}'">`
          : initial;
      }
      const nameEl = document.getElementById('mof-modal-name');
      if (nameEl) nameEl.textContent = name;
      const emailEl = document.getElementById('mof-modal-email');
      if (emailEl) emailEl.textContent = user.email || '';
    }
  } else {
    // לא מחובר
    if (iconEl) iconEl.style.display = '';
    if (avatarEl) avatarEl.style.display = 'none';
    if (mobileLabel) mobileLabel.textContent = 'התחברות / הרשמה';
    if (card) card.classList.remove('logged-in');
    try { localStorage.removeItem('user_name'); } catch {}
  }
}

// הפעל אחרי טעינת הדף
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(mofInitAuth, 300));
} else {
  setTimeout(mofInitAuth, 300);
}

/* ════════════════════════════════════════════════════════════
   Favorites System - כפתורי לב גלובליים
   ════════════════════════════════════════════════════════════ */

window.mofFavCache = new Set(); // cache של ItemIDs ששמורים

// טעינת מועדפים של המשתמש הנוכחי
async function mofLoadFavoritesCache() {
  if (!window.mofSB || !window.mofSB.auth) return;
  const { data: { session } } = await window.mofSB.auth.getSession();
  if (!session) {
    window.mofFavCache = new Set();
    mofRefreshAllHearts();
    return;
  }
  try {
    const { data } = await window.mofSB.from('user_favorites').select('item_type,item_id');
    window.mofFavCache = new Set((data || []).map(f => `${f.item_type}:${f.item_id}`));
    mofRefreshAllHearts();
  } catch (e) {
    console.warn('fav cache load failed', e);
  }
}

// רענון כל הלבבות בדף אחרי טעינה / כניסה / יציאה
function mofRefreshAllHearts() {
  document.querySelectorAll('.mof-fav-btn').forEach(btn => {
    const type = btn.dataset.favType;
    const id = btn.dataset.favId;
    const key = `${type}:${id}`;
    if (window.mofFavCache.has(key)) {
      btn.classList.add('saved');
    } else {
      btn.classList.remove('saved');
    }
  });
}

// טוגל מועדף (הוספה/הסרה)
window.mofToggleFavorite = async function(btn) {
  // לא מחובר → פתח מודאל התחברות
  if (!window.mofSB) {
    if (typeof mofOpenAuth === 'function') mofOpenAuth();
    return;
  }
  const { data: { session } } = await window.mofSB.auth.getSession();
  if (!session) {
    if (typeof mofOpenAuth === 'function') mofOpenAuth();
    return;
  }

  const type = btn.dataset.favType;
  const id = btn.dataset.favId;
  const key = `${type}:${id}`;
  const userId = session.user.id;

  // איסוף data מהDOM
  let itemData = {};
  try {
    if (btn.dataset.favData) itemData = JSON.parse(btn.dataset.favData);
  } catch {}

  btn.disabled = true;

  try {
    if (window.mofFavCache.has(key)) {
      // הסרה
      const { error } = await window.mofSB.from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', type)
        .eq('item_id', id);
      if (error) throw error;
      window.mofFavCache.delete(key);
      btn.classList.remove('saved');
      mofShowToast('הוסר מהמועדפים');
    } else {
      // הוספה
      const { error } = await window.mofSB.from('user_favorites').insert({
        user_id: userId, item_type: type, item_id: String(id), item_data: itemData
      });
      if (error) throw error;
      window.mofFavCache.add(key);
      btn.classList.add('saved');
      // אנימציית פרץ
      btn.classList.add('pop');
      setTimeout(() => btn.classList.remove('pop'), 500);
      mofShowToast('נשמר במועדפים');
    }
  } catch (e) {
    if (e.message && e.message.includes('duplicate')) {
      // כבר קיים - רק עדכן UI
      window.mofFavCache.add(key);
      btn.classList.add('saved');
    } else {
      alert('שגיאה: ' + (e.message || e));
    }
  } finally {
    btn.disabled = false;
  }
};

// פונקציית עזר ליצירת כפתור לב
window.mofHeartBtn = function(type, id, data) {
  const dataAttr = data ? `data-fav-data='${JSON.stringify(data).replace(/'/g, "&#39;")}'` : '';
  return `<button class="mof-fav-btn" data-fav-type="${type}" data-fav-id="${id}" ${dataAttr} onclick="event.stopPropagation();mofToggleFavorite(this)" aria-label="הוסף למועדפים" title="הוסף למועדפים">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  </button>`;
};

// טוסט (הודעה קצרה)
function mofShowToast(msg) {
  let toast = document.getElementById('mof-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mof-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:#1A2E5C;color:#fff;padding:12px 24px;border-radius:100px;font-family:Heebo,sans-serif;font-weight:700;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:99998;transition:transform .3s ease-out;pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  }, 2000);
}

// CSS גלובלי לכפתור הלב
(function injectFavStyle() {
  if (document.getElementById('mof-fav-style')) return;
  const s = document.createElement('style');
  s.id = 'mof-fav-style';
  s.textContent = `
    .mof-fav-btn {
      position: absolute; top: 12px; left: 12px; z-index: 5;
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border: 1.5px solid rgba(0,0,0,0.08);
      color: #94A3B8; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .mof-fav-btn:hover { transform: scale(1.1); color: #DC2626; border-color: #DC2626; }
    .mof-fav-btn.saved { color: #DC2626; border-color: #DC2626; background: #fff; }
    .mof-fav-btn.saved svg { fill: #DC2626; }
    .mof-fav-btn.pop { animation: mofFavPop 0.5s ease-out; }
    .mof-fav-btn:disabled { opacity: 0.6; cursor: default; }
    @keyframes mofFavPop {
      0% { transform: scale(1); }
      30% { transform: scale(1.4); }
      60% { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    /* יש לוודא שהכרטיסים שבהם יש כפתור לב הם position:relative */
    .has-fav-btn, .deal-card, .pro-card, .biz-card, .shul-card, .post-item {
      position: relative;
    }
  `;
  document.head.appendChild(s);
})();

// טען cache אחרי שauth מוכן + רענן כשמחליפים session
const _origMofInitAuth = window.mofInitAuth;
if (typeof mofInitAuth === 'function') {
  // Hook into existing auth state changes
  setTimeout(async () => {
    if (window.mofSB && window.mofSB.auth) {
      await mofLoadFavoritesCache();
      window.mofSB.auth.onAuthStateChange(() => {
        mofLoadFavoritesCache();
      });
    } else {
      setTimeout(() => mofLoadFavoritesCache(), 1000);
    }
  }, 800);
}

window.mofLoadFavoritesCache = mofLoadFavoritesCache;
window.mofRefreshAllHearts = mofRefreshAllHearts;

/* ════════════════════════════════════════════════════════════
   Business Analytics - מעקב צפיות ולחיצות
   ════════════════════════════════════════════════════════════ */

// יוצר/שולף visitor_id אנונימי
function mofGetVisitorId() {
  let vid = localStorage.getItem('mof_visitor_id');
  if (!vid) {
    vid = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem('mof_visitor_id', vid); } catch {}
  }
  return vid;
}

// זיהוי סוג מכשיר
function mofDeviceType() {
  const ua = navigator.userAgent || '';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

// רישום צפייה בעסק - throttled (פעם בכל 30 דקות לאותו visitor+business)
window.mofTrackView = async function(businessId) {
  if (!businessId || !window.mofSB) return;
  const key = `mof_view_${businessId}`;
  const last = parseInt(localStorage.getItem(key) || '0', 10);
  if (Date.now() - last < 30 * 60 * 1000) return; // 30 דק'

  try {
    const { data: { session } } = await window.mofSB.auth.getSession();
    await window.mofSB.from('business_events').insert({
      business_id: businessId,
      kind: 'business_view',
      user_id: session?.user?.id || null,
      session_id: mofGetVisitorId(),
      referrer: document.referrer ? document.referrer.slice(0, 200) : null,
      user_agent: navigator.userAgent.slice(0, 200),
      meta: { device: mofDeviceType() }
    });
    localStorage.setItem(key, String(Date.now()));
  } catch (e) {
    console.warn('view track failed', e);
  }
};

// מיפוי סוגי לחיצה (מ-business.html) לערכי enum של business_events.kind
const MOF_EVENT_KIND = {
  phone: 'phone_click',
  whatsapp: 'whatsapp_click',
  navigation: 'directions_click',
  website: 'website_click',
  coupon_view: 'coupon_view',
  coupon_claim: 'coupon_claim',
  coupon_redeem: 'coupon_redeem',
  lead: 'lead_submit'
};

// רישום לחיצה
window.mofTrackClick = async function(businessId, clickType, target, couponId) {
  if (!businessId || !window.mofSB) return;
  const kind = MOF_EVENT_KIND[clickType] || clickType;
  try {
    const { data: { session } } = await window.mofSB.auth.getSession();
    await window.mofSB.from('business_events').insert({
      business_id: businessId,
      kind: kind,
      coupon_id: couponId || null,
      user_id: session?.user?.id || null,
      session_id: mofGetVisitorId(),
      user_agent: navigator.userAgent.slice(0, 200),
      meta: target ? { target: String(target).slice(0, 200) } : null
    });
  } catch (e) {
    console.warn('click track failed', e);
  }
};

/* ════════════════════════════════════════════════════════════
   Push Notifications - תושב נרשם לקבל התראות
   ════════════════════════════════════════════════════════════ */

// ⚠️ Public VAPID Key - יש להחליף עם המפתח האמיתי אחרי npx web-push generate-vapid-keys
const MOF_VAPID_PUBLIC_KEY = 'BG73UIHYE9JxOVxZvIg373uJ5sqWeSBCGJRfjgpV4rmvg-oKL2fDiK13iglXC-5qdcpw0CkFAREV8NJ6vArnJNk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

// בדוק אם המשתמש כבר נרשם או דחה
function mofPushStatus() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  if (localStorage.getItem('mof_push_dismissed') === '1') return 'dismissed';
  return 'default';
}

// בקש הרשאה ורשם את ה-subscription ב-DB
async function mofRequestPushPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      mofShowToast('לא התקבלה הרשאה', 'error');
      return false;
    }

    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(MOF_VAPID_PUBLIC_KEY)
      });
    }

    // שמור ב-DB
    const sb = window.mofSB;
    if (!sb) {
      mofShowToast('שגיאה: מערכת לא טעונה', 'error');
      return false;
    }

    const { data: { session } } = await sb.auth.getSession();
    const userId = session?.user?.id || null;

    const subJson = subscription.toJSON();
    const { error } = await sb.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
      user_agent: navigator.userAgent.slice(0, 200),
      is_active: true,
      last_used_at: new Date().toISOString()
    }, { onConflict: 'endpoint' });

    if (error) {
      console.error('Push subscribe error:', error);
      mofShowToast('שגיאה: ' + error.message, 'error');
      return false;
    }

    mofShowToast('נרשמת בהצלחה לקבלת עדכונים!', 'success');
    mofHidePushBanner();
    return true;
  } catch (e) {
    console.error('Push permission error:', e);
    mofShowToast('שגיאה: ' + e.message, 'error');
    return false;
  }
}

// הצג באנר נחמד למשתמש
function mofShowPushBanner() {
  if (document.getElementById('mof-push-banner')) return;
  if (mofPushStatus() !== 'default') return;

  const banner = document.createElement('div');
  banner.id = 'mof-push-banner';
  banner.innerHTML = `
    <style>
      #mof-push-banner {
        position: fixed;
        bottom: 20px;
        right: 20px;
        left: 20px;
        max-width: 400px;
        margin-right: auto;
        background: linear-gradient(135deg, #1A2E5C 0%, #2563EB 100%);
        color: #fff;
        border-radius: 16px;
        padding: 16px 18px;
        box-shadow: 0 12px 32px rgba(26,46,92,0.3);
        z-index: 99996;
        display: flex;
        gap: 12px;
        align-items: center;
        animation: mof-slide-up 0.4s ease-out;
      }
      @keyframes mof-slide-up {
        from { transform: translateY(120%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #mof-push-banner .push-icon {
        width: 40px; height: 40px; border-radius: 12px;
        background: rgba(245,158,11,0.2); color: #F59E0B;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      #mof-push-banner .push-text { flex: 1; min-width: 0; }
      #mof-push-banner .push-title { font-size: 14px; font-weight: 900; line-height: 1.2; margin-bottom: 2px; }
      #mof-push-banner .push-sub { font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.3; }
      #mof-push-banner .push-actions { display: flex; gap: 6px; flex-shrink: 0; }
      #mof-push-banner .push-yes {
        background: #F59E0B; color: #1A2E5C;
        border: none; padding: 8px 14px; border-radius: 8px;
        font-weight: 900; font-size: 12px; cursor: pointer;
        font-family: inherit;
      }
      #mof-push-banner .push-no {
        background: transparent; color: rgba(255,255,255,0.7);
        border: none; padding: 8px 10px; cursor: pointer;
        font-size: 11px; font-family: inherit;
      }
      @media (max-width: 480px) {
        #mof-push-banner { right: 10px; left: 10px; padding: 12px 14px; }
        #mof-push-banner .push-icon { width: 36px; height: 36px; }
        #mof-push-banner .push-actions { flex-direction: column; gap: 4px; }
      }
    </style>
    <div class="push-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    </div>
    <div class="push-text">
      <div class="push-title">קבל עדכונים מהעיר</div>
      <div class="push-sub">מבצעים, חדשות וקופונים חמים</div>
    </div>
    <div class="push-actions">
      <button class="push-yes" onclick="mofRequestPushPermission()">הירשם</button>
      <button class="push-no" onclick="mofDismissPushBanner()">לא עכשיו</button>
    </div>
  `;
  document.body.appendChild(banner);
}

function mofHidePushBanner() {
  const el = document.getElementById('mof-push-banner');
  if (el) el.remove();
}

function mofDismissPushBanner() {
  try { localStorage.setItem('mof_push_dismissed', '1'); } catch {}
  mofHidePushBanner();
}

// Toast helper - אם לא קיים כבר
if (typeof window.mofShowToast !== 'function') {
  window.mofShowToast = function(msg, type) {
    let t = document.getElementById('mof-toast-global');
    if (!t) {
      t = document.createElement('div');
      t.id = 'mof-toast-global';
      t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(120px);background:#1A2E5C;color:#fff;padding:12px 24px;border-radius:100px;font-weight:700;font-size:14px;z-index:99999;transition:transform .3s;box-shadow:0 8px 24px rgba(0,0,0,0.3);max-width:90vw;text-align:center';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = type === 'error' ? '#DC2626' : type === 'success' ? '#16A34A' : '#1A2E5C';
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(120px)'; }, 3500);
  };
}

// הצג באנר אחרי 30 שניות מאז שהמשתמש נכנס (לא לפני)
window.addEventListener('load', () => {
  setTimeout(() => {
    if (mofPushStatus() === 'default') mofShowPushBanner();
  }, 30000); // 30 שניות
});

// חשוף לglobal
window.mofRequestPushPermission = mofRequestPushPermission;
window.mofDismissPushBanner = mofDismissPushBanner;
window.mofShowPushBanner = mofShowPushBanner;
window.mofPushStatus = mofPushStatus;
