-- ============================================================
-- VibeShift / Tone Studio — Supabase PostgreSQL Schema
-- Publishable Key: sb_publishable_AuBcKXupQz3ehp3wfbRiDw_TWC_Dm2J
-- ============================================================

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT DEFAULT 'Pro' CHECK (plan IN ('Free', 'Pro', 'Enterprise')),
  role TEXT DEFAULT 'Principal AI Orchestrator',
  total_shifts INT DEFAULT 0,
  joined_date TEXT DEFAULT 'Oct 2026',
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'busy', 'away')),
  last_login_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USER LOGINS AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.user_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  device_info TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  provider TEXT DEFAULT 'email' CHECK (provider IN ('email', 'guest', 'oauth'))
);

-- 3. CUSTOM PERSONAS TABLE
CREATE TABLE IF NOT EXISTS public.custom_personas (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'guest',
  title TEXT NOT NULL,
  badge_label TEXT NOT NULL,
  badge_color TEXT DEFAULT 'blue' CHECK (badge_color IN ('amber', 'emerald', 'cyan', 'purple', 'blue', 'rose')),
  icon TEXT DEFAULT 'Sparkles',
  description TEXT,
  system_prompt TEXT NOT NULL,
  tone_scores JSONB DEFAULT '{"formality": 50, "empathy": 50, "urgency": 50, "clarity": 80}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CHATS TABLE
CREATE TABLE IF NOT EXISTS public.chats (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'guest',
  title TEXT NOT NULL DEFAULT 'New Chat',
  category TEXT DEFAULT 'Today',
  scenario_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT,
  sliders JSONB,
  scenario_id TEXT,
  transformation_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AUDIT & GOVERNANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_id TEXT,
  user_name TEXT,
  conversation_id TEXT,
  conversation_title TEXT,
  source_draft TEXT,
  detected_vibe TEXT,
  execution_time_ms INT,
  fact_parity_percent NUMERIC(5,2) DEFAULT 100.00,
  preserved_facts_count INT DEFAULT 3,
  personas_generated TEXT[] DEFAULT ARRAY[]::TEXT[],
  governance_status TEXT DEFAULT 'compliant' CHECK (governance_status IN ('compliant', 'warning', 'flagged')),
  compliance_rule TEXT DEFAULT 'Section 4.2 Invariant Parity Gate'
);

-- INDEXES FOR FAST RETRIEVAL
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_logins_timestamp ON public.user_logins(timestamp DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write using publishable key for seamless studio interaction
CREATE POLICY "Public read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Public insert/update user_profiles" ON public.user_profiles FOR ALL USING (true);

CREATE POLICY "Public read user_logins" ON public.user_logins FOR SELECT USING (true);
CREATE POLICY "Public insert user_logins" ON public.user_logins FOR INSERT WITH CHECK (true);

CREATE POLICY "Public access custom_personas" ON public.custom_personas FOR ALL USING (true);
CREATE POLICY "Public access chats" ON public.chats FOR ALL USING (true);
CREATE POLICY "Public access chat_messages" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Public access audit_logs" ON public.audit_logs FOR ALL USING (true);
