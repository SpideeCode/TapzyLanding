-- Add font_color to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS font_color TEXT DEFAULT '#1E293B'; -- Default Slate-800
