'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';
import { getDashboardHomePath } from '@/lib/roles';
import { Loader } from '@/components/ui/Loader';
import Button from '@/components/ui/Button';

function JoinOrgInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const { session, fetchSession } = useSessionStore();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Joining organization...');
  const ranRef = useRef(false);

  const inviteCode =
    searchParams.get('inviteCode') ||
    searchParams.get('code') ||
    searchParams.get('orgCode') ||
    searchParams.get('org') ||
    '';

  const homePath = getDashboardHomePath(session?.user?.role);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    if (!inviteCode.trim()) {
      setState('error');
      setMessage('Missing organization invite code.');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/auth/add-organization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode: inviteCode.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState('error');
          setMessage(data?.message || 'Could not join organization.');
          return;
        }
        await update();
        await fetchSession(true);
        setState('success');
        setMessage(
          data?.organizationName
            ? `Joined ${data.organizationName}! Redirecting to your dashboard...`
            : 'Joined organization! Redirecting...'
        );
        setTimeout(() => {
          router.replace(homePath);
        }, 1200);
      } catch {
        setState('error');
        setMessage('Failed to join organization. Please try again.');
      }
    })();
  }, [inviteCode, update, fetchSession, router, homePath]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-6 text-center shadow-lg space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
          {state === 'loading' && <Building2 className="w-6 h-6" />}
          {state === 'success' && <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />}
          {state === 'error' && <AlertCircle className="w-6 h-6 text-[var(--error)]" />}
        </div>

        <h1 className="text-lg font-bold text-[var(--color-foreground)]">
          {state === 'loading'
            ? 'Joining Organization'
            : state === 'success'
              ? 'Organization Connected'
              : 'Could Not Join Organization'}
        </h1>

        <p className="text-sm text-[var(--color-muted-foreground)]">{message}</p>

        {state === 'loading' ? (
          <div className="flex justify-center pt-2">
            <Loader size="sm" />
          </div>
        ) : (
          <Button onClick={() => router.replace(homePath)} variant="primary" className="w-full min-h-[44px]">
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}

export default function JoinOrganizationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <JoinOrgInner />
    </Suspense>
  );
}
