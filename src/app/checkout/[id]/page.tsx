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
    const productDescription = product.description 
        ? product.description.substring(0, 160) + (product.description.length > 160 ? '...' : '')
        : `Beli ${product.name} dengan harga terbaik di LANG STR. Proses cepat dan aman.`;
    
    const productImage = product.image_url || settings?.site_meta_image || '/opengraph-image.png';

    return {
        title: productTitle,
        description: productDescription,
        openGraph: {
            title: productTitle,
            description: productDescription,
            images: [
                {
                    url: productImage,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
                ...previousImages,
            ],
            type: 'website', // Product pages can use 'article' or 'website', but 'website' is safer for general sharing
        },
        twitter: {
            card: 'summary_large_image',
            title: productTitle,
            description: productDescription,
            images: [productImage],
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
