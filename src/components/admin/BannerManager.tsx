'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Banner } from '@/types';
import { Loader2, Plus, Trash2, Edit, ImageIcon, MoveUp, MoveDown, Check, X, Upload } from 'lucide-react';
import { compressAndConvertToWebP } from '@/lib/imageUtils';
import Image from 'next/image';

export function BannerManager() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // New Banner Form State
    const [newBannerTitle, setNewBannerTitle] = useState('');
    const [newBannerDesc, setNewBannerDesc] = useState('');
    const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supabase = createClient();

    const fetchBanners = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching banners:', error);
        } else {
            setBanners(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (e.g. max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setUploadError('Ukuran file terlalu besar (Maks 5MB).');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setUploadError('');
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageUrlInput(e.target.value);
        setPreviewUrl(e.target.value);
        setUploadError('');
    };

    const handleSaveBanner = async () => {
        if (inputType === 'upload' && !selectedFile) {
            setUploadError('Pilih gambar banner terlebih dahulu.');
            return;
        }

        if (inputType === 'url' && !imageUrlInput) {
             setUploadError('Masukkan URL gambar terlebih dahulu.');
             return;
        }

        setIsUploading(true);
        setUploadError('');

        try {
            let finalImageUrl = imageUrlInput;

            if (inputType === 'upload' && selectedFile) {
                const compressedFile = await compressAndConvertToWebP(selectedFile);

                // Upload
                const fileName = `banner_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
                const { error: uploadError } = await supabase.storage
                    .from('settings')
                    .upload(fileName, compressedFile, { contentType: 'image/webp', cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('settings').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
            }

            // Insert into DB
            const { error: dbError } = await supabase
                .from('banners')
                .insert({
                    image_url: finalImageUrl,
                    title: newBannerTitle,
                    description: newBannerDesc,
                    is_active: true,
                    sort_order: banners.length
                });

            if (dbError) throw dbError;

            // Reset form
            setNewBannerTitle('');
            setNewBannerDesc('');
            setSelectedFile(null);
            setImageUrlInput('');
            setPreviewUrl(null);
            setIsFormOpen(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            
            await fetchBanners();
            await fetch('/api/revalidate?path=/', { method: 'POST' }); 

        } catch (err: unknown) {
            console.error('Upload failed:', err);
            setUploadError(err instanceof Error ? err.message : 'Gagal menyimpan banner.');
        } finally {
            setIsUploading(false);
        }
    };
    
    // ... existing delete/toggle functions ...


    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus banner ini?')) return;

        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (!error) {
            setBanners(prev => prev.filter(b => b.id !== id));
            await fetch('/api/revalidate?path=/', { method: 'POST' });
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('banners')
            .update({ is_active: !currentStatus })
            .eq('id', id);
        
        if (!error) {
            setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b));
            await fetch('/api/revalidate?path=/', { method: 'POST' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Manajemen Banner Carousel</h3>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Add New Banner Button & Form */}
                    {!isFormOpen ? (
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="w-full py-4 border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all group"
                        >
                            <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-medium">Tambah Banner Baru</span>
                        </button>
                    ) : (
                        <div className="bg-secondary/20 rounded-xl p-6 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-primary" /> Detail Banner Baru
                                </h4>
                                <button onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Judul Banner (Opsional)</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Promo Spesial"
                                            value={newBannerTitle}
                                            onChange={(e) => setNewBannerTitle(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Deskripsi (Opsional)</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Diskon hingga 50%..."
                                            value={newBannerDesc}
                                            onChange={(e) => setNewBannerDesc(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Gambar Banner</label>
                                    
                                    {/* Input Type Toggle */}
                                    <div className="flex p-1 bg-muted rounded-lg mb-4">
                                        <button
                                            onClick={() => { setInputType('upload'); setPreviewUrl(null); setSelectedFile(null); }}
                                            className={`flex-1 text-xs py-1.5 rounded-md transition-all ${inputType === 'upload' ? 'bg-background shadow-sm text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Upload File
                                        </button>
                                        <button
                                            onClick={() => { setInputType('url'); setPreviewUrl(null); setImageUrlInput(''); }}
                                            className={`flex-1 text-xs py-1.5 rounded-md transition-all ${inputType === 'url' ? 'bg-background shadow-sm text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            URL Gambar
                                        </button>
                                    </div>

                                    {inputType === 'upload' ? (
                                        <>
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="relative w-full aspect-[2/1] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden group"
                                            >
                                                {previewUrl ? (
                                                    <>
                                                        <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Ganti Gambar</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                                        <p className="text-xs text-muted-foreground">Klik untuk upload</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                value={imageUrlInput}
                                                onChange={handleUrlChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            />
                                            
                                            {previewUrl && (
                                                <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden border bg-muted">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img 
                                                        src={previewUrl} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+URL';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {uploadError && <p className="text-red-500 text-xs mb-4 bg-red-50 p-2 rounded border border-red-100">{uploadError}</p>}
                            
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveBanner}
                                    disabled={isUploading || (inputType === 'upload' ? !selectedFile : !imageUrlInput)}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {isUploading ? 'Menyimpan...' : 'Simpan Banner'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Banner List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">Memuat banner...</div>
                        ) : banners.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl">
                                Belum ada banner. Silakan upload banner pertama Anda.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {banners.map((banner) => (
                                    <div key={banner.id} className="flex flex-col sm:flex-row items-center gap-4 bg-card border rounded-lg p-3 group hover:border-primary/30 transition-colors">
                                        <div className="relative w-full sm:w-48 aspect-[2/1] rounded-md overflow-hidden bg-muted">
                                            <Image 
                                                src={banner.image_url} 
                                                alt={banner.title || 'Banner'} 
                                                fill 
                                                className={`object-cover transition-opacity ${!banner.is_active ? 'opacity-50 grayscale' : ''}`}
                                            />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 text-center sm:text-left">
                                            <h5 className="font-medium truncate">{banner.title || '(Tanpa Judul)'}</h5>
                                            <p className="text-xs text-muted-foreground truncate">{banner.description || '(Tanpa Deskripsi)'}</p>
                                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {banner.is_active ? 'Aktif' : 'Non-aktif'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleActive(banner.id, banner.is_active)}
                                                className={`p-2 rounded-full transition-colors ${banner.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                title={banner.is_active ? 'Non-aktifkan' : 'Aktifkan'}
                                            >
                                                {banner.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                                                title="Hapus Banner"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
