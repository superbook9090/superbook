import { Suspense } from 'react';
import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { AlertProvider } from '@/components/ui/AlertContainer';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import DeferredAnalytics from '@/components/providers/DeferredAnalytics';
import ClarityInit from '@/components/providers/ClarityInit';
import AdsenseInit from '@/components/providers/AdsenseInit';
import { createRootMetadata } from '@/lib/seo/metadata';
import { fontVariables } from '@/lib/fonts';
import PullToRefresh from '@/components/PullToRefresh';
import { AnimatedCursor } from '@/components/layout';

export const metadata: Metadata = {
  ...createRootMetadata(),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} data-theme="dark" suppressHydrationWarning>
      <body className="antialiased text-sm sm:text-base">
        <a href="#main-content" className="skip-link absolute left-[-9999px] top-0 focus-visible:left-0 focus-visible:top-0 p-2 bg-white text-black z-50">Skip to main content</a>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}",
          }}
        />
        <AlertProvider>
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
        </AlertProvider>
        <AnimatedCursor />
        <Suspense fallback={null}>
          <DeferredAnalytics />
        </Suspense>
        <ClarityInit />
        <AdsenseInit />
      </body>
    </html>
  );
}
