import { createClient } from '@/lib/supabase/server';
import { CheckoutForm } from '@/components/ui/CheckoutForm';
import { Header } from '@/components/layout/Header';
import { Product, StoreSettings } from '@/types';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';

interface CheckoutPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(
    { params }: CheckoutPageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = (await params).id;

    // fetch data
    const supabase = await createClient();
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
    
    // fetch store settings for default image
    const { data: settings } = await supabase
        .from('store_settings')
        .select('*')
        .single();

    if (!product) {
        return {
            title: 'Produk Tidak Ditemukan | LANG STR',
        };
    }

    // optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    const productTitle = `${product.name} | LANG STR`;
    const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price);
    
    // Description with Price
    const productDescription = `Beli ${product.name} hanya ${priceFormatted}. ${product.description 
        ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')
        : 'Proses cepat, aman, dan terpercaya di LANG STR.'}`;
    
    // We let opengraph-image.tsx handle the image generation dynamically
    // But we provide a fallback if needed in the array structure if Next.js doesn't pick it up automatically (it should)
    // Actually, by returning openGraph without images here, Next.js will use the file-based one.
    
    return {
        title: productTitle,
        description: productDescription,
        openGraph: {
            title: productTitle,
            description: productDescription,
            // images: handled by opengraph-image.tsx
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: productTitle,
            description: productDescription,
            // images: handled by opengraph-image.tsx
        },
    };
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
