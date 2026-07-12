import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { isFeatureEnabled } from '@/lib/settingsHelpers';
import { translate } from '@/i18n';
import { SeoLandingGrid } from '@/components/home/SeoLandingGrid';

export default async function SeoResources() {
  const [enableBlogs, enableCourses] = await Promise.all([
    isFeatureEnabled('enableBlogs'),
    isFeatureEnabled('enableCourses'),
  ]);

  const t = (key: Parameters<typeof translate>[1]) => translate('en', key);

  const extraLinks = [
    { href: '/tools', labelKey: 'home.seoResources.allEducationTools' as const },
    ...(enableBlogs ? [{ href: ROUTES.blogs, labelKey: 'home.seoResources.educationalBlogs' as const }] : []),
    ...(enableCourses ? [{ href: '/courses', labelKey: 'home.seoResources.freeOnlineCourses' as const }] : []),
    { href: ROUTES.howItWorks, labelKey: 'home.seoResources.howItWorks' as const },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10 max-w-2xl mx-auto">
          <h2
            className="text-3xl font-bold text-[var(--color-foreground)]"
            data-i18n-key="home.seoResources.title"
          >
            {t('home.seoResources.title')}
          </h2>
          <p
            className="mt-3 text-[var(--color-muted-foreground)]"
            data-i18n-key="home.seoResources.subtitle"
          >
            {t('home.seoResources.subtitle')}
          </p>
        </header>

        <SeoLandingGrid />

        <div className="flex flex-wrap justify-center gap-3">
          {extraLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] underline-offset-2 hover:underline"
              data-i18n-key={link.labelKey}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
