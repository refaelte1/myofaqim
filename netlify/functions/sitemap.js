// Netlify Function: dynamic sitemap.xml generator
// Pulls live data from Supabase and produces an SEO-ready sitemap
// at /sitemap.xml — refreshed every hour via cache header.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uexrxkzewfmhthrllsmd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_OewpLipzA15en2yUlMKQsQ_HGHo8sVk';
const SITE_URL = 'https://myofaqim.co.il';

async function fetchTable(table, select, filters) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  if (filters) Object.entries(filters).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    console.warn(`Failed to fetch ${table}:`, res.status);
    return [];
  }
  return res.json();
}

function escXml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, lastmod, priority, changefreq) {
  return `  <url>
    <loc>${escXml(loc)}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`;
}

exports.handler = async () => {
  try {
    // Fetch all active content in parallel
    const [businesses, projects, articles, listings] = await Promise.all([
      fetchTable('businesses', 'slug,updated_at', { status: 'eq.active' }),
      fetchTable('projects',   'slug,updated_at', { is_published: 'eq.true' }),
      fetchTable('articles',   'slug,updated_at', { status: 'eq.published' }),
      fetchTable('property_listings', 'slug,updated_at', { status: 'eq.active' }),
    ]);

    const staticPages = [
      { loc: SITE_URL + '/',                  priority: '1.0', changefreq: 'daily' },
      { loc: SITE_URL + '/realestate',        priority: '0.9', changefreq: 'daily' },
      { loc: SITE_URL + '/#businesses',       priority: '0.8', changefreq: 'daily' },
      { loc: SITE_URL + '/#coupons',          priority: '0.8', changefreq: 'daily' },
      { loc: SITE_URL + '/#news',             priority: '0.7', changefreq: 'daily' },
      { loc: SITE_URL + '/#forum',            priority: '0.6', changefreq: 'weekly' },
      { loc: SITE_URL + '/#professionals',    priority: '0.6', changefreq: 'weekly' },
      { loc: SITE_URL + '/#community',        priority: '0.5', changefreq: 'monthly' },
    ];

    const dynamicEntries = [
      ...staticPages.map(p => urlEntry(p.loc, null, p.priority, p.changefreq)),
      ...businesses.map(b => urlEntry(`${SITE_URL}/business/${b.slug}`, b.updated_at, '0.8', 'weekly')),
      ...projects.map(p   => urlEntry(`${SITE_URL}/project/${p.slug}`, p.updated_at, '0.8', 'weekly')),
      ...articles.map(a   => urlEntry(`${SITE_URL}/article/${a.slug}`, a.updated_at, '0.7', 'monthly')),
      ...listings.map(l   => urlEntry(`${SITE_URL}/realestate?listing=${l.slug}`, l.updated_at, '0.6', 'weekly')),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${dynamicEntries.join('\n')}
</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // Cache for 1 hour at the CDN edge, browsers can cache 5 min
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      },
      body: xml,
    };
  } catch (err) {
    console.error('Sitemap error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/xml' },
      body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc></url>
</urlset>`,
    };
  }
};
