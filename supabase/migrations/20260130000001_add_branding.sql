-- Add branding fields to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#2563EB', -- Default Blue
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#FDFDFD'; -- Default Off-white
