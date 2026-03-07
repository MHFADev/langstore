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
  // Hardcoded Metadata for Stability
  const title = "LANG STR | Top Up Game & Produk Digital Terpercaya";
  const description = "Pusat top up game termurah, cepat, dan terpercaya. Sedia Mobile Legends, PUBG, Free Fire, dan produk digital premium lainnya. Proses otomatis 24 jam.";
  const url = 'https://langstore.web.id';
  const keywords = ['top up game', 'voucher game', 'mobile legends', 'pubg mobile', 'free fire', 'langstore', 'lang str', 'produk digital'];
  
  return {
    title: {
      default: title,
      template: `%s | LANG STR`,
    },
    description,
    keywords,
    authors: [{ name: 'LANG STR' }],
    creator: 'LANG STR',
    publisher: 'LANG STR',
    metadataBase: new URL(url),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: '/',
      siteName: 'LANG STR',
      locale: 'id_ID',
      type: 'website',
      // Images will be automatically handled by opengraph-image.tsx
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      // Images will be automatically handled by twitter-image.tsx
    },
    icons: {
      icon: '/favicon.ico', // Ensure you have favicon.ico in public folder
      apple: '/apple-touch-icon.png', // Optional
    },
    verification: {
      google: "8j3vSkcDFKkFErhAtuklMcHukWxdKeCWDKZJblgVTVI",
    },
    other: {
      'google-site-verification': "8j3vSkcDFKkFErhAtuklMcHukWxdKeCWDKZJblgVTVI",
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
