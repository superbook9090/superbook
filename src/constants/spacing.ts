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

/** @deprecated Use `landing` from `@/components/home/landingStyles` */
export { landing as LANDING_CLASSES } from '@/components/home/landingStyles';
