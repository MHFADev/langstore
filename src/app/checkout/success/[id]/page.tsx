import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { StoreSettings, Order, OrderItem } from '@/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { CopyButton } from '@/components/ui/CopyButton';

interface SuccessPageProps {
    params: Promise<{ id: string }>;
}

export default async function SuccessPage({ params }: SuccessPageProps) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const supabase = await createClient();

    // Fetch order with its items and product details
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
        .eq('id', id)
        .single();

    if (orderError || !orderData) {
        console.error('Order not found:', orderError);
        notFound();
    }

    const order = orderData as Order;
    const items = orderData.order_items as OrderItem[];
    const mainItem = items[0]; // Assuming 1 type of product per checkout for now

    // Fetch store settings for payment details
    const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

    const settings = storeSettings as StoreSettings;

    const renderPaymentInstructions = () => {
        switch (order.payment_method) {
            case 'qris':
                return (
                    <div className="flex flex-col items-center space-y-6 py-4">
                        <div className="text-center space-y-1">
                            <p className="text-lg font-bold text-foreground">Scan QRIS</p>
                            <p className="text-sm text-muted-foreground">Gunakan aplikasi e-wallet atau mobile banking apa saja.</p>
                        </div>
                        
                        {settings?.payment_qris_url ? (
                            <div className="relative w-full max-w-sm aspect-[3/4] md:aspect-square bg-white rounded-3xl shadow-2xl p-6 border-4 border-white ring-1 ring-black/5 transform hover:scale-[1.02] transition-transform duration-300">
                                <div className="absolute inset-0 border-b-[16px] border-primary/10 pointer-events-none"></div>
                                <Image 
                                    src={settings.payment_qris_url} 
                                    alt="Scan QRIS Langstore" 
                                    fill 
                                    className="object-contain p-4" 
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="w-full h-64 flex items-center justify-center bg-destructive/10 rounded-xl border border-destructive/20">
                                <p className="text-destructive font-medium flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                                    QRIS belum diatur
                                </p>
                            </div>
                        )}
                        
                        <div className="bg-primary/5 px-4 py-3 rounded-xl border border-primary/10 max-w-xs text-center">
                            <p className="text-xs text-primary font-medium">
                                💡 Tips: Screenshot layar ini jika Anda ingin membayar nanti.
                            </p>
                        </div>
                    </div>
                );
            case 'transfer_bank':
                return (
                    <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Transfer ke Rekening Bank:</p>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase">{settings?.payment_bank_name || 'Bank'}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-lg font-bold font-mono text-foreground">{settings?.payment_account_number || '-'}</p>
                                {settings?.payment_account_number && <CopyButton text={settings.payment_account_number} />}
                            </div>
                            <p className="text-sm text-foreground mt-1">a/n {settings?.payment_account_name || '-'}</p>
                        </div>
                    </div>
                );
            case 'dana':
                return (
                    <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Transfer ke DANA:</p>
                        <div>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-lg font-bold font-mono text-foreground">{settings?.payment_dana_number || '-'}</p>
                                {settings?.payment_dana_number && <CopyButton text={settings.payment_dana_number} />}
                            </div>
                        </div>
                    </div>
                );
            case 'gopay':
                return (
                    <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Transfer ke GoPay:</p>
                        <div>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-lg font-bold font-mono text-foreground">{settings?.payment_gopay_number || '-'}</p>
                                {settings?.payment_gopay_number && <CopyButton text={settings.payment_gopay_number} />}
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="bg-secondary/30 p-4 rounded-xl text-center">
                        <p className="text-sm font-medium">Metode pembayaran manual.</p>
                        <p className="text-xs text-muted-foreground mt-1">Admin akan menghubungi Anda via WhatsApp.</p>
                    </div>
                );
        }
    };

    const contactAdminUrl = `https://wa.me/${settings?.whatsapp_number_admin || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Halo%20Admin,%20saya%20sudah%20membayar%20pesanan%20dengan%20Order%20ID:%20${order.id}`;

    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex justify-center relative">
                {/* Background Accents */}
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-secondary/80 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                <div className="w-full max-w-2xl bg-card/60 backdrop-blur-md border border-primary/20 rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-primary/10">

                    {/* Header Status */}
                    <div className="text-center mb-10 pb-8 border-b border-border/50 relative">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 text-yellow-500 mb-6 shadow-lg shadow-yellow-500/20 ring-4 ring-yellow-500/5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        </div>
                        <h1 className="text-3xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-foreground">Menunggu Pembayaran</h1>
                        <p className="text-muted-foreground mt-3 text-lg">Segera selesaikan pembayaran agar pesanan diproses.</p>
                        <div className="mt-6 flex justify-center items-center gap-3">
                            <span className="text-xs bg-primary/10 px-3 py-1.5 rounded-lg text-primary font-bold uppercase tracking-wider border border-primary/20">Order ID</span>
                            <span className="text-sm font-mono font-bold bg-secondary px-3 py-1.5 rounded-lg">{order.id}</span>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold mb-6 font-[family-name:var(--font-space-grotesk)] flex items-center gap-2">
                            <span className="bg-primary/20 text-primary p-1 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                            </span>
                            Instruksi Pembayaran
                        </h2>
                        <div className="mb-8 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-2xl p-5 shadow-sm">
                            <span className="text-sm text-foreground font-semibold">Total Pembayaran</span>
                            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground font-mono">
                                Rp {Number(order.total_amount).toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="bg-gradient-to-b from-secondary/20 to-secondary/5 rounded-3xl p-1 border border-white/10 shadow-inner">
                            <div className="bg-background/50 backdrop-blur-sm rounded-[1.4rem] p-6 md:p-8">
                                {renderPaymentInstructions()}
                            </div>
                        </div>
                    </div>

                    {/* Item Checkout Detail */}
                    <div className="mb-10 pt-8 border-t border-border/50">
                        <h2 className="text-sm font-bold text-muted-foreground mb-5 uppercase tracking-wider">Detail Produk</h2>
                        <div className="flex gap-5 items-center bg-secondary/30 p-4 rounded-2xl border border-primary/5">
                            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted flex-shrink-0 shadow-sm">
                                {mainItem?.product?.image_url ? (
                                    <Image src={mainItem.product.image_url} alt="Product" fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-secondary"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-foreground text-lg leading-tight mb-1">{mainItem?.product?.name || 'Produk'}</p>
                                <p className="text-sm text-muted-foreground font-medium">Qty: <span className="text-foreground">{mainItem?.quantity}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Action Call */}
                    <div className="flex flex-col gap-4 mt-8">
                        <a
                            href={contactAdminUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative overflow-hidden inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-5 font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            <span className="relative z-10 flex items-center gap-2 text-base font-[family-name:var(--font-space-grotesk)] tracking-wide">
                                Saya Sudah Bayar (Konfirmasi WA)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </span>
                        </a>
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-center">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Pesanan (Data Akun) akan dikirimkan otomatis ke WhatsApp Anda <br />
                                <b className="text-foreground font-mono mt-1 inline-block bg-secondary px-2 rounded">{order.customer_whatsapp}</b>
                                <br />setelah dicek oleh Admin.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
