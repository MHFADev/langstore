
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'link_url') THEN
        ALTER TABLE public.banners ADD COLUMN link_url TEXT;
    END IF;
END $$;
