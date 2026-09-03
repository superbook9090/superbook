'use client';

import Script from 'next/script';

export default function GoogleAdsenseInit() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3910555435236193"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
