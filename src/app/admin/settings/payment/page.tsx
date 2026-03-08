import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { BannerManager } from '@/components/admin/BannerManager';
import { StoreSettings } from '@/types';
import { redirect } from 'next/navigation';

export default async function PaymentSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login');
    }

    // Fetch store settings (ID 1 is the singleton row)
    const { data: storeSettings, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching store settings:', error);
    }

    return (
        <div className="min-h-screen bg-secondary/30">
            <AdminHeader userEmail={user.email} />

            <main className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan Toko & Banner</h1>
                    <p className="text-muted-foreground">
                        Kelola banner halaman depan, metode pembayaran, dan informasi toko lainnya.
                    </p>
                </div>

                <div className="lg:max-w-4xl space-y-10">
                    <BannerManager />
                    <StoreSettingsForm initialSettings={(storeSettings as StoreSettings) || null} />
                </div>
            </main>
        </div>
    );
}
