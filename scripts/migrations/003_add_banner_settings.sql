-- Add banner columns to store_settings table
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS banner_active BOOLEAN DEFAULT true;
