import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import MaintenanceCheck from '@/components/MaintenanceCheck';
import SessionProvider from '@/components/dashboard/SessionProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Super Book - The Future of Learning',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AppSettingsProvider>
            <MaintenanceCheck>
              <LanguageProvider>
                {children}
              </LanguageProvider>
            </MaintenanceCheck>
          </AppSettingsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
