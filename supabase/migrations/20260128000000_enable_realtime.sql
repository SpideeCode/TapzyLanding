-- FORCE ENABLE REALTIME
-- Execute this in the Supabase SQL Editor if updates are not appearing instantly

-- 1. Ensure the publication exists and covers the required tables
-- We drop and recreate it to be absolutely sure it's fresh and correct
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.orders, public.order_items;

-- 2. Ensure REPLICA IDENTITY is set to FULL
-- This is critical for filtering by restaurant_id in the realtime stream
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;

-- 3. Verify RLS for REALTIME (Staff must be able to SELECT the rows to receive updates)
-- The existing "Tenancy select" policy handles this.
-- Make sure the logged-in staff has a restaurant_id in their profiles table!
-- SELECT id, email, restaurant_id FROM public.profiles;
