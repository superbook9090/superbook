'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@/types';
import { fetchAccountInfo, type AccountInfo } from '@/lib/api/auth';
import type { ProfileTabKey, ProfileHookState } from './types';

export function useProfile(session: Session | null): ProfileHookState {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('account');

  const refreshAccountInfo = useCallback(async () => {
    try {
      setIsLoadingAccount(true);
      const info = await fetchAccountInfo();
      setAccountInfo(info);
    } catch {
      // Graceful non-blocking fallback
    } finally {
      setIsLoadingAccount(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAccountInfo()
      .then((info) => {
        if (!cancelled) {
          setAccountInfo(info);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsLoadingAccount(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    session,
    accountInfo,
    isLoadingAccount,
    activeTab,
    setActiveTab,
    refreshAccountInfo,
  };
}
