-- ================================================================
-- IRON CORE: USER LINKS (Shared Gym Access)
-- Allows two or more emails to read/write the same gym data.
-- Run this ENTIRE script in your Supabase SQL Editor.
-- It is safe to run multiple times (idempotent).
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Create user_links table
--    Maps a secondary user's auth.uid() → primary owner's auth.uid()
--    Primary owners do NOT need a row here (they default to self).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_links (
  user_id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 2. Secure user_links: each user can only read their own row
-- ----------------------------------------------------------------
ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own link" ON public.user_links;
CREATE POLICY "Read own link" ON public.user_links
  FOR SELECT USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 3. Update RLS on all 4 data tables to honour user_links
--    A user may access rows where:
--      a) they ARE the owner (user_id = auth.uid()), OR
--      b) their user_links entry points to the owner, OR
--      c) they are a super_admin
-- ----------------------------------------------------------------

-- Customers
DROP POLICY IF EXISTS "Manage customers" ON public.customers;
CREATE POLICY "Manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id = (SELECT target_user_id FROM public.user_links WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR user_id = (SELECT target_user_id FROM public.user_links WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  );

-- Payments
DROP POLICY IF EXISTS "Manage payments" ON public.payments;
CREATE POLICY "Manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id = (SELECT target_user_id FROM public.user_links WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR user_id = (SELECT target_user_id FROM public.user_links WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  );

-- Staff
DROP POLICY IF EXISTS "Manage staff" ON public.staff;
CREATE POLICY "Manage staff" ON public.staff
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id = (SELECT target_user_id FROM public.user_links WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR user_id = (SELECT target_user_id FROM public.user_links WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  );

-- Expenses
DROP POLICY IF EXISTS "Manage expenses" ON public.expenses;
CREATE POLICY "Manage expenses" ON public.expenses
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id = (SELECT target_user_id FROM public.user_links WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR user_id = (SELECT target_user_id FROM public.user_links WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.approved_emails
      WHERE email = COALESCE(auth.jwt() ->> 'email', '') AND role = 'super_admin'
    )
  );

-- ================================================================
-- DONE.
-- To link two emails, find their UUIDs and insert:
--   INSERT INTO public.user_links (user_id, target_user_id)
--   VALUES ('<secondary-user-uuid>', '<primary-owner-uuid>');
-- ================================================================
