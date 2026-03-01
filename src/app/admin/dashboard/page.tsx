import { createClient } from '@/lib/supabase/server';
import { ProductList } from '@/components/admin/ProductList';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Product } from '@/types';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products (Dashboard):', JSON.stringify(error, null, 2));
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminHeader userEmail={user.email} />

      <main className="container mx-auto py-10 px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
