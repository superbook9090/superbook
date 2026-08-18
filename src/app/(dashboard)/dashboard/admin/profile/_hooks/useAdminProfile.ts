'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@/types';
import { fetchAccountInfo, type AccountInfo } from '@/lib/api/auth';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import type { AdminProfileTabKey, AdminProfileHookState } from '../_types';

export function useAdminProfile(session: Session | null): AdminProfileHookState {
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminProfileTabKey>('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const refreshAccountInfo = useCallback(async () => {
    try {
      setIsLoadingAccount(true);
      const info = await fetchAccountInfo();
      setAccountInfo(info);
    } catch {
      // Non-blocking fallback
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
    const adminId = session?.user?.id;
    if (!adminId) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(adminId).then(() => {
        setCopiedId(true);
        addAlert({
          type: 'info',
          message: t('adminProfile.idCopied') || 'Admin ID copied to clipboard',
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
