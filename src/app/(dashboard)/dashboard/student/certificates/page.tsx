// src/app/(dashboard)/dashboard/student/certificates/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { useCertificates } from '@/lib/react-query/hooks';
import { Award } from 'lucide-react';

export default function StudentCertificatesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();

  const { data: certificates = [], isLoading, error } = useCertificates();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
          {t('certificates.title')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
          {t('certificates.description')}
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={String(error)}
          className="relative top-0 right-0 left-0 translate-x-0 w-full mt-4 z-10"
        />
      )}

      <div className="mt-8">
        {certificates.length === 0 ? (
          <div className="card-panel">
            <div className="px-4 py-10 sm:p-8 text-center">
              <Award className="w-12 h-12 mx-auto text-[var(--color-muted-foreground)] mb-4" />
              <p className="text-[var(--color-muted-foreground)] mb-2">{t('certificates.noCertificates')}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('certificates.noCertificatesHint')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Link
                key={certificate._id}
                href={ROUTES.student.certificate(certificate._id)}
                className="block bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all"
              >
                <div className="h-[3px]" style={{ background: 'var(--primary-gradient)' }} aria-hidden />
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-[var(--color-foreground)] truncate">
                        {certificate.courseTitle}
                      </h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                        {t('certificates.issuedOn')}{' '}
                        {new Date(certificate.issuedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-2 font-mono truncate">
                        {certificate.certificateId}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-medium text-[var(--primary)]">
                    {t('certificates.viewCertificate')} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
