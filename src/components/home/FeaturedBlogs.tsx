import Link from 'next/link';
import { listPublicBlogs, buildPublicBlogPath } from '@/lib/blogs/public';
import { ROUTES } from '@/constants/routes';
import { isFeatureEnabled } from '@/lib/settingsHelpers';
import { translate } from '@/i18n';

export default async function FeaturedBlogs() {
  if (!(await isFeatureEnabled('enableBlogs'))) {
    return null;
  }

  const t = (key: Parameters<typeof translate>[1]) => translate('en', key);

  let blogs: Awaited<ReturnType<typeof listPublicBlogs>>['blogs'] = [];

  try {
    const data = await listPublicBlogs({ page: 1, limit: 3, featuredOnly: true, sort: 'latest' });
    blogs = data.blogs;
    if (blogs.length === 0) {
      const fallback = await listPublicBlogs({ page: 1, limit: 3, sort: 'latest' });
      blogs = fallback.blogs;
    }
  } catch {
    return null;
  }

  if (blogs.length === 0) return null;

  return (
    <section className="py-16 bg-[var(--color-surface-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold text-[var(--color-foreground)]"
              data-i18n-key="home.featuredBlogs.title"
            >
              {t('home.featuredBlogs.title')}
            </h2>
            <p
              className="mt-2 text-[var(--color-muted-foreground)]"
              data-i18n-key="home.featuredBlogs.subtitle"
            >
              {t('home.featuredBlogs.subtitle')}
            </p>
          </div>
          <Link
            href={ROUTES.blogs}
            className="hidden sm:inline-flex text-[var(--color-primary)] font-semibold hover:underline"
            data-i18n-key="home.featuredBlogs.viewAll"
          >
            {t('home.featuredBlogs.viewAll')}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <article
              key={blog._id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-6 hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] mb-2">
                {blog.topic}
              </p>
              <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2">
                <Link href={buildPublicBlogPath(blog.slug)} className="hover:text-[var(--color-primary)]">
                  {blog.title}
                </Link>
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-3 mb-4">{blog.excerpt}</p>
              <div className="text-xs text-[var(--color-muted-foreground)]">
                {blog.readingTimeMinutes}{' '}
                <span data-i18n-key="home.featuredBlogs.minReadUnit">{t('home.featuredBlogs.minReadUnit')}</span>
                {blog.author?.name && ` · ${blog.author.name}`}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link
            href={ROUTES.blogs}
            className="text-[var(--color-primary)] font-semibold hover:underline"
            data-i18n-key="home.featuredBlogs.viewAll"
          >
            {t('home.featuredBlogs.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
