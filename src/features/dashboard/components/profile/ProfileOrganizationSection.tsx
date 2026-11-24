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
import { addOrganization, fetchAccountInfo, type AccountInfo } from '@/lib/api/auth';
import { OrganizationBadge } from '@/components/organization/OrganizationBadge';
import { OrganizationInviteShareModal } from '@/components/organization/OrganizationInviteShareModal';
import { Share2 } from 'lucide-react';

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
  const [orgData, setOrgData] = useState<AccountInfo['organization'] | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (session.user?.organizationId) {
      fetchAccountInfo()
        .then((info) => {
          if (!cancelled) {
            if (info.organizationName) setOrganizationName(info.organizationName);
            if (info.organization) setOrgData(info.organization);
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
      addAlert({ type: 'success', message: t('profile.orgJoinedSuccess') });
      setIsLinkingOrg(false);
      setInviteCode('');
    } catch (err) {
      console.error('Error joining organization:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      addAlert({ type: 'error', message: errMsg || t('profile.orgJoinError') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-2">
        {t('profile.organization')}
      </label>
      {session.user?.organizationId ? (
        <div className="space-y-2 max-w-md">
          <OrganizationBadge
            name={organizationName || orgData?.name || t('profile.orgJoined')}
            logo={orgData?.logo}
            color={orgData?.primaryColor}
            variant="card"
          />
          {orgData?.tagline && (
            <p className="text-xs text-[var(--color-muted-foreground)] italic px-1">
              &quot;{orgData.tagline}&quot;
            </p>
          )}
          {orgData?.inviteCode && session.user?.role === 'admin' && (
            <div className="pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('organizations.inviteMembers')}</span>
              </Button>
            </div>
          )}
        </div>
      ) : isLinkingOrg ? (
        <form onSubmit={handleJoinOrganization} className="mt-2 space-y-3 max-w-md">
          <div className="space-y-3">
            <TextField
              aria-label={t('profile.enterInviteCode')}
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
                {t('profile.joinOrganization')}
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
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-1 flex items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] italic">
            {t('profile.noOrganization')}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsLinkingOrg(true);
            }}
          >
            {t('profile.addOrganization')}
          </Button>
        </div>
      )}
      {orgData && (
        <OrganizationInviteShareModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organizationName={organizationName || orgData.name}
          inviteCode={orgData.inviteCode}
          logo={orgData.logo}
        />
      )}
    </div>
  );
}
