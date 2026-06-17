import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { SessionProvider } from '@/components/providers/SessionProvider';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import DeferredAnalytics from '@/components/providers/DeferredAnalytics';
import { createRootMetadata } from '@/lib/seo/metadata';
import PullToRefresh from '@/components/PullToRefresh';

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
          <AppSettingsProvider>
            <SessionProvider>
              <MaintenanceCheck>
                <PullToRefresh>
                  {children}
                </PullToRefresh>
              </MaintenanceCheck>
            </SessionProvider>
          </AppSettingsProvider>
        </LanguageProvider>
        <DeferredAnalytics />
      </body>
    </html>
  );
}
