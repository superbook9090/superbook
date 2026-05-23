import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/app/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import MaintenanceCheck from '@/components/MaintenanceCheck';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { QueryProvider } from '@/lib/react-query/QueryProvider';
import { en } from '@/i18n/en';

export const metadata: Metadata = {
  title: en.metadata.siteTitle,
  description: en.metadata.siteDescription,
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GoogleAnalytics gaId="G-DRRECK67YF" />
        <QueryProvider>
          <SessionProvider>
            <LanguageProvider>
              <AppSettingsProvider>
                <MaintenanceCheck>
                  {children}
                </MaintenanceCheck>
              </AppSettingsProvider>
            </LanguageProvider>
          </SessionProvider>
        </QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
