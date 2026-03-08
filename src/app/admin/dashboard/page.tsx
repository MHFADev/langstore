import { createClient } from '@/lib/supabase/server';
import { ProductList } from '@/components/admin/ProductList';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Product, StoreSettings } from '@/types';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart, ExternalLink } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const [productsResult, settingsResult] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('store_settings').select('*').single()
  ]);

  const products = productsResult.data;
  const settings = settingsResult.data as StoreSettings | null;

  if (productsResult.error) {
    console.error('Error fetching products (Dashboard):', JSON.stringify(productsResult.error, null, 2));
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminHeader userEmail={user.email} />

      <main className="container mx-auto py-10 px-4 space-y-8">
        {/* Analytics Section */}
        {settings?.analytics_embed_url ? (
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Statistik Toko (Google Looker Studio)</h3>
              </div>
              <a 
                href={settings.analytics_embed_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                Buka Layar Penuh <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-muted/10">
              <iframe 
                src={settings.analytics_embed_url} 
                className="absolute inset-0 w-full h-full border-0" 
                allowFullScreen
                title="Store Analytics"
              ></iframe>
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-500">
            <BarChart className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <h3 className="font-semibold text-foreground">Analitik Belum Dikonfigurasi</h3>
              <p className="text-sm">Tambahkan URL embed Google Looker Studio untuk melihat statistik toko.</p>
            </div>
            <Link href="/admin/settings" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
              Konfigurasi Sekarang
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Produk</h1>
            <p className="text-muted-foreground">
              Kelola katalog produk toko Anda di sini.
            </p>
          </div>
        </div>

        <ProductList initialProducts={(products as Product[]) || []} />
      </main>
    </div>
  );
}
