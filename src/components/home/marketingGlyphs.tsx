'use client';

/**
 * Inline SVG icons for the marketing home page.
 * Avoids lucide-react in lazy-loaded chunks (Turbopack HMR can keep stale icon modules).
 */
import type { ReactNode, SVGProps } from 'react';

type GlyphProps = SVGProps<SVGSVGElement>;

const svgDefaults = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export type HomeFeatureKey =
  | 'structuredCourses'
  | 'curriculumQuizzes'
  | 'progressInsights'
  | 'browseEnroll'
  | 'privateCourses'
  | 'blogsResources';

export type HomeHighlightKey = 'courses' | 'quizzes' | 'languages';

export type HomeAboutCapabilityKey =
  | 'roleBasedAccess'
  | 'realtimeAnalytics'
  | 'multiLanguage'
  | 'organizedContent';

export type HomeHowItWorksStep = 'step1' | 'step2' | 'step3';

export type HomeRoleKey = 'student' | 'teacher' | 'admin';

function Glyph({ children, ...props }: GlyphProps & { children: ReactNode }) {
  return (
    <svg {...svgDefaults} aria-hidden {...props}>
      {children}
    </svg>
  );
}

export function HomeFeatureGlyph({
  featureKey,
  ...props
}: GlyphProps & { featureKey: HomeFeatureKey }) {
  switch (featureKey) {
    case 'structuredCourses':
      return (
        <Glyph {...props}>
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </Glyph>
      );
    case 'curriculumQuizzes':
      return (
        <Glyph {...props}>
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4" />
          <path d="M12 16h4" />
          <path d="M8 11h.01" />
          <path d="M8 16h.01" />
        </Glyph>
      );
    case 'progressInsights':
      return (
        <Glyph {...props}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </Glyph>
      );
    case 'browseEnroll':
      return (
        <Glyph {...props}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </Glyph>
      );
    case 'privateCourses':
      return (
        <Glyph {...props}>
          <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814" />
          <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
          <path d="m21 2-9.6 9.6" />
          <circle cx="7.5" cy="15.5" r=".5" fill="currentColor" />
        </Glyph>
      );
    case 'blogsResources':
      return (
        <Glyph {...props}>
          <path d="M15 18h-5" />
          <path d="M18 14h-8" />
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2" />
          <rect width="8" height="4" x="10" y="6" rx="1" />
        </Glyph>
      );
    default:
      return <HomeFeatureGlyph featureKey="structuredCourses" {...props} />;
  }
}

export function HomeHighlightGlyph({
  highlightKey,
  ...props
}: GlyphProps & { highlightKey: HomeHighlightKey }) {
  switch (highlightKey) {
    case 'courses':
      return <HomeFeatureGlyph featureKey="structuredCourses" {...props} />;
    case 'quizzes':
      return (
        <Glyph {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </Glyph>
      );
    case 'languages':
      return (
        <Glyph {...props}>
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </Glyph>
      );
    default:
      return <HomeHighlightGlyph highlightKey="courses" {...props} />;
  }
}

export function HomeHowItWorksGlyph({
  step,
  ...props
}: GlyphProps & { step: HomeHowItWorksStep }) {
  switch (step) {
    case 'step1':
      return (
        <Glyph {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" x2="19" y1="8" y2="14" />
          <line x1="22" x2="16" y1="11" y2="11" />
        </Glyph>
      );
    case 'step2':
      return <HomeFeatureGlyph featureKey="structuredCourses" {...props} />;
    case 'step3':
      return (
        <Glyph {...props}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </Glyph>
      );
    default:
      return <HomeHowItWorksGlyph step="step1" {...props} />;
  }
}

export function HomeRoleGlyph({ roleKey, ...props }: GlyphProps & { roleKey: HomeRoleKey }) {
  switch (roleKey) {
    case 'student':
      return (
        <Glyph {...props}>
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </Glyph>
      );
    case 'teacher':
      return (
        <Glyph {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M16 3.128a4 4 0 0 1 0 7.744" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <circle cx="9" cy="7" r="4" />
        </Glyph>
      );
    case 'admin':
      return (
        <Glyph {...props}>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </Glyph>
      );
    default:
      return <HomeRoleGlyph roleKey="student" {...props} />;
  }
}

export function DashboardGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </Glyph>
  );
}

export function HomeAboutCapabilityGlyph({
  capabilityKey,
  ...props
}: GlyphProps & { capabilityKey: HomeAboutCapabilityKey }) {
  switch (capabilityKey) {
    case 'roleBasedAccess':
      return <HomeRoleGlyph roleKey="admin" {...props} />;
    case 'realtimeAnalytics':
      return <HomeFeatureGlyph featureKey="progressInsights" {...props} />;
    case 'multiLanguage':
      return <HomeHighlightGlyph highlightKey="languages" {...props} />;
    case 'organizedContent':
      return <HomeFeatureGlyph featureKey="curriculumQuizzes" {...props} />;
    default:
      return <HomeAboutCapabilityGlyph capabilityKey="roleBasedAccess" {...props} />;
  }
}
