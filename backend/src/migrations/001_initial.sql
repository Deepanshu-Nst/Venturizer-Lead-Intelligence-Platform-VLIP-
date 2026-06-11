-- Venturizer Lead Intelligence Platform
-- Initial Schema Migration
-- PostgreSQL 16+

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS (internal Venturizer team members)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'viewer'
                    CHECK (role IN ('admin', 'editor', 'viewer')),
  api_key_hash    VARCHAR(255) NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ============================================================
-- LEADS (core entity — founders or investors)
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            VARCHAR(10) NOT NULL
                    CHECK (type IN ('founder', 'investor')),
  full_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),
  linkedin_url    VARCHAR(500),
  status          VARCHAR(20) NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'contacted', 'qualified', 'disqualified', 'archived')),
  score           INTEGER CHECK (score >= 0 AND score <= 100),
  score_bucket    VARCHAR(10) CHECK (score_bucket IN ('hot', 'good', 'maybe', 'low')),
  assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
  source          VARCHAR(50) NOT NULL DEFAULT 'direct',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email ON leads(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_score_bucket ON leads(score_bucket);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_type_status ON leads(type, status);
CREATE INDEX IF NOT EXISTS idx_leads_type_score ON leads(type, score);

-- ============================================================
-- FOUNDER PROFILES (1:1 with leads where type = 'founder')
-- ============================================================
CREATE TABLE IF NOT EXISTS founder_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id               UUID NOT NULL UNIQUE
                          REFERENCES leads(id) ON DELETE CASCADE,
  prev_startup          BOOLEAN,
  industry_experience   INTEGER,
  commitment            VARCHAR(20)
                          CHECK (commitment IN ('full-time', 'part-time')),
  startup_name          VARCHAR(255),
  industry              VARCHAR(100),
  problem_statement     TEXT,
  target_customer       TEXT,
  mvp_status            VARCHAR(20)
                          CHECK (mvp_status IN ('idea', 'prototype', 'mvp', 'launched', 'revenue')),
  active_users          INTEGER,
  monthly_revenue       DECIMAL(12, 2),
  growth_rate           DECIMAL(5, 2),
  team_size             INTEGER,
  has_cofounder         BOOLEAN,
  funding_ask           DECIMAL(12, 2)
);

CREATE INDEX IF NOT EXISTS idx_founder_profiles_lead_id ON founder_profiles(lead_id);
CREATE INDEX IF NOT EXISTS idx_founder_profiles_mvp_status ON founder_profiles(mvp_status);
CREATE INDEX IF NOT EXISTS idx_founder_profiles_industry ON founder_profiles(industry);

-- ============================================================
-- INVESTOR PROFILES (1:1 with leads where type = 'investor')
-- ============================================================
CREATE TABLE IF NOT EXISTS investor_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id             UUID NOT NULL UNIQUE
                        REFERENCES leads(id) ON DELETE CASCADE,
  investor_type       VARCHAR(20)
                        CHECK (investor_type IN ('angel', 'vc', 'family-office', 'corporate')),
  preferred_stage     VARCHAR(20),
  sector_focus        TEXT[],
  cheque_min          DECIMAL(12, 2),
  cheque_max          DECIMAL(12, 2),
  deployment_timeline VARCHAR(20),
  portfolio_count     INTEGER,
  geography           VARCHAR(50),
  follow_on_strategy  TEXT,
  value_add           TEXT,
  decision_timeline   VARCHAR(20),
  actively_investing  VARCHAR(20),
  looking_for_deals   BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_investor_profiles_lead_id ON investor_profiles(lead_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_type ON investor_profiles(investor_type);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_stage ON investor_profiles(preferred_stage);

-- ============================================================
-- LEAD SCORES (per-dimension breakdown, N:1 with leads)
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL
                REFERENCES leads(id) ON DELETE CASCADE,
  dimension   VARCHAR(50) NOT NULL,
  score       INTEGER NOT NULL CHECK (score >= 0),
  weight      INTEGER NOT NULL CHECK (weight > 0),
  rationale   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id ON lead_scores(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_dimension ON lead_scores(dimension);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_scores_lead_dimension ON lead_scores(lead_id, dimension);

-- ============================================================
-- DOCUMENTS (uploaded PDFs, N:1 with leads)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL
                REFERENCES leads(id) ON DELETE CASCADE,
  type        VARCHAR(20) NOT NULL DEFAULT 'other'
                CHECK (type IN ('pitch-deck', 'investment-thesis', 'other')),
  file_name   VARCHAR(255) NOT NULL,
  file_size   INTEGER CHECK (file_size > 0),
  mime_type   VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  storage_key VARCHAR(500) NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- ============================================================
-- ACTIVITY LOGS (audit trail, N:1 with leads)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL
                REFERENCES leads(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_lead_id ON activity_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_lead_action ON activity_logs(lead_id, action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata ON activity_logs USING gin(metadata);

-- ============================================================
-- TRIGGER: auto-update updated_at on leads
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: default admin user (password: change-on-first-login)
-- ============================================================
INSERT INTO users (email, name, role, api_key_hash)
VALUES ('admin@venturizer.com', 'Admin', 'admin', '$2b$12$placeholder')
ON CONFLICT (LOWER(email)) DO NOTHING;
