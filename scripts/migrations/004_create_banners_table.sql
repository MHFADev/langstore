-- Create Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='banners' AND policyname='Public can view active banners') THEN
    CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='banners' AND policyname='Admins can manage banners') THEN
    CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Storage Bucket Setup (Ensure 'settings' bucket exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Public Access for Settings') THEN
    CREATE POLICY "Public Access for Settings" ON storage.objects FOR SELECT USING (bucket_id = 'settings');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Admin Access for Settings') THEN
    CREATE POLICY "Admin Access for Settings" ON storage.objects FOR ALL USING (bucket_id = 'settings' AND auth.role() = 'authenticated');
  END IF;
END $$;
