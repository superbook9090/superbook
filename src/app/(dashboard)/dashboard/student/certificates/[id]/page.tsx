// src/app/(dashboard)/dashboard/student/certificates/[id]/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { getCertificate } from '@/lib/api/certificates';
import { Award, ArrowLeft, Printer } from 'lucide-react';

export default function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    data: certificate,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['certificates', id],
    queryFn: () => getCertificate(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  if (error || !certificate) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-muted-foreground)]">{t('certificates.notFound')}</p>
        <Link
          href={ROUTES.student.certificates}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--student-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('certificates.backToCertificates')}
        </Link>
      </div>
    );
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      {/* Print rules: show only the certificate itself when printing. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-sheet, #certificate-sheet * { visibility: visible; }
          #certificate-sheet {
            position: fixed;
            inset: 0;
            margin: 0;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <Link
          href={ROUTES.student.certificates}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--student-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('certificates.backToCertificates')}
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] hover:opacity-90 transition-opacity"
        >
          <Printer className="w-4 h-4" />
          {t('certificates.printDownload')}
        </button>
      </div>

      <div
        id="certificate-sheet"
        className="mt-6 mx-auto max-w-3xl bg-white text-gray-900 rounded-lg shadow-xl overflow-hidden"
      >
        <div className="border-[12px] border-double border-amber-600/70 m-3 sm:m-4 px-6 py-10 sm:px-12 sm:py-14 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-700">
              <Award className="w-10 h-10" />
            </div>
          </div>

          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-amber-700 font-semibold">
            {t('certificates.certificateOfCompletion')}
          </p>

          <p className="mt-8 text-sm text-gray-500">{t('certificates.presentedTo')}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            {certificate.studentName}
          </h1>

          <p className="mt-8 text-sm text-gray-500">{t('certificates.forCompleting')}</p>
          <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-800">
            {certificate.courseTitle}
          </h2>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-16 text-sm">
            {certificate.instructorName && (
              <div>
                <p className="font-semibold text-gray-800 border-t border-gray-300 pt-2 px-6">
                  {certificate.instructorName}
                </p>
                <p className="text-gray-500 mt-1">{t('certificates.instructor')}</p>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800 border-t border-gray-300 pt-2 px-6">{issuedDate}</p>
              <p className="text-gray-500 mt-1">{t('certificates.issuedOn')}</p>
            </div>
          </div>

          <p className="mt-10 text-[11px] text-gray-400 font-mono">
            {t('certificates.certificateIdLabel')}: {certificate.certificateId}
          </p>
        </div>
      </div>
    </div>
  );
}
