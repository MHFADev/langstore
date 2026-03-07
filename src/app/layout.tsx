import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .single();

  const title = settings?.site_title || "LANG STR | Modern Product Catalog";
  const description = settings?.site_description || "Temukan koleksi pilihan terbaik dari LANG STR.";
  const url = settings?.canonical_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ogImage = settings?.site_meta_image || '/next.svg';
  const keywords = settings?.site_keywords || 'game, topup, premium, store';
  const favicon = settings?.favicon_url || '/favicon.svg';

  return {
    title: {
      default: title,
      template: `%s | ${title.split('|')[0].trim()}`,
    },
    description,
    keywords: keywords.split(',').map((k: string) => k.trim()),
    authors: [{ name: 'LANG STR' }],
    creator: 'LANG STR',
    publisher: 'LANG STR',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(url),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: '/',
      siteName: title,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: favicon, sizes: '32x32' },
        { url: favicon, sizes: '16x16' },
      ],
      apple: [
        { url: favicon, sizes: '180x180' },
      ],
    },
    verification: {
      google: settings?.google_search_console_id || "8j3vSkcDFKkFErhAtuklMcHukWxdKeCWDKZJblgVTVI",
    },
    other: {
      'google-site-verification': settings?.google_search_console_id || "8j3vSkcDFKkFErhAtuklMcHukWxdKeCWDKZJblgVTVI",
    }
  };
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('store_settings')
    .select('google_analytics_id, site_title, site_description, canonical_url')
    .single();

  const baseUrl = settings?.canonical_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const siteTitle = settings?.site_title || "LANG STR | Modern Product Catalog";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteTitle,
    "url": baseUrl,
    "description": settings?.site_description || "Temukan koleksi pilihan terbaik dari LANG STR.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {settings?.google_analytics_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.google_analytics_id}');
                `,
              }}
            />
          </>
        )}
        {children}
      </body>
    </html>
  );
}
