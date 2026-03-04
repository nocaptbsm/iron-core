-- Add user_id column to customers and payments
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for customers
DROP POLICY IF EXISTS "Allow public read customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public delete customers" ON public.customers;

CREATE POLICY "Allow authenticated user to read own customers" 
ON public.customers FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user to insert own customers" 
ON public.customers FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user to update own customers" 
ON public.customers FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user to delete own customers" 
ON public.customers FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Update RLS policies for payments
DROP POLICY IF EXISTS "Allow public read payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public insert payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public update payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public delete payments" ON public.payments;

CREATE POLICY "Allow authenticated user to read own payments" 
ON public.payments FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user to insert own payments" 
ON public.payments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user to update own payments" 
ON public.payments FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user to delete own payments" 
ON public.payments FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
