// src/app/(dashboard)/dashboard/student/certificates/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import { useCertificates } from '@/lib/react-query/hooks';
import { Award } from 'lucide-react';
import { PageWrapper, PageHeader, ResponsiveGrid, EmptyState } from '@/components/layout';

export default function StudentCertificatesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();

  const { data: certificates = [], isLoading, error } = useCertificates();
  const { addAlert } = useAlert();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [session, status, router]);

  useEffect(() => {
    if (error) {
      addAlert({ type: 'error', message: String(error) });
    }
  }, [error, addAlert]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <PageHeader
        title={t('certificates.title')}
        description={t('certificates.description')}
      />

      {error && (
        <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
          {String(error)}
        </div>
      )}

      <div>
        {certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title={t('certificates.noCertificates')}
            description={t('certificates.noCertificatesHint')}
          />
        ) : (
          <div className="perspective-1000">
            <ResponsiveGrid variant="dense">
              {certificates.map((certificate) => (
                <Link
                  key={certificate._id}
                  href={ROUTES.student.certificate(certificate._id)}
                  className="block antigravity-certificate-card overflow-hidden group transform-3d"
                >
                  <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" aria-hidden />
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/25 shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] truncate group-hover:text-amber-500 transition-colors">
                          {certificate.courseTitle}
                        </h3>
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                          {t('certificates.issuedOn')}{' '}
                          {new Date(certificate.issuedAt).toLocaleDateString()}
                        </p>
                        <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1 font-mono tracking-wider truncate bg-[var(--surface-muted)]/50 px-2 py-0.5 rounded-md inline-block">
                          ID: {certificate.certificateId}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-amber-500/15 text-xs font-bold text-amber-500 flex items-center justify-between">
                      <span>{t('certificates.viewCertificate')}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </ResponsiveGrid>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
