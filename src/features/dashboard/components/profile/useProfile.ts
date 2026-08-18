'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@/types';
import { fetchAccountInfo, type AccountInfo } from '@/lib/api/auth';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import type { ProfileTabKey, ProfileHookState } from './types';

export function useProfile(session: Session | null): ProfileHookState {
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

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

  const handleCopyId = useCallback(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(userId).then(() => {
        setCopiedId(true);
        addAlert({
          type: 'info',
          message: t('profile.idCopied') || 'User ID copied to clipboard',
        });
        setTimeout(() => setCopiedId(false), 2500);
      }).catch(() => {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2500);
      });
    }
  }, [session?.user?.id, addAlert, t]);

  return {
    session,
    accountInfo,
    isLoadingAccount,
    activeTab,
    setActiveTab,
    showPasswordModal,
    setShowPasswordModal,
    copiedId,
    handleCopyId,
    refreshAccountInfo,
  };
}
