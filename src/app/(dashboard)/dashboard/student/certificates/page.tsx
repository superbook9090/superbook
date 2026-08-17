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
          <ResponsiveGrid variant="dense">
            {certificates.map((certificate) => (
              <Link
                key={certificate._id}
                href={ROUTES.student.certificate(certificate._id)}
                className="block bg-[var(--card-solid)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all group"
              >
                <div className="h-[3px]" style={{ background: 'var(--primary-gradient)' }} aria-hidden />
                <div className="card-body">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                        {certificate.courseTitle}
                      </h3>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        {t('certificates.issuedOn')}{' '}
                        {new Date(certificate.issuedAt).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1 font-mono truncate">
                        {certificate.certificateId}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-[var(--primary)] flex items-center">
                    {t('certificates.viewCertificate')} →
                  </div>
                </div>
              </Link>
            ))}
          </ResponsiveGrid>
        )}
      </div>
    </PageWrapper>
  );
}
