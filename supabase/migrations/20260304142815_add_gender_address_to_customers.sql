-- Add gender and address columns to the customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;
