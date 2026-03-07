'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product, StoreSettings } from '@/types';
import Image from 'next/image';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { WhatsAppShareButton } from './WhatsAppShareButton';

interface CheckoutFormProps {
    product: Product;
    storeSettings: StoreSettings | null;
}

export function CheckoutForm({ product, storeSettings }: CheckoutFormProps) {
    const [waNumber, setWaNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('qris');
    const [isLoading, setIsLoading] = useState(false);
    const [errorInput, setErrorInput] = useState('');
    const [productUrl, setProductUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProductUrl(window.location.href);
        }
    }, []);

    const router = useRouter();
    const supabase = createClient();

    const getAvailablePaymentMethods = () => {
        const methods = [];
        if (storeSettings?.payment_qris_url) methods.push({ id: 'qris', name: 'QRIS' });
        if (storeSettings?.payment_bank_name && storeSettings?.payment_account_number) methods.push({ id: 'transfer_bank', name: 'Transfer Bank' });
        if (storeSettings?.payment_dana_number) methods.push({ id: 'dana', name: 'DANA' });
        if (storeSettings?.payment_gopay_number) methods.push({ id: 'gopay', name: 'GoPay' });

        // Fallback if nothing configured
        if (methods.length === 0) {
            methods.push({ id: 'manual', name: 'Manual via Admin WA' });
        }
        return methods;
    };

    const availableMethods = getAvailablePaymentMethods();

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!waNumber || waNumber.length < 9) {
            setErrorInput('Nomor WhatsApp tidak valid.');
            return;
        }

        setIsLoading(true);
        setErrorInput('');

        try {
            // Create Order
            const { data: orderParams, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: 'Customer', // Simplified, bisa collect nama asli jika mau
                    customer_whatsapp: waNumber,
                    total_amount: product.price,
                    status: 'pending',
                    payment_method: paymentMethod,
                })
                .select('id')
                .single();

            if (orderError) throw orderError;

            // Create Order Item
            const { error: itemError } = await supabase
                .from('order_items')
                .insert({
                    order_id: orderParams.id,
                    product_id: product.id,
                    quantity: 1,
                    price_at_time: product.price,
                });

            if (itemError) throw itemError;

            // Redirect to invoice page
            router.push(`/checkout/success/${orderParams.id}`);
        } catch (error) {
            console.error('Checkout error:', (error as Error).message);
            setErrorInput((error as Error).message || 'Terjadi kesalahan saat checkout.');
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto">
            {/* Left Column - Product Detail */}
            <div className="md:col-span-5 md:order-last">
                <div className="bg-card/60 backdrop-blur-md border border-primary/10 rounded-2xl p-6 shadow-xl shadow-primary/5 sticky top-24">
                    <h2 className="text-xl font-bold mb-4 border-b border-border/50 pb-4 font-[family-name:var(--font-space-grotesk)]">Ringkasan Pesanan</h2>
                    <div className="flex gap-4 mb-6">
                        <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-secondary/50 flex-shrink-0 border border-primary/10 shadow-sm">
                            {product.image_url ? (
                                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                            ) : (
                                <div className="h-full w-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">No img</div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <h3 className="font-semibold text-foreground line-clamp-2 text-lg leading-tight">{product.name}</h3>
                            <span className="inline-flex items-center gap-1 mt-2 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
                                {product.category || 'Digital'}
                            </span>
                            {productUrl && (
                                <div className="mt-2">
                                    <WhatsAppShareButton 
                                        productName={product.name} 
                                        productUrl={productUrl}
                                        className="text-xs py-1.5 px-3" 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-5 border-t border-b border-border/50">
                        <span className="text-muted-foreground font-medium">Total Tagihan</span>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
                            Rp {Number(product.price).toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div className="mt-6 flex items-start gap-3 bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl border border-primary/10">
                        <div className="bg-background p-1.5 rounded-full shadow-sm">
                            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                            Transaksi 100% aman. Data akun akan langsung dikirimkan ke nomor WhatsApp Anda setelah pembayaran terkonfirmasi.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="md:col-span-7">
                <form onSubmit={handleCheckout} className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5">
                    <h1 className="text-3xl font-bold mb-8 font-[family-name:var(--font-space-grotesk)] text-foreground">Checkout</h1>

                    {errorInput && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                            {errorInput}
                        </div>
                    )}

                    {/* Section 1: WhatsApp */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold flex items-center gap-3 mb-5 text-foreground">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm shadow-md shadow-primary/30">1</span>
                            Data Pengiriman
                        </h2>
                        <div className="space-y-3 pl-11">
                            <label htmlFor="waNumber" className="text-sm font-semibold text-foreground block">Nomor WhatsApp Aktif <span className="text-red-500">*</span></label>
                            <input
                                id="waNumber"
                                type="tel"
                                required
                                value={waNumber}
                                onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))} // only numbers
                                placeholder="Contoh: 081234567890"
                                className="flex h-14 w-full rounded-xl border border-input/80 bg-background/80 px-4 py-2 text-base shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary hover:border-primary/50 placeholder:text-muted-foreground/70 font-mono"
                            />
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                                Pastikan nomor aktif. Pesanan akan dikirimkan ke nomor ini.
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Payment */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold flex items-center gap-3 mb-5 text-foreground">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm shadow-md shadow-primary/30">2</span>
                            Pilih Metode Pembayaran
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-11">
                            {availableMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`relative flex cursor-pointer rounded-2xl border-2 p-4 shadow-sm focus:outline-none transition-all duration-200 ${paymentMethod === method.id ? 'border-primary bg-primary/5 shadow-primary/10 scale-[1.02]' : 'border-border/60 bg-card hover:bg-secondary/40 hover:border-primary/30'}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={paymentMethod === method.id}
                                        onChange={() => setPaymentMethod(method.id)}
                                        className="sr-only"
                                    />
                                    <span className="flex flex-1 items-center gap-3">
                                        <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${paymentMethod === method.id ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                            {method.id === 'qris' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>}
                                            {method.id === 'transfer_bank' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>}
                                            {(method.id === 'dana' || method.id === 'gopay') && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" /></svg>}
                                            {method.id === 'manual' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>}
                                        </span>
                                        <span className="flex flex-col">
                                            <span className={`block text-sm font-bold ${paymentMethod === method.id ? 'text-primary' : 'text-foreground'}`}>{method.name}</span>
                                            <span className={`mt-0.5 flex items-center text-[10px] uppercase tracking-wider font-bold ${paymentMethod === method.id ? 'text-primary/70' : 'text-muted-foreground'}`}>
                                                Instant Verif
                                            </span>
                                        </span>
                                    </span>
                                    <ShieldCheck className={`h-5 w-5 absolute top-3 right-3 transition-opacity ${paymentMethod === method.id ? 'text-primary opacity-100' : 'text-transparent opacity-0'}`} />
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !waNumber}
                        className="group relative flex w-full justify-center items-center gap-2 rounded-2xl bg-primary px-4 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 hover:-translate-y-1"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memproses Pesanan...
                            </>
                        ) : (
                            <>
                                Bayar Sekarang
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                        {!isLoading && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] rounded-2xl"></div>}
                    </button>
                </form>
            </div>
        </div>
    );
}
