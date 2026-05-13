import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/styles/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import MaintenanceCheck from '@/components/MaintenanceCheck';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { QueryProvider } from '@/lib/react-query/QueryProvider';

export const metadata: Metadata = {
  title: 'quiz-do - The Future of Learning',
  description: 'Learning Management System',
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
            <AppSettingsProvider>
              <MaintenanceCheck>
                <LanguageProvider>
                  {children}
                </LanguageProvider>
              </MaintenanceCheck>
            </AppSettingsProvider>
          </SessionProvider>
        </QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
