import BrandLogo from './BrandLogo';

interface PremiumLogoProps {
  /** Legacy prop — kept for call-site compatibility, no longer changes colors. */
  variant?: 'default' | 'green';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Legacy prop — kept for call-site compatibility. */
  theme?: 'student' | 'teacher' | 'white' | 'dark';
  priority?: boolean;
  /** White outline style for gradient / colored backgrounds. */
  mono?: boolean;
}

export default function PremiumLogo({
  size = 'md',
  className = '',
  mono = false,
}: PremiumLogoProps) {
  return (
    <BrandLogo
      size={size}
      mono={mono}
      className={mono ? `text-white ${className}` : `text-[var(--color-foreground)] ${className}`}
    />
  );
}
