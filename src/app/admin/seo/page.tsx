import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';
import { Globe, Search, BarChart3, CheckCircle2, AlertCircle, FileText, Share2 } from 'lucide-react';

export default async function SEODashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login');
    }

    const { data: settings } = await supabase
        .from('store_settings')
        .select('*')
        .single();

    const seoHealth = [
        {
            name: 'Meta Tags',
            status: settings?.site_title && settings?.site_description ? 'Good' : 'Incomplete',
            icon: FileText,
            color: settings?.site_title && settings?.site_description ? 'text-green-500' : 'text-yellow-500',
            desc: settings?.site_title ? 'Title & Description set' : 'Title/Description missing'
        },
        {
            name: 'Social Media (OG)',
            status: settings?.site_meta_image ? 'Good' : 'Missing',
            icon: Share2,
            color: settings?.site_meta_image ? 'text-green-500' : 'text-red-500',
            desc: settings?.site_meta_image ? 'Preview image uploaded' : 'No preview image set'
        },
        {
            name: 'Google Analytics',
            status: settings?.google_analytics_id ? 'Active' : 'Disabled',
            icon: BarChart3,
            color: settings?.google_analytics_id ? 'text-green-500' : 'text-yellow-500',
            desc: settings?.google_analytics_id || 'ID not configured'
        },
        {
            name: 'Search Console',
            status: settings?.google_search_console_id ? 'Verified' : 'Unverified',
            icon: Search,
            color: settings?.google_search_console_id ? 'text-green-500' : 'text-red-500',
            desc: settings?.google_search_console_id ? 'Verification ID set' : 'Verification ID missing'
        },
        {
            name: 'Favicon',
            status: settings?.favicon_url ? 'Dynamic' : 'Default',
            icon: Globe,
            color: settings?.favicon_url ? 'text-green-500' : 'text-blue-500',
            desc: settings?.favicon_url ? 'Custom favicon active' : 'Using default favicon'
        }
    ];

    return (
        <div className="min-h-screen bg-secondary/30">
            <AdminHeader userEmail={user.email} />

            <main className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">SEO Metrics Real-time</h1>
                    <p className="text-muted-foreground">Monitoring performa SEO dan konfigurasi global toko Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seoHealth.map((item, idx) => (
                        <div key={idx} className="bg-card border rounded-xl p-6 shadow-sm flex items-start gap-4">
                            <div className={`p-3 rounded-lg bg-muted/50 ${item.color}`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-semibold text-sm">{item.name}</h3>
                                    {item.status === 'Good' || item.status === 'Active' || item.status === 'Verified' || item.status === 'Dynamic' ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    )}
                                </div>
                                <p className={`text-lg font-bold ${item.color}`}>{item.status}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-card border rounded-xl p-8 text-center max-w-3xl mx-auto">
                    <Globe className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Technical SEO Auto-Generated</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        Sistem kami secara otomatis mengelola file technical SEO berikut untuk Anda:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="px-4 py-2 bg-muted rounded-full text-xs font-medium">/sitemap.xml</div>
                        <div className="px-4 py-2 bg-muted rounded-full text-xs font-medium">/robots.txt</div>
                        <div className="px-4 py-2 bg-muted rounded-full text-xs font-medium">Canonical URLs</div>
                        <div className="px-4 py-2 bg-muted rounded-full text-xs font-medium">Schema.org Markup</div>
                    </div>
                    <div className="mt-8 pt-6 border-t">
                        <a 
                            href="/admin/settings" 
                            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                        >
                            Update Konfigurasi SEO
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
