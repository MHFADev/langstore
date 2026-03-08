'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StoreSettings } from '@/types';
import { Save, Loader2, Globe, Image as ImageIcon, Search, BarChart, Bell, CreditCard, Upload, Check } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface StoreSettingsFormProps {
    initialSettings: StoreSettings | null;
}

export function StoreSettingsForm({ initialSettings }: StoreSettingsFormProps) {
    const [formData, setFormData] = useState<StoreSettings>({
        id: 1,
        // Payment & Contact
        payment_qris_url: initialSettings?.payment_qris_url || '',
        payment_bank_name: initialSettings?.payment_bank_name || '',
        payment_account_number: initialSettings?.payment_account_number || '',
        payment_account_name: initialSettings?.payment_account_name || '',
        payment_dana_number: initialSettings?.payment_dana_number || '',
        payment_gopay_number: initialSettings?.payment_gopay_number || '',
        whatsapp_number_admin: initialSettings?.whatsapp_number_admin || '',
        
        // SEO & General
        site_title: initialSettings?.site_title || '',
        site_description: initialSettings?.site_description || '',
        site_keywords: initialSettings?.site_keywords || '',
        google_analytics_id: initialSettings?.google_analytics_id || '',
        google_search_console_id: initialSettings?.google_search_console_id || '',
        canonical_url: initialSettings?.canonical_url || '',
        favicon_url: initialSettings?.favicon_url || '',
        analytics_embed_url: initialSettings?.analytics_embed_url || '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('store_settings')
                .upsert(formData)
                .select();

            if (error) throw error;

            setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
            await fetch('/api/revalidate?path=/', { method: 'POST' });
        } catch (err: unknown) {
            console.error('Error saving settings:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <Check className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {/* 1. SEO & General Settings */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Informasi Umum & SEO</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Judul Website (Meta Title)</label>
                            <input
                                type="text"
                                name="site_title"
                                value={formData.site_title}
                                onChange={handleChange}
                                placeholder="LANG STR | Toko Produk Digital"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                            <p className="text-xs text-muted-foreground">Disarankan: 50-60 karakter.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL Kanonikal</label>
                            <input
                                type="url"
                                name="canonical_url"
                                value={formData.canonical_url}
                                onChange={handleChange}
                                placeholder="https://langstr.id"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Deskripsi Website (Meta Description)</label>
                        <textarea
                            name="site_description"
                            value={formData.site_description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Jelaskan tentang toko Anda secara ringkas..."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <p className="text-xs text-muted-foreground">Disarankan: 150-160 karakter.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Kata Kunci (Keywords)</label>
                        <input
                            type="text"
                            name="site_keywords"
                            value={formData.site_keywords}
                            onChange={handleChange}
                            placeholder="game, topup, murah, berkualitas"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <p className="text-xs text-muted-foreground">Pisahkan dengan koma.</p>
                    </div>
                </div>
            </div>

            {/* 3. Analytics & Search Console */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Monitoring & Analytics</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart className="h-4 w-4 text-blue-500" />
                            <label className="text-sm font-medium">Google Analytics ID (G-XXXXXXX)</label>
                        </div>
                        <input
                            type="text"
                            name="google_analytics_id"
                            value={formData.google_analytics_id}
                            onChange={handleChange}
                            placeholder="G-12345678"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Search className="h-4 w-4 text-orange-500" />
                            <label className="text-sm font-medium">Google Search Console (Meta Tag Content)</label>
                        </div>
                        <input
                            type="text"
                            name="google_search_console_id"
                            value={formData.google_search_console_id}
                            onChange={handleChange}
                            placeholder="content dari google-site-verification"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart className="h-4 w-4 text-green-500" />
                            <label className="text-sm font-medium">Google Looker Studio Embed URL (Dashboard)</label>
                        </div>
                        <input
                            type="text"
                            name="analytics_embed_url"
                            value={formData.analytics_embed_url || ''}
                            onChange={handleChange}
                            placeholder="https://lookerstudio.google.com/embed/reporting/..."
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <p className="text-xs text-muted-foreground">
                            Masukkan URL embed dari laporan Looker Studio (File &gt; Embed report &gt; Enable embedding &gt; Embed URL).
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Payment Methods (Existing) */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Metode Pembayaran & Kontak</h3>
                </div>
                <div className="p-6 space-y-8">
                    {/* QRIS */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">QRIS</h4>
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
                        </div>
                    </div>

                    {/* Bank Transfer */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Transfer Bank</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nama Bank</label>
                                <input
                                    type="text"
                                    name="payment_bank_name"
                                    value={formData.payment_bank_name}
                                    onChange={handleChange}
                                    placeholder="BCA / Mandiri"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nomor Rekening</label>
                                <input
                                    type="text"
                                    name="payment_account_number"
                                    value={formData.payment_account_number}
                                    onChange={handleChange}
                                    placeholder="1234567890"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Atas Nama</label>
                                <input
                                    type="text"
                                    name="payment_account_name"
                                    value={formData.payment_account_name}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* E-Wallet & WhatsApp */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">E-Wallet</h4>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">DANA</label>
                                <input
                                    type="text"
                                    name="payment_dana_number"
                                    value={formData.payment_dana_number}
                                    onChange={handleChange}
                                    placeholder="08..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notifikasi</h4>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">WhatsApp Admin</label>
                                <input
                                    type="text"
                                    name="whatsapp_number_admin"
                                    value={formData.whatsapp_number_admin}
                                    onChange={handleChange}
                                    placeholder="628..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <div
                    className={`p-4 text-sm rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                >
                    <Bell className="h-4 w-4" />
                    {message.text}
                </div>
            )}

            <div className="flex justify-end pt-8">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-lg shadow-primary/20"
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
            </div>
        </div>
    );
}
