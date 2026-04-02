-- ================================================================
-- IRON CORE: FULL DB SYNC & HARDENING SCRIPT
-- Run this ENTIRE script in your Supabase SQL Editor
-- It is safe to run multiple times (idempotent)
-- ================================================================

-- ----------------------------------------------------------------
-- SECTION 1: Ensure all columns exist on customers table
-- ----------------------------------------------------------------
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS joining_date TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS subscription_start TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS subscription_end TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- ----------------------------------------------------------------
-- SECTION 1.5: Drop NOT NULL on legacy camelCase columns (migration fix)
-- ----------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.customers ALTER COLUMN "fullName" DROP NOT NULL;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;
  BEGIN
    ALTER TABLE public.customers ALTER COLUMN "joiningDate" DROP NOT NULL;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;
  BEGIN
    ALTER TABLE public.customers ALTER COLUMN "subscriptionPlan" DROP NOT NULL;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;
  BEGIN
    ALTER TABLE public.customers ALTER COLUMN "subscriptionStart" DROP NOT NULL;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;
  BEGIN
    ALTER TABLE public.customers ALTER COLUMN "subscriptionEnd" DROP NOT NULL;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;

  -- Also check payments table legacy columns
  BEGIN
    ALTER TABLE public.payments ALTER COLUMN "customerName" DROP NOT NULL;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;
  BEGIN
    ALTER TABLE public.payments ALTER COLUMN "paymentDate" DROP NOT NULL;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;
END $$;

-- ----------------------------------------------------------------
-- SECTION 2: Ensure all columns exist on payments table
-- ----------------------------------------------------------------
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_date TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- ----------------------------------------------------------------
-- SECTION 3: Ensure staff table exists with all columns
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text,
  phone text,
  salary numeric,
  joining_date text,
  address text,
  id_proof text,
  photo text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------
-- SECTION 4: Ensure expenses table exists with all columns
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL,
  date text NOT NULL,
  description text,
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------
-- SECTION 5: Enable RLS on all tables
-- ----------------------------------------------------------------
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- SECTION 6: Drop all old policies (clean slate)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public delete customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated user to read own customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated user to insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated user to update own customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated user to delete own customers" ON public.customers;
DROP POLICY IF EXISTS "Manage customers" ON public.customers;

DROP POLICY IF EXISTS "Allow public read payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public insert payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public update payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public delete payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated user to read own payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated user to insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated user to update own payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated user to delete own payments" ON public.payments;
DROP POLICY IF EXISTS "Manage payments" ON public.payments;

DROP POLICY IF EXISTS "Users can view their own staff" ON public.staff;
DROP POLICY IF EXISTS "Users can insert their own staff" ON public.staff;
DROP POLICY IF EXISTS "Users can update their own staff" ON public.staff;
DROP POLICY IF EXISTS "Users can delete their own staff" ON public.staff;
DROP POLICY IF EXISTS "Manage staff" ON public.staff;

DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Manage expenses" ON public.expenses;

-- ----------------------------------------------------------------
-- SECTION 7: Create unified RLS policies (super_admin aware)
-- ----------------------------------------------------------------
CREATE POLICY "Manage customers" ON public.customers
  FOR ALL TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  );

CREATE POLICY "Manage payments" ON public.payments
  FOR ALL TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  );

CREATE POLICY "Manage staff" ON public.staff
  FOR ALL TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  );

CREATE POLICY "Manage expenses" ON public.expenses
  FOR ALL TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  );

-- ----------------------------------------------------------------
-- SECTION 8: approved_emails security
-- ----------------------------------------------------------------
ALTER TABLE public.approved_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for self" ON public.approved_emails;
CREATE POLICY "Allow select for self" ON public.approved_emails
  FOR SELECT USING (email = COALESCE(auth.jwt() ->> 'email', ''));

-- ----------------------------------------------------------------
-- SECTION 9: Storage bucket for avatars
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can update avatars" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated Users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated Users can update avatars" ON storage.objects
  FOR UPDATE TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- ================================================================
-- DONE. All tables, columns, and policies are now in sync.
-- ================================================================
