
-- Add missing columns for SEO and OG Image
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS site_meta_image TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS site_keywords TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS google_analytics_id TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS google_search_console_id TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
