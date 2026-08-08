import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from '@next/third-parties/google';
import "@/app/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { AlertProvider } from '@/components/ui/AlertContainer';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import DeferredAnalytics from '@/components/providers/DeferredAnalytics';
import ClarityInit from '@/components/providers/ClarityInit';
import { createRootMetadata } from '@/lib/seo/metadata';
import { fontVariables } from '@/lib/fonts';
import PullToRefresh from '@/components/PullToRefresh';
import { AnimatedCursor } from '@/components/layout';

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
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} data-theme="dark" suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-PRZ4PRLN" />
      <body className="antialiased text-sm sm:text-base">
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
        <DeferredAnalytics />
        <ClarityInit />
      </body>
    </html>
  );
}
