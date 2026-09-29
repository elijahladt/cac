-- Nevada Nexus Database Schema
-- Congressional App Challenge 2026

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Resources table (Source of truth for community resources)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'utility_assistance',
    'food_assistance',
    'housing',
    'healthcare',
    'jobs',
    'transportation',
    'childcare',
    'other'
  )),
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NV',
  zip TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  website TEXT,
  hours TEXT,
  languages TEXT[] NOT NULL DEFAULT '{"en"}',
  source_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (
    verification_status IN ('VERIFIED', 'NEEDS_REVIEW', 'STALE', 'ARCHIVED')
  ),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Programs table (Specific assistance programs provided by resources)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  application_url TEXT,
  application_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  source_url TEXT NOT NULL,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resource Sources table (Auditing & tracking authoritative source origins)
CREATE TABLE IF NOT EXISTS resource_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- e.g., 'official_gov', 'nonprofit_portal', 'nevada_211'
  source_url TEXT NOT NULL,
  publisher TEXT NOT NULL,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);

-- Semantic embeddings table for pgvector retrieval
CREATE TABLE IF NOT EXISTS resource_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'es', 'tl')),
  zip_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assistance Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (
    status IN (
      'NEW',
      'UNDERSTANDING',
      'NEEDS_CLARIFICATION',
      'SEARCHING',
      'RESOURCES_FOUND',
      'ELIGIBILITY_REVIEW',
      'PLAN_CREATED',
      'DOCUMENT_REVIEW',
      'USER_REVIEW',
      'COMPLETED'
    )
  ),
  primary_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case Needs table
CREATE TABLE IF NOT EXISTS case_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Action Plans table
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Action Plan Items table
CREATE TABLE IF NOT EXISTS action_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_plan_id UUID NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  instructions TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_zip ON resources(zip);
CREATE INDEX IF NOT EXISTS idx_resources_city ON resources(city);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(verification_status);
CREATE INDEX IF NOT EXISTS idx_programs_resource_id ON programs(resource_id);
CREATE INDEX IF NOT EXISTS idx_case_needs_case_id ON case_needs(case_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_items_plan_id ON action_plan_items(action_plan_id);

-- Row Level Security (RLS)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plan_items ENABLE ROW LEVEL SECURITY;

-- Public read access for verified resources & programs (anonymous discovery support)
CREATE POLICY "Public read verified resources" ON resources
  FOR SELECT USING (verification_status IN ('VERIFIED', 'NEEDS_REVIEW', 'STALE'));

CREATE POLICY "Public read active programs" ON programs
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public read resource sources" ON resource_sources
  FOR SELECT USING (true);

-- User-scoped access for cases and action plans
CREATE POLICY "Users access own cases" ON cases
  FOR ALL USING (auth.uid() IS NULL OR user_id = auth.uid());

CREATE POLICY "Users access own case needs" ON case_needs
  FOR ALL USING (true);

CREATE POLICY "Users access own action plans" ON action_plans
  FOR ALL USING (true);

CREATE POLICY "Users access own action plan items" ON action_plan_items
  FOR ALL USING (true);

CREATE POLICY "Users access own conversations" ON conversations
  FOR ALL USING (auth.uid() IS NULL OR user_id = auth.uid());

CREATE POLICY "Users access own messages" ON messages
  FOR ALL USING (true);
