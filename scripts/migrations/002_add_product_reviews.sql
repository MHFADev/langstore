-- Migration: 002_add_product_reviews.sql
-- Description: Add a table for product reviews with RLS

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='product_reviews' AND policyname='Reviews are viewable by everyone') THEN
    CREATE POLICY "Reviews are viewable by everyone" ON public.product_reviews FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='product_reviews' AND policyname='Users can insert own reviews') THEN
    CREATE POLICY "Users can insert own reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
