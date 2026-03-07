-- ============================================================
-- Lang STR - Full Production Schema (Idempotent)
-- Safe to run multiple times. All operations use IF NOT EXISTS.
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES (Extends Supabase Auth)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 2. CATEGORIES (Dynamic Categories)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default categories
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Game Account', 'game-account', 'Akun game premium siap pakai'),
  ('Top Up', 'top-up', 'Top up diamond, UC, dan currency game lainnya'),
  ('Joki', 'joki', 'Jasa joki rank terpercaya'),
  ('Premium App', 'premium-app', 'Aplikasi premium legal'),
  ('Other', 'other', 'Produk digital lainnya')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 3. PRODUCTS (Enhanced)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12, 2) CHECK (compare_at_price > price), -- Harga coret
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'Game Account', 
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 1, -- Simple inventory management
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexible field for specific product details (e.g. rank, server)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. ORDERS & TRANSACTIONS (Basic Structure)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest checkout
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'cancelled')),
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  price_at_time NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. RLS POLICIES (Security)
-- ==========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Public profiles are viewable by everyone') THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- CATEGORIES policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='Categories are viewable by everyone') THEN
    CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='Admins can insert categories') THEN
    CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='Admins can update categories') THEN
    CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- PRODUCTS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Products are viewable by everyone') THEN
    CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Admins can insert products') THEN
    CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Admins can update products') THEN
    CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Admins can delete products') THEN
    CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ORDERS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users can view own orders') THEN
    CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Admins can view all orders') THEN
    CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Anyone can create orders') THEN
    CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ORDER ITEMS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='Admins can manage order items') THEN
    CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='Anyone can insert order items') THEN
    CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ==========================================
-- 6. STORE SETTINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Only one row allowed
  payment_qris_url TEXT,
  payment_bank_name TEXT,
  payment_account_number TEXT,
  payment_account_name TEXT,
  payment_dana_number TEXT,
  payment_gopay_number TEXT,
  whatsapp_number_admin TEXT,
  favicon_url TEXT,
  site_title TEXT,
  site_description TEXT,
  site_meta_image TEXT,
  site_keywords TEXT,
  google_analytics_id TEXT,
  google_search_console_id TEXT,
  canonical_url TEXT,
  banner_url TEXT,
  banner_title TEXT,
  banner_description TEXT,
  banner_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already created
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS site_title TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS site_description TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS site_meta_image TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS site_keywords TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS google_analytics_id TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS google_search_console_id TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS banner_title TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS banner_description TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS banner_active BOOLEAN DEFAULT true;

-- Seed initial settings row
INSERT INTO public.store_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='store_settings' AND policyname='Store settings viewable by everyone') THEN
    CREATE POLICY "Store settings viewable by everyone" ON public.store_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='store_settings' AND policyname='Admins can update store settings') THEN
    CREATE POLICY "Admins can update store settings" ON public.store_settings FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='store_settings' AND policyname='Admins can insert store settings') THEN
    CREATE POLICY "Admins can insert store settings" ON public.store_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- ==========================================
-- 7. STORAGE BUCKETS (Setup)
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public storage access
DO $$ BEGIN
  -- Products bucket
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Public Access for Products') THEN
    CREATE POLICY "Public Access for Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Admin Access for Products') THEN
    CREATE POLICY "Admin Access for Products" ON storage.objects FOR ALL USING (bucket_id = 'products' AND auth.role() = 'authenticated');
  END IF;

  -- Settings bucket
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Public Access for Settings') THEN
    CREATE POLICY "Public Access for Settings" ON storage.objects FOR SELECT USING (bucket_id = 'settings');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Admin Access for Settings') THEN
    CREATE POLICY "Admin Access for Settings" ON storage.objects FOR ALL USING (bucket_id = 'settings' AND auth.role() = 'authenticated');
  END IF;
END $$;
