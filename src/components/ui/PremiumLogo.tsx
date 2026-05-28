'use client';

import Logo from './Logo';

interface PremiumLogoProps {
  variant?: 'default' | 'green';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'student' | 'teacher' | 'white' | 'dark';
  priority?: boolean;
}

export default function PremiumLogo({ 
  variant = 'default', 
  size = 'md', 
  className = '',
  theme = 'student',
  priority = false
}: PremiumLogoProps) {
  // Theme-based background colors for better contrast
  const getBackgroundClass = () => {
    switch (theme) {
      case 'student':
        return 'bg-white/90';
      case 'teacher':
        return 'bg-white/90';
      case 'white':
        return 'bg-white/95';
      case 'dark':
        return 'bg-white/20';
      default:
        return 'bg-white/90';
    }
  };

  // Size-based padding
  const getPaddingClass = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1.5';
      case 'md':
        return 'px-3 py-2';
      case 'lg':
        return 'px-3 py-2';
      case 'xl':
        return 'px-3 py-2';
      default:
        return 'px-3 py-2';
    }
  };

  return (
    <div className={`flex items-center ${getPaddingClass()} rounded-xl ${getBackgroundClass()} shadow-sm ${className}`}>
      <Logo 
        variant={variant}
        size={size}
        priority={priority}
        className="h-8 sm:h-9 w-auto object-contain"
      />
    </div>
  );
}
