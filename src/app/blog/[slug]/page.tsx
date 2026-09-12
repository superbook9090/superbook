export const dynamic = 'force-static';
export const revalidate = 300;
export const dynamicParams = true;

export {
  default,
  generateMetadata,
  generateStaticParams,
} from '@/app/blogs/[slug]/page';
