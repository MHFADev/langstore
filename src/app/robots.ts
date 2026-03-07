import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('store_settings')
    .select('canonical_url')
    .single();

  const baseUrl = settings?.canonical_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
