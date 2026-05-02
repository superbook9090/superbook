'use client';

import Image from 'next/image';

interface LogoProps {
  variant?: 'default' | 'green';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ 
  variant = 'default', 
  size = 'md', 
  className = '',
  width,
  height
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12',
    xl: 'h-12 sm:h-14'
  };

  const defaultDimensions = {
    sm: { width: 84, height: 46 },
    md: { width: 96, height: 52 },
    lg: { width: 120, height: 65 },
    xl: { width: 144, height: 78 }
  };

  const logoSrc = variant === 'green' ? '/logo_green.svg' : '/logo.svg';
  const sizeClass = sizeClasses[size];
  const dimensions = width && height ? { width, height } : defaultDimensions[size];

  return (
    <Image
      src={logoSrc}
      alt="quiz-do logo"
      {...dimensions}
      className={`${sizeClass} w-auto object-contain ${className}`}
    />
  );
}
