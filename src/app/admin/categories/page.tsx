import { CategoryList } from '@/components/admin/CategoryList';

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
        <p className="text-muted-foreground">
          Kelola kategori produk untuk memudahkan pelanggan mencari barang.
        </p>
      </div>
      <CategoryList />
    </div>
  );
}
