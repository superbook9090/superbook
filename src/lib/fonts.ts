import { Inter, Sora } from 'next/font/google';

// Body font — variable weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-body',
});

// Display font — headings only (see --font-display in globals.css)
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans-display',
});

export const fontVariables = `${inter.variable} ${sora.variable}`;
