-- ════════════════════════════════════════════════════
-- MyOfaqim.co.il — Database Setup
-- Run in Supabase SQL Editor
-- Last updated: 2026-05-20
-- ════════════════════════════════════════════════════

-- ── 1. PROFILES (משתמשים + תפקידים) ────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'resident' CHECK (role IN ('resident','business_owner','professional','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 2. BUSINESSES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT UNIQUE,
  business_name TEXT NOT NULL,
  tagline TEXT,
  category TEXT,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  website_url TEXT,
  cover_image_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  hours JSONB,
  rating NUMERIC(2,1),
  rating_count INTEGER DEFAULT 0,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free','basic','pro','enterprise')),
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected','suspended')),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_open_now BOOLEAN DEFAULT FALSE,
  subscription_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active, status);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

-- ── 3. BUSINESS SIGNUPS (טופס הצטרפות) ───────────────
CREATE TABLE IF NOT EXISTS business_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  website_url TEXT,
  contact_name TEXT,
  selected_plan TEXT,
  plan_tier TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. PROFESSIONALS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  trade TEXT,
  bio TEXT,
  years_of_experience INTEGER,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  service_areas JSONB DEFAULT '["אופקים"]'::jsonb,
  rating NUMERIC(2,1),
  rating_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  plan_tier TEXT DEFAULT 'free',
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected','suspended')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_professionals_active ON professionals(is_active, status);
CREATE INDEX IF NOT EXISTS idx_professionals_trade ON professionals(trade);

CREATE TABLE IF NOT EXISTS professional_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  trade TEXT,
  bio TEXT,
  years_of_experience INTEGER,
  phone TEXT,
  email TEXT,
  service_areas JSONB,
  selected_plan TEXT,
  plan_tier TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. COUPONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  business_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  discount_percent INTEGER,
  original_price NUMERIC,
  discounted_price NUMERIC,
  category TEXT,
  deal_source TEXT,
  image_url TEXT,
  contact_phone TEXT,
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER DEFAULT 0,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coupons_business ON coupons(business_id);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, status);

-- ── 6. LEADS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','closed','converted')),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT lead_target CHECK (
    (business_id IS NOT NULL AND professional_id IS NULL) OR
    (business_id IS NULL AND professional_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_leads_business ON leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_professional ON leads(professional_id);

-- ── 7. JOBS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kind TEXT CHECK (kind IN ('wanted','seeking')),
  title TEXT NOT NULL,
  company_name TEXT,
  description TEXT,
  category TEXT,
  scope TEXT CHECK (scope IN ('full','part','shift','freelance')),
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_urgent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','expired','rejected')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active, status);

-- ── 8. REAL ESTATE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS realestate_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deal_type TEXT CHECK (deal_type IN ('sale','rent','new_project')),
  property_type TEXT,
  lister_type TEXT CHECK (lister_type IN ('private','agent','developer')),
  title TEXT NOT NULL,
  description TEXT,
  neighborhood TEXT,
  rooms NUMERIC(3,1),
  size_sqm INTEGER,
  floor INTEGER,
  price NUMERIC,
  cover_image_url TEXT,
  has_parking BOOLEAN DEFAULT FALSE,
  has_elevator BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,
  has_storage BOOLEAN DEFAULT FALSE,
  has_safe_room BOOLEAN DEFAULT FALSE,
  is_furnished BOOLEAN DEFAULT FALSE,
  is_renovated BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  contact_name TEXT,
  contact_phone TEXT,
  agency_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','sold','expired','rejected')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_re_active ON realestate_listings(is_active, status);
CREATE INDEX IF NOT EXISTS idx_re_deal ON realestate_listings(deal_type);

-- ── 9. FORUM ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT,
  category TEXT,
  title TEXT NOT NULL,
  body TEXT,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forum_active ON forum_posts(is_active);

CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_replies_post ON forum_replies(post_id);

-- Auto-increment replies count
CREATE OR REPLACE FUNCTION inc_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_replies_count ON forum_replies;
CREATE TRIGGER trg_replies_count AFTER INSERT ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION inc_replies_count();

-- ── 10. COMMUNITY EVENTS ─────────────────────────────
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  organizer TEXT,
  price NUMERIC,
  is_free BOOLEAN DEFAULT FALSE,
  link_url TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_date ON community_events(event_date) WHERE is_active = TRUE;

-- ── 11. PUBLIC SERVICES ──────────────────────────────
CREATE TABLE IF NOT EXISTS public_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  address TEXT,
  phone TEXT,
  hours TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_services_cat ON public_services(category, is_active);

-- ── 12. NEWS ARTICLES ────────────────────────────────
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  category TEXT DEFAULT 'news' CHECK (category IN ('news','announcement','event','community')),
  author_name TEXT,
  reading_time INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(is_published, published_at DESC);

-- ── 13. NEWSLETTER ───────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  phone TEXT,
  neighborhood TEXT,
  topics JSONB DEFAULT '[]'::jsonb,
  subscriber_type TEXT DEFAULT 'resident' CHECK (subscriber_type IN ('resident','business_owner','professional')),
  business_name TEXT,
  business_category TEXT,
  trade TEXT,
  source TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','unsubscribed')),
  confirmation_token UUID DEFAULT gen_random_uuid() UNIQUE,
  wants_email BOOLEAN DEFAULT TRUE,
  wants_sms BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_newsletter_type ON newsletter_subscribers(subscriber_type, status);
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON newsletter_subscribers(confirmation_token);

-- מעדכנים טבלאות קיימות (אם עוד לא קיים)
DO $$
BEGIN
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS subscriber_type TEXT DEFAULT 'resident' CHECK (subscriber_type IN ('resident','business_owner','professional')); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS business_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS business_category TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS trade TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS first_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS phone TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS confirmation_token UUID DEFAULT gen_random_uuid(); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS wants_email BOOLEAN DEFAULT TRUE; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS wants_sms BOOLEAN DEFAULT FALSE; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- ── 14. WHATSAPP GROUPS ──────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  invite_link TEXT,
  members_count INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 15. CONTACT SUBMISSIONS ──────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  topic TEXT,
  message TEXT NOT NULL,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','replied','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 16. ANALYTICS (views & clicks) ───────────────────
CREATE TABLE IF NOT EXISTS business_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_biz_views_biz ON business_views(business_id, created_at);

CREATE TABLE IF NOT EXISTS business_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  click_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_biz_clicks_biz ON business_clicks(business_id, created_at);

-- ── 17. ROW LEVEL SECURITY ───────────────────────────
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE realestate_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ── Public read policies ──
CREATE POLICY "Public can read active businesses" ON businesses
  FOR SELECT USING (is_active = TRUE AND status = 'approved');

CREATE POLICY "Public can read active professionals" ON professionals
  FOR SELECT USING (is_active = TRUE AND status = 'approved');

CREATE POLICY "Public can read active coupons" ON coupons
  FOR SELECT USING (is_active = TRUE AND status = 'active');

CREATE POLICY "Public can read active jobs" ON jobs
  FOR SELECT USING (is_active = TRUE AND status = 'active');

CREATE POLICY "Public can read active listings" ON realestate_listings
  FOR SELECT USING (is_active = TRUE AND status = 'active');

CREATE POLICY "Public can read active forum posts" ON forum_posts
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can read active replies" ON forum_replies
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can read active events" ON community_events
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can read active services" ON public_services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can read published articles" ON news_articles
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Public can read active groups" ON whatsapp_groups
  FOR SELECT USING (is_active = TRUE);

-- ── Insert policies for signups/contact ──
CREATE POLICY "Anyone can submit business signup" ON business_signups
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can submit professional signup" ON professional_signups
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can submit contact" ON contact_submissions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can subscribe newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can submit lead" ON leads
  FOR INSERT WITH CHECK (TRUE);

-- ── Authenticated insert for forum ──
CREATE POLICY "Authenticated can post forum" ON forum_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authenticated can reply forum" ON forum_replies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authenticated can submit job" ON jobs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authenticated can submit listing" ON realestate_listings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- ── Owner can update their business ──
CREATE POLICY "Owner can update business" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner can manage coupons" ON coupons
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner can see business leads" ON leads
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR professional_id IN (SELECT id FROM professionals WHERE owner_id = auth.uid())
  );

-- ── Profile policies ──
CREATE POLICY "Public can read profiles" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ── 18. RPC: increment business view ─────────────────
CREATE OR REPLACE FUNCTION inc_business_view(biz_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO business_views (business_id) VALUES (biz_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 19. Sample admin user setup ──────────────────────
-- After signing up with Google as refael@tedgi.co.il, run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'refael@tedgi.co.il';

-- ════════════════════════════════════════════════════
-- DONE. Run this in Supabase SQL Editor.
-- ════════════════════════════════════════════════════
