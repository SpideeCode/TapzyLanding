-- Fix Public Access for Authenticated Users (Admins viewing other menus)

-- 1. Restaurants
DROP POLICY IF EXISTS "Public can view restaurants" ON public.restaurants;
CREATE POLICY "Public can view restaurants" ON public.restaurants
    FOR SELECT USING (true); -- Applies to ALL roles (anon + authenticated)

-- 2. Menu Categories
DROP POLICY IF EXISTS "Public can view menus" ON public.menus_categories;
CREATE POLICY "Public can view menus" ON public.menus_categories
    FOR SELECT USING (true);

-- 3. Items
DROP POLICY IF EXISTS "Public can view items" ON public.items;
CREATE POLICY "Public can view items" ON public.items
    FOR SELECT USING (true);

-- 4. Tables
DROP POLICY IF EXISTS "Public can view tables" ON public.tables;
CREATE POLICY "Public can view tables" ON public.tables
    FOR SELECT USING (true);
