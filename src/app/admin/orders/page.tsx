import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { OrderList } from '@/components/admin/OrderList';
import { Order, OrderItem } from '@/types';
import { redirect } from 'next/navigation';

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login');
    }

    // Fetch orders with their items and products
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', JSON.stringify(error, null, 2));
    }

    return (
        <div className="min-h-screen bg-secondary/30">
            <AdminHeader userEmail={user.email} />

            <main className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Daftar Pesanan</h1>
                    <p className="text-muted-foreground">
                        Kelola pesanan pelanggan dan kirim data akun secara semi-otomatis via WhatsApp.
                    </p>
                </div>

                <OrderList initialOrders={(orders as (Order & { order_items: OrderItem[] })[]) || []} />
            </main>
        </div>
    );
}
