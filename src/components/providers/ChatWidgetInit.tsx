"use client";

import Script from 'next/script';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function ChatWidgetInit() {
  const enableChatWidget = useSettingsStore(
    (s) => s.settings?.featureToggles?.enableChatWidget ?? true
  );

  if (!enableChatWidget) return null;

  return (
    <Script
      id="chat-widget-script"
      src="https://cdn.apriloinfotech.com/chat-widget/v1/widget.js"
      data-widget-key="pk_live_acme_corp"
      data-auto-open="false"
      strategy="afterInteractive"
    />
  );
}
