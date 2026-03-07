import { createClient } from '@/lib/supabase/server';
import { CheckoutForm } from '@/components/ui/CheckoutForm';
import { Header } from '@/components/layout/Header';
import { Product, StoreSettings } from '@/types';
import { notFound } from 'next/navigation';

interface CheckoutPageProps {
    params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const supabase = await createClient();

    // Fetch product
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (productError || !product) {
        notFound();
    }

    // Fetch store settings
    const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                <CheckoutForm
                    product={product as Product}
                    storeSettings={(storeSettings as StoreSettings) || null}
                />
            </main>

            <footer className="border-t bg-secondary/30 py-8">
                <div className="container mx-auto text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                        &copy; {new Date().getFullYear()} LANG STR. Secure Checkout.
                    </p>
                </div>
            </footer>
        </div>
    );
}
