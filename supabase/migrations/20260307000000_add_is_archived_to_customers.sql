-- Add `is_archived` column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
