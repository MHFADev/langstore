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

  const title = settings?.site_title || "LANG STR | Top Up Game & Produk Digital Terpercaya";
  const description = settings?.site_description || "Pusat top up game termurah, cepat, dan terpercaya. Sedia Mobile Legends, PUBG, Free Fire, dan produk digital premium lainnya. Proses otomatis 24 jam.";
  const url = settings?.canonical_url || 'https://langstore.web.id';
  
  // Parse keywords from comma-separated string
  const keywords = settings?.site_keywords 
    ? settings.site_keywords.split(',').map((k: string) => k.trim()) 
    : ['top up game', 'voucher game', 'mobile legends', 'pubg mobile', 'free fire', 'langstore', 'lang str', 'produk digital'];
  
  // Google Verification Code
  // If user inputs full meta tag <meta name="google-site-verification" content="..." />, extract content
  // If user inputs just the code, use it directly
  let googleVerificationCode = settings?.google_search_console_id || "8j3vSkcDFKkFErhAtuklMcHukWxdKeCWDKZJblgVTVI";
  
  // Basic cleanup if user pasted full tag
  if (googleVerificationCode.includes('content="')) {
    const match = googleVerificationCode.match(/content="([^"]+)"/);
    if (match && match[1]) {
      googleVerificationCode = match[1];
    }
  }

  return {
    title: {
      default: title,
      template: `%s | ${title.split('|')[0].trim()}`,
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
      siteName: title.split('|')[0].trim(),
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
      icon: settings?.favicon_url || '/favicon.ico',
      apple: '/apple-touch-icon.png', // Optional
    },
    verification: {
      google: googleVerificationCode,
    },
    other: {
      // Fallback for some crawlers
      'google-site-verification': googleVerificationCode,
    }
  };
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

import { ThemeProvider } from "@/components/layout/ThemeProvider";

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
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Google Analytics */}
        {settings?.google_analytics_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}></script>
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
      </body>
    </html>
  );
}
