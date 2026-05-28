/**
 * CSS spacing token names from `src/app/globals.css`.
 * Use these in TSX when referencing design tokens via arbitrary values.
 */
export const SPACING = {
  gutterX: '--gutter-x',
  gutterY: '--gutter-y',
  sectionGap: '--section-gap',
  cardPadding: '--card-padding',
  cardGap: '--card-gap',
  formGap: '--form-gap',
  pageMaxWidth: '--page-max-width',
  mobileNavOffset: '--mobile-nav-offset',
  mobileHeaderHeight: '--mobile-header-height',
  mobileHeaderGap: '--mobile-header-gap',
} as const;

export const SPACING_CLASSES = {
  page: 'stack-page',
  pageCompact: 'stack-page stack-page--compact',
  cardBody: 'card-body',
  cardSurface: 'card-surface',
  cardList: 'card-list',
  cardListItem: 'card-list-item',
  formStack: 'form-stack',
  heroBanner: 'hero-banner',
  statTile: 'stat-tile',
  formField: 'form-field',
  btnAction: 'btn-action',
} as const;

/** Landing / marketing sections — see `src/app/globals.css` */
export const LANDING_CLASSES = {
  section: 'landing-section',
  sectionDefer: 'landing-section-defer',
  container: 'landing-container',
  sectionHeader: 'landing-section-header',
  title: 'landing-title',
  subtitle: 'landing-subtitle',
  surface: 'landing-surface',
  surfaceMuted: 'landing-surface-muted',
  featureGrid: 'landing-feature-grid',
  featureCard: 'landing-feature-card',
  featureCardIconWrap: 'landing-feature-card__icon-wrap',
  featureCardIcon: 'landing-feature-card__icon',
  featureCardTitle: 'landing-feature-card__title',
  featureCardDesc: 'landing-feature-card__desc',
  highlightCard: 'landing-highlight-card',
  highlightCardIconWrap: 'landing-highlight-card__icon-wrap',
  highlightCardIcon: 'landing-highlight-card__icon',
  highlightCardTitle: 'landing-highlight-card__title',
  highlightCardHint: 'landing-highlight-card__hint',
  aboutBg: 'landing-about-bg',
  previewBar: 'landing-preview-bar',
  stepIconWrap: 'landing-step-card__icon-wrap',
  stepIcon: 'landing-step-card__icon',
  stepLabel: 'landing-step-label',
} as const;
