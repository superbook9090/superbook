import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/app/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SessionProvider } from '@/components/providers/SessionProvider';
import { createRootMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  ...createRootMetadata(),
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d9488',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProvider>
          <SessionProvider>{children}</SessionProvider>
        </LanguageProvider>
        <GoogleAnalytics gaId="G-DRRECK67YF" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
