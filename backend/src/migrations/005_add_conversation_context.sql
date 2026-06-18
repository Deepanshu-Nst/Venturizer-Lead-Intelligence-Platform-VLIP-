-- Add conversation_context JSONB column to leads table

ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversation_context JSONB DEFAULT '{}'::jsonb;
