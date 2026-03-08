import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { HeroCarousel } from '@/components/ui/HeroCarousel';
import { Product, StoreSettings, Banner } from '@/types';
import { Sparkles, Gamepad2, ShieldCheck, Zap, MessageCircle, Loader2 } from 'lucide-react';
import { FramerWrapper } from '@/components/ui/FramerWrapper';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home(props: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const searchParams = await props.searchParams;
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category : 'All';
  const supabase = await createClient();

  // Define base queries
  let productsQuery = supabase.from('products').select('*').order('created_at', { ascending: false });
  
  // Apply database filter if a category is selected and not 'All'
  if (selectedCategory !== 'All') {
    productsQuery = productsQuery.eq('category', selectedCategory);
  }

  const [productsResult, settingsResult, bannersResult, categoriesResult] = await Promise.all([
    productsQuery,
    supabase.from('store_settings').select('*').single(),
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('products').select('category') // To get all unique categories even when filtered
  ]);

  const products = productsResult.data;
  const error = productsResult.error;
  const settings = settingsResult.data as StoreSettings | null;
  const banners = (bannersResult.data || []) as Banner[];
  
  // Get all unique categories from all products to show in the filter
  const allCategories = ['All', ...Array.from(new Set((categoriesResult.data || []).map(p => p.category || 'Other')))];

  if (error) {
    console.error('Error fetching products (Home):', JSON.stringify(error, null, 2));
  }

  // Ensure products have category field
  const processedProducts = (products as Product[])?.map(p => ({
    ...p,
    category: p.category || 'Other' // Standardized fallback
  })) || [];

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-background pt-24 pb-20 md:pt-36 md:pb-32">
        {/* Standard Background Effects (Always Visible) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-transparent blur-[100px] rounded-full mix-blend-multiply"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-[15%] text-primary/20 animate-pulse hidden md:block z-10">
          <Gamepad2 className="w-16 h-16 rotate-12" />
        </div>
        <div className="absolute bottom-20 right-[15%] text-accent-foreground/20 animate-bounce hidden md:block z-10" style={{ animationDuration: '3s' }}>
          <Sparkles className="w-12 h-12 -rotate-12" />
        </div>

        <div className="container relative mx-auto px-4 md:px-8 text-center z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 backdrop-blur-sm">
            <Zap className="w-4 h-4" />
            <span>Instant Delivery & Auto Confirm</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl font-[family-name:var(--font-space-grotesk)] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 drop-shadow-sm">
            {settings?.site_title ? (
              settings.site_title
            ) : (
              <>
                LangSTR
              </>
            )}
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150 drop-shadow-sm">
            {settings?.site_description || "Marketplace Terpercaya untuk Jual Beli Akun Game, Nokos, dan Aplikasi Premium dengan Aman dan Cepat."}
          </p>

          <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <a href="#catalog" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              Eksplorasi Katalog
            </a>
          </div>

          {/* Dynamic Banner Carousel */}
          {banners.length > 0 && (
            <FramerWrapper y={50} delay={0.8} className="mt-16 mx-auto max-w-5xl">
              <HeroCarousel banners={banners} />
            </FramerWrapper>
          )}

          <FramerWrapper
            y={20}
            delay={1}
            className="mt-16 pt-8 border-t border-border/50 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
              100% Aman & Legal
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Zap className="w-5 h-5 text-primary" />
              Proses Otomatis
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              Harga Bersaing
            </div>
          </FramerWrapper>
        </div>
      </div>

      <main id="catalog" className="flex-1 container mx-auto px-4 md:px-8 py-12 md:py-24 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <FramerWrapper y={30} className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-[family-name:var(--font-space-grotesk)]">
            Katalog Premium
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pilih kategori dan temukan produk digital incaranmu hari ini.
          </p>
        </FramerWrapper>

        <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
          <ProductGrid products={processedProducts} allCategories={allCategories} />
        </Suspense>
      </main>

      <Footer settings={settings} />

      {/* Floating WhatsApp Channel Button */}
      {settings?.whatsapp_channel_url && (
        <a
          href={settings.whatsapp_channel_url}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-xl hover:shadow-green-500/50 group"
          aria-label="Join WhatsApp Channel"
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping"></div>
          <MessageCircle className="h-7 w-7" />
          <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-md group-hover:block animate-in slide-in-from-right-2">
            Join Channel WA
          </span>
        </a>
      )}
    </div>
  );
}
