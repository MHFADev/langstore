-- Add analytics_embed_url column to store_settings table
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS analytics_embed_url TEXT;

-- Refresh the schema cache if needed (though Supabase usually handles this automatically)
NOTIFY pgrst, 'reload config';
