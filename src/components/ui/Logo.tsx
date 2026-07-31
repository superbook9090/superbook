import BrandLogo from './BrandLogo';

interface LogoProps {
  /** Legacy prop — the SVG mark is theme-aware now, variants are identical. */
  variant?: 'default' | 'green';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return <BrandLogo size={size} className={className} />;
}
