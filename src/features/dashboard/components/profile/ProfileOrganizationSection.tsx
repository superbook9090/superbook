'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { useRouter } from 'next/navigation';
import { getCsrfToken } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { Session } from 'next-auth';
import { addOrganization, fetchAccountInfo } from '@/lib/api/auth';

interface ProfileOrganizationSectionProps {
  session: Session;
}

export default function ProfileOrganizationSection({ session }: ProfileOrganizationSectionProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();

  const [inviteCode, setInviteCode] = useState('');
  const [isLinkingOrg, setIsLinkingOrg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (session.user?.organizationId) {
      fetchAccountInfo()
        .then((info) => {
          if (!cancelled && info.organizationName) {
            setOrganizationName(info.organizationName);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [session.user?.organizationId]);

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await addOrganization({ inviteCode: inviteCode.trim() });
      
      const csrfToken = await getCsrfToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken,
          data: {
            organizationId: response.organizationId,
          },
        }),
      });

      await useSessionStore.getState().fetchSession(true);
      router.refresh();

      setOrganizationName(response.organizationName);
      addAlert({ type: 'success', message: t('profile.orgJoinedSuccess') || 'Successfully joined organization.' });
      setIsLinkingOrg(false);
      setInviteCode('');
    } catch (err) {
      console.error('Error joining organization:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      addAlert({ type: 'error', message: errMsg || t('profile.orgJoinError') || 'Failed to join organization.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-muted-foreground)]">{t('profile.organization') || 'Organization'}</label>
      {session.user?.organizationId ? (
        <p className="mt-1 text-sm sm:text-base text-[var(--color-foreground)] break-words">
          {organizationName || t('profile.orgJoined') || 'Joined an Organization'}
        </p>
      ) : isLinkingOrg ? (
        <form onSubmit={handleJoinOrganization} className="mt-2 space-y-3 max-w-md">
          <div className="space-y-3">
            <TextField
              aria-label={t('profile.enterInviteCode') || 'Enter Invite Code'}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="ORG-XXXX"
              required
              disabled={isLoading}
              fullWidth
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !inviteCode.trim()}
                isLoading={isLoading}
                size="md"
              >
                {t('profile.joinOrganization') || 'Join'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsLinkingOrg(false);
                  setInviteCode('');
                }}
                disabled={isLoading}
                size="md"
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-1 flex items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] italic">
            {t('profile.noOrganization') || 'No organization linked'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsLinkingOrg(true);
            }}
          >
            {t('profile.addOrganization') || 'Join Organization'}
          </Button>
        </div>
      )}
    </div>
  );
}
