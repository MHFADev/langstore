import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { Product, StoreSettings } from '@/types';
import { Sparkles, Gamepad2, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient();
  
  const [productsResult, settingsResult] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('store_settings').select('*').single()
  ]);

  const products = productsResult.data;
  const error = productsResult.error;
  const settings = settingsResult.data as StoreSettings | null;

  if (error) {
    console.error('Error fetching products (Home):', JSON.stringify(error, null, 2));
  }

  // Ensure products have category field
  const processedProducts = (products as Product[])?.map(p => ({
    ...p,
    category: p.category || 'Game Account' // Default fallback
  })) || [];

  const showCustomBanner = settings?.banner_active && settings?.banner_url;

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-background pt-24 pb-20 md:pt-36 md:pb-32">
        {/* Custom Banner Background if Active */}
        {showCustomBanner && settings?.banner_url && (
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40 z-10"></div>
             <Image 
               src={settings.banner_url} 
               alt={settings.banner_title || 'Hero Banner'} 
               fill 
               className="object-cover opacity-40 blur-[2px] scale-105"
               priority
             />
          </div>
        )}

        {/* Background Gradients (Default) */}
        {!showCustomBanner && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-transparent blur-[100px] rounded-full mix-blend-multiply"></div>
          </div>
        )}

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
            {settings?.banner_title ? (
              settings.banner_title
            ) : (
              <>
                Digital Store <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">Premium</span> <br />
                Kebutuhan Gaming Anda
              </>
            )}
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150 drop-shadow-sm">
            {settings?.banner_description || "Temukan Akun Game Sultan, Top Up Termurah, Jasa Joki Terpercaya, dan Aplikasi Premium legal dengan proses instan."}
          </p>

          <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <a href="#catalog" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              Eksplorasi Katalog
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-border/50 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 animate-in fade-in duration-1000 delay-500">
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
          </div>
        </div>
      </div>

      <main id="catalog" className="flex-1 container mx-auto px-4 md:px-8 py-12 md:py-24 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-[family-name:var(--font-space-grotesk)]">
            Katalog Premium
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pilih kategori dan temukan produk digital incaranmu hari ini.
          </p>
        </div>

        {processedProducts.length > 0 ? (
          <ProductGrid products={processedProducts} />
        ) : (
          <div className="flex h-80 flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-primary/20 bg-secondary/30 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="rounded-2xl bg-primary/10 p-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">Katalog masih kosong, admin sedang menyiapkan produk terbaik.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-primary/10 bg-secondary/30 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
        <div className="container relative mx-auto flex flex-col items-center justify-between gap-6 md:flex-row px-4 md:px-8 z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg font-[family-name:var(--font-space-grotesk)]">LANG STR</span>
            <span className="text-sm font-medium text-muted-foreground">
              &copy; {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
          <div className="flex gap-6">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors">Instagram</span>
            <span className="text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors">Tiktok</span>
            <span className="text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors">WhatsApp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
