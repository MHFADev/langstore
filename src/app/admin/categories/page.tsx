import { createClient } from '@/lib/supabase/server';
import { CategoryList } from '@/components/admin/CategoryList';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminHeader userEmail={user.email} />

      <main className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manajemen Kategori</h1>
          <p className="text-muted-foreground">
            Kelola kategori produk untuk memudahkan pelanggan mencari barang.
          </p>
        </div>

        <CategoryList />
      </main>
    </div>
  );
}
