-- Add ai_evaluation column to leads table
ALTER TABLE leads
ADD COLUMN ai_evaluation JSONB;

-- Create an index on ai_evaluation to allow querying by specific JSON fields if needed
CREATE INDEX idx_leads_ai_evaluation ON leads USING gin(ai_evaluation);
