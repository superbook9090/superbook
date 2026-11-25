// src/app/(dashboard)/dashboard/student/certificates/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, ArrowRight, Calendar, Compass } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import { useCertificates } from '@/lib/react-query/hooks';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';

export default function StudentCertificatesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: certificates = [], isLoading, error } = useCertificates();
  const { addAlert } = useAlert();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push(ROUTES.login);
  }, [session, status, router]);

  useEffect(() => {
    if (error) addAlert({ type: 'error', message: String(error) });
  }, [error, addAlert]);

  if (status === 'loading' || isLoading) return <PageSkeleton />;

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={Award}
        eyebrow={t('common.certificates')}
        title={t('certificates.title')}
        description={t('certificates.description')}
        actions={
          certificates.length > 0 ? (
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold tabular-nums">{certificates.length}</span>
            </div>
          ) : null
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/25 text-sm font-medium">
          {String(error)}
        </div>
      )}

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title={t('certificates.noCertificates')}
          description={t('certificates.noCertificatesHint')}
          action={
            <Link href={ROUTES.student.courses} className="student-cta-btn">
              <Compass className="w-4 h-4" />
              <span>{t('common.myCourses')}</span>
            </Link>
          }
        />
      ) : (
        <ResponsiveGrid variant="dense">
          {certificates.map((certificate) => (
            <Link
              key={certificate._id}
              href={ROUTES.student.certificate(certificate._id)}
              className="student-card overflow-hidden group flex flex-col justify-between border-amber-500/25 hover:border-amber-500/50 focus-ring"
            >
              <div>
                <div
                  className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
                  aria-hidden
                />
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {certificate.courseTitle}
                      </h3>
                      <p className="inline-flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] mt-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {t('certificates.issuedOn')}{' '}
                          {new Date(certificate.issuedAt).toLocaleDateString()}
                        </span>
                      </p>
                      <div className="mt-2">
                        <span className="text-[11px] text-[var(--color-muted-foreground)] font-mono tracking-wide bg-[var(--surface-muted)] px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                          ID: {certificate.certificateId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-5 py-3 bg-[var(--surface-muted)]/60 border-t border-[var(--border)]/70 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>{t('certificates.viewCertificate')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}
