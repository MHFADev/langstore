
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'whatsapp_channel_url') THEN
        ALTER TABLE public.store_settings ADD COLUMN whatsapp_channel_url TEXT;
    END IF;
END $$;
