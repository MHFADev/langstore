'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StoreSettings } from '@/types';
import { Save, Loader2, Globe, Image as ImageIcon, Search, BarChart, Bell, CreditCard, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

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
        site_title: initialSettings?.site_title || '',
        site_description: initialSettings?.site_description || '',
        site_keywords: initialSettings?.site_keywords || '',
        site_meta_image: initialSettings?.site_meta_image || '',
        favicon_url: initialSettings?.favicon_url || '',
        google_analytics_id: initialSettings?.google_analytics_id || '',
        google_search_console_id: initialSettings?.google_search_console_id || '',
        canonical_url: initialSettings?.canonical_url || '',
        banner_url: initialSettings?.banner_url || '',
        banner_title: initialSettings?.banner_title || '',
        banner_description: initialSettings?.banner_description || '',
        banner_active: initialSettings?.banner_active ?? true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState<{ favicon: boolean; metaImage: boolean; banner: boolean }>({ favicon: false, metaImage: false, banner: false });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const faviconInputRef = useRef<HTMLInputElement>(null);
    const metaImageInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'favicon' | 'metaImage' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading((prev) => ({ ...prev, [type]: true }));
        try {
            let fileToUpload = file;
            const isFavicon = type === 'favicon';

            // Validasi format
            const validTypes = isFavicon ? ['image/png', 'image/x-icon', 'image/svg+xml'] : ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                throw new Error(`Format file tidak didukung. Gunakan ${validTypes.join(', ')}.`);
            }

            // Kompresi jika bukan SVG atau ICO
            if (!file.type.includes('svg') && !file.type.includes('icon')) {
                const options = {
                    maxSizeMB: isFavicon ? 0.1 : 1,
                    maxWidthOrHeight: isFavicon ? 180 : type === 'banner' ? 1920 : 1200,
                    useWebWorker: true,
                };
                fileToUpload = await imageCompression(file, options);
            }

            const fileName = `${type}_${Date.now()}.${fileToUpload.type.split('/')[1]}`;
            const { data, error } = await supabase.storage
                .from('settings')
                .upload(fileName, fileToUpload, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('settings').getPublicUrl(fileName);

            // Tambahkan cache busting
            const finalUrl = `${publicUrl}?v=${Date.now()}`;

            const fieldMap = {
                favicon: 'favicon_url',
                metaImage: 'site_meta_image',
                banner: 'banner_url'
            };

            setFormData((prev) => ({
                ...prev,
                [fieldMap[type]]: finalUrl,
            }));

            setMessage({ type: 'success', text: `${type === 'banner' ? 'Banner' : isFavicon ? 'Favicon' : 'Meta image'} berhasil diunggah.` });
        } catch (err: unknown) {
            console.error('Upload error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal mengunggah file.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsUploading((prev) => ({ ...prev, [type]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('store_settings')
                .upsert({ ...formData, id: 1, updated_at: new Date().toISOString() }, { onConflict: 'id' });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Pengaturan toko berhasil disimpan.' });
            
            // Refresh metadata by reloading or custom event
            window.location.reload(); 
        } catch (err: unknown) {
            console.error('Error updating store settings:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            {/* 1. SEO & Identity Section */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Identitas & SEO Global</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Judul Website (SEO Title)</label>
                            <input
                                type="text"
                                name="site_title"
                                value={formData.site_title}
                                onChange={handleChange}
                                placeholder="Contoh: LANG STR | Modern Product Catalog"
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

            {/* Banner Settings Section */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Banner Beranda (Hero Section)</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 border-b pb-6">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="banner_active"
                                checked={formData.banner_active}
                                onChange={(e) => handleToggle('banner_active', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="banner_active" className="text-sm font-medium">Aktifkan Banner Custom</label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Jika dinonaktifkan, akan menggunakan tampilan default.
                        </p>
                    </div>

                    {formData.banner_active && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-4">
                                <label className="text-sm font-medium">Gambar Banner</label>
                                <div className="relative w-full aspect-[21/9] border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20 overflow-hidden group">
                                    {formData.banner_url ? (
                                        <>
                                            <img src={formData.banner_url} alt="Banner Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => bannerInputRef.current?.click()}
                                                    className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                                                >
                                                    Ganti Gambar
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Klik untuk unggah banner</p>
                                            <p className="text-xs text-muted-foreground mt-1">Rekomendasi: 1920x800 px (JPG/WEBP)</p>
                                        </div>
                                    )}
                                    
                                    {isUploading.banner && (
                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    )}
                                    
                                    <input
                                        type="file"
                                        ref={bannerInputRef}
                                        onChange={(e) => handleFileUpload(e, 'banner')}
                                        accept=".jpg,.jpeg,.png,.webp"
                                        className="hidden"
                                    />
                                    
                                    {!formData.banner_url && (
                                        <button 
                                            type="button"
                                            onClick={() => bannerInputRef.current?.click()}
                                            className="absolute inset-0 w-full h-full cursor-pointer"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Judul Banner</label>
                                    <input
                                        type="text"
                                        name="banner_title"
                                        value={formData.banner_title}
                                        onChange={handleChange}
                                        placeholder="Contoh: Diskon Spesial Akhir Tahun!"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Deskripsi Singkat</label>
                                    <input
                                        type="text"
                                        name="banner_description"
                                        value={formData.banner_description}
                                        onChange={handleChange}
                                        placeholder="Top up game favoritmu sekarang..."
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Favicon & Social Image Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Favicon */}
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                        <div className="p-1 bg-primary/10 rounded">
                            <ImageIcon className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">Manajemen Favicon</h3>
                    </div>
                    <div className="p-6 space-y-4 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="relative w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20">
                                {formData.favicon_url ? (
                                    <img src={formData.favicon_url} alt="Favicon Preview" className="w-16 h-16 object-contain" />
                                ) : (
                                    <Globe className="w-10 h-10 text-muted-foreground/50" />
                                )}
                                {isUploading.favicon && (
                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={faviconInputRef}
                            onChange={(e) => handleFileUpload(e, 'favicon')}
                            accept=".png,.ico,.svg"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => faviconInputRef.current?.click()}
                            disabled={isUploading.favicon}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Ganti Favicon
                        </button>
                        <p className="text-[10px] text-muted-foreground mt-2">
                            Rekomendasi: PNG 180x180 atau SVG untuk kualitas terbaik di semua perangkat.
                        </p>
                    </div>
                </div>

                {/* Social Share Preview Image */}
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Social Share Card (OG Image)</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="relative aspect-[1200/630] w-full border rounded-lg bg-muted/20 overflow-hidden">
                            {formData.site_meta_image ? (
                                <img src={formData.site_meta_image} alt="OG Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
                                    <ImageIcon className="w-12 h-12 mb-2" />
                                    <p className="text-sm">Preview 1200 x 630 px</p>
                                </div>
                            )}
                            {isUploading.metaImage && (
                                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={metaImageInputRef}
                            onChange={(e) => handleFileUpload(e, 'metaImage')}
                            accept=".jpg,.jpeg,.png,.webp"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => metaImageInputRef.current?.click()}
                            disabled={isUploading.metaImage}
                            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Unggah Gambar Preview Sosial
                        </button>
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

            <div className="flex justify-end sticky bottom-4 z-10">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-10 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Menyimpan Perubahan...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-5 w-5" />
                            Simpan Semua Pengaturan
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
