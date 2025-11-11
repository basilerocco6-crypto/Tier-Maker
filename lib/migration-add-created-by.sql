-- Migration: Add created_by column to tier_list_templates table
-- Run this in your Supabase SQL Editor if the table already exists

-- Add created_by column if it doesn't exist
ALTER TABLE tier_list_templates 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Add index for better performance when querying by creator
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON tier_list_templates(created_by);

