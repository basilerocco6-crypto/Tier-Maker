-- Supabase Database Schema for Tier List App
-- Run this in your Supabase SQL Editor

-- Create TierListTemplate table
CREATE TABLE IF NOT EXISTS tier_list_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'open_for_submission')),
  access_type TEXT NOT NULL CHECK (access_type IN ('free', 'paid')),
  price INTEGER, -- in cents
  tier_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  item_bank JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_placement JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create TierListSubmission table
CREATE TABLE IF NOT EXISTS tier_list_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES tier_list_templates(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Whop user ID
  user_placement JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id) -- One submission per user per template
);

-- Create UserPaidAccess table
CREATE TABLE IF NOT EXISTS user_paid_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Whop user ID
  template_id UUID NOT NULL REFERENCES tier_list_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_id) -- One access record per user per template
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_template_id ON tier_list_submissions(template_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON tier_list_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_paid_access_user_id ON user_paid_access(user_id);
CREATE INDEX IF NOT EXISTS idx_paid_access_template_id ON user_paid_access(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_status ON tier_list_templates(status);

-- Enable Row Level Security (RLS)
ALTER TABLE tier_list_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_list_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_paid_access ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
-- For now, we'll handle auth in the API routes using service role
-- You can customize these policies as needed

