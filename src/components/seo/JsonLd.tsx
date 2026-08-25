import { DEFAULT_DESCRIPTION, getSiteUrl, SITE_NAME } from '@/lib/seo/config';
import { ROUTES } from '@/constants/routes';

type JsonLdProps = {
  /** Include WebSite + SearchAction block on the home page */
  includeWebSite?: boolean;
};

/** Schema.org JSON-LD for education / LMS discoverability. */
export default function JsonLd({ includeWebSite = false }: JsonLdProps) {
  const siteUrl = getSiteUrl();

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: [
      'Quiz Maker',
      'Free Quiz Maker',
      'Online Quiz Maker',
      'Quiz Do Free Quiz Maker',
      'Interactive Learning Platform',
      'Gamified Quizzes',
    ],
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      'https://www.instagram.com/quiz_do__/',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    knowsAbout: [
      'Free Quiz Maker',
      'Online Quiz Maker',
      'Quiz Creator',
      'MCQ Generator',
      'Learning Management System',
      'Online Education',
      'E-Learning',
      'Online Quizzes',
      'Student Assessment',
      'Course Management',
      'Mock Tests',
      'Timed practice tests',
      'Interactive quiz builder',
      'Exam preparation'
    ],
  };

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Quiz Do Free Quiz Maker',
    alternateName: ['Quiz Maker', 'Free Quiz Maker', 'Online Quiz Creator', 'Interactive Learning Platform'],
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description: DEFAULT_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Free registration for students and educators',
    },
    featureList: [
      'Free online quiz maker',
      'MCQ quiz creator with auto-grading',
      'AI quiz generator from text',
      'Timed mock tests and test series',
      'Online course management',
      'Student progress analytics',
      'Teacher quiz creator dashboard',
      'Multi-language support (English and Hindi)',
    ],
  };

  const graphs: Record<string, unknown>[] = [organization, software];

  if (includeWebSite) {
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: SITE_NAME,
      url: siteUrl,
      description: DEFAULT_DESCRIPTION,
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: ['en', 'hi'],
      potentialAction: {
        '@type': 'RegisterAction',
        target: `${siteUrl}${ROUTES.register}`,
        name: 'Create a free learning account',
      },
    });
  }

  const payload = {
    '@context': 'https://schema.org',
    '@graph': graphs,
  };

  return (
    <script
      id="jsonld-website-org"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
