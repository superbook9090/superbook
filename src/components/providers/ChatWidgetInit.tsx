"use client";

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

const WIDGET_KEY = 'pk_test_NtObY4fROC9N5ciC21aKnSf0VnMg7fCX';
const SCRIPT_SRC = 'https://cdn.apriloinfotech.com/chat-widget/v1/widget.js';
const SCRIPT_ID = 'chat-widget-script';
const HOST_ID = 'aprilo-chat-widget-root';

function destroyChatWidget() {
  try {
    if (typeof window !== 'undefined') {
      // 1. Call Aprilo's built-in destroy() method if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aprilo = (window as any).ApriloChat;
      if (aprilo && typeof aprilo.destroy === 'function') {
        aprilo.destroy();
      }

      // 2. Remove host element and any associated Aprilo elements from DOM
      const host = document.getElementById(HOST_ID);
      if (host && host.parentElement) {
        host.parentElement.removeChild(host);
      }
      const leftovers = document.querySelectorAll(
        `#${HOST_ID}, [id*="aprilo"], [class*="aprilo"]`
      );
      leftovers.forEach((el) => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });

      // 3. Remove script tag if present
      const scriptEl = document.getElementById(SCRIPT_ID);
      if (scriptEl && scriptEl.parentElement) {
        scriptEl.parentElement.removeChild(scriptEl);
      }

      // 4. Remove global window handle
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).ApriloChat;
    }
  } catch (err) {
    console.error('Failed to cleanup chat widget:', err);
  }
}

export default function ChatWidgetInit() {
  const storeEnabled = useSettingsStore(
    (s) => s.settings?.featureToggles?.enableChatWidget
  );
  const lastFetched = useSettingsStore((s) => s.lastFetched);

  // Live preview override for admin toggling in settings panel
  const [previewEnabled, setPreviewEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const handlePreviewToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean | null }>;
      if (customEvent.detail !== undefined) {
        setPreviewEnabled(customEvent.detail.enabled);
      }
    };

    window.addEventListener('previewChatWidgetToggle', handlePreviewToggle);
    return () => {
      window.removeEventListener('previewChatWidgetToggle', handlePreviewToggle);
    };
  }, []);

  // Determine effective enabled status:
  // If previewEnabled is explicitly set (true or false), use it immediately.
  // Otherwise, only enable once settings are loaded (lastFetched !== null) and storeEnabled is true.
  const isEnabled =
    previewEnabled !== null
      ? previewEnabled
      : lastFetched !== null
        ? Boolean(storeEnabled)
        : false;

  useEffect(() => {
    if (!isEnabled) {
      destroyChatWidget();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aprilo = (window as any).ApriloChat;
    if (aprilo && typeof aprilo.init === 'function') {
      try {
        aprilo.init({ widgetKey: WIDGET_KEY, autoOpen: false });
        return;
      } catch (err) {
        console.warn('Failed to re-initialize ApriloChat:', err);
      }
    }

    // Insert script if not already present
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.setAttribute('data-widget-key', WIDGET_KEY);
      script.setAttribute('data-auto-open', 'false');
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isEnabled]);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      destroyChatWidget();
    };
  }, []);

  return null;
}
