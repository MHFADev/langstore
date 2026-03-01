'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StoreSettings } from '@/types';
import { Save, Loader2 } from 'lucide-react';

interface StoreSettingsFormProps {
    initialSettings: StoreSettings | null;
}

export function StoreSettingsForm({ initialSettings }: StoreSettingsFormProps) {
    const [formData, setFormData] = useState<StoreSettings>({
        id: 1,
        payment_qris_url: initialSettings?.payment_qris_url || '',
        payment_bank_name: initialSettings?.payment_bank_name || '',
        payment_account_number: initialSettings?.payment_account_number || '',
        payment_account_name: initialSettings?.payment_account_name || '',
        payment_dana_number: initialSettings?.payment_dana_number || '',
        payment_gopay_number: initialSettings?.payment_gopay_number || '',
        whatsapp_number_admin: initialSettings?.whatsapp_number_admin || '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('store_settings')
                .upsert({ ...formData, id: 1 }, { onConflict: 'id' });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Pengaturan toko berhasil disimpan.' });
        } catch (err: any) {
            console.error('Error updating store settings:', err);
            setMessage({ type: 'error', text: err.message || 'Gagal menyimpan pengaturan.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-card border rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Metode Pembayaran (QRIS)</h3>
                <div className="space-y-2">
                    <label className="text-sm font-medium">URL Gambar Barcode QRIS</label>
                    <input
                        type="url"
                        name="payment_qris_url"
                        value={formData.payment_qris_url}
                        onChange={handleChange}
                        placeholder="https://example.com/qris.jpg"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-xs text-muted-foreground">URL langsung ke gambar QRIS yang bisa discan (PNG/JPG).</p>
                </div>
            </div>

            <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Metode Pembayaran (Transfer Bank)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nama Bank</label>
                        <input
                            type="text"
                            name="payment_bank_name"
                            value={formData.payment_bank_name}
                            onChange={handleChange}
                            placeholder="Contoh: BCA / Mandiri"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nomor Rekening</label>
                        <input
                            type="text"
                            name="payment_account_number"
                            value={formData.payment_account_number}
                            onChange={handleChange}
                            placeholder="Contoh: 1234567890"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Atas Nama Rekening</label>
                        <input
                            type="text"
                            name="payment_account_name"
                            value={formData.payment_account_name}
                            onChange={handleChange}
                            placeholder="Contoh: Salva Aulia"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Metode Pembayaran (E-Wallet)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nomor DANA</label>
                        <input
                            type="text"
                            name="payment_dana_number"
                            value={formData.payment_dana_number}
                            onChange={handleChange}
                            placeholder="Contoh: 081234567890"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nomor GoPay</label>
                        <input
                            type="text"
                            name="payment_gopay_number"
                            value={formData.payment_gopay_number}
                            onChange={handleChange}
                            placeholder="Contoh: 081234567890"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Notifikasi & Fallback</h3>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor WhatsApp Admin (Untuk Notif / Manual)</label>
                    <input
                        type="text"
                        name="whatsapp_number_admin"
                        value={formData.whatsapp_number_admin}
                        onChange={handleChange}
                        placeholder="Contoh: 6281234567890"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-xs text-muted-foreground">Format harus dimulai dengan kode negara (contoh: 62 untuk Indonesia).</p>
                </div>
            </div>

            {message && (
                <div
                    className={`p-3 text-sm rounded-md ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}
                >
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full md:w-auto items-center justify-center rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Pengaturan
                    </>
                )}
            </button>
        </form>
    );
}
