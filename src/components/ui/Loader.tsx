'use client';

import React from 'react';
import { useRoleTheme } from '@/contexts/RoleThemeContext';

export interface LoaderProps {
  variant?: 'page' | 'inline' | 'button';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
};

function Spinner({ size }: { size: keyof typeof sizes }) {
  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full
        border-2
        border-gray-200
        border-t-indigo-600
        border-r-purple-600
        animate-spin
        shadow-sm
        shadow-indigo-500/20
      `}
      style={{ animationDuration: '1s' }}
    />
  );
}

export default function Loader({
  variant = 'inline',
  size = 'md',
  text,
  className = '',
}: LoaderProps) {
  // Page loader - full screen with blur
  if (variant === 'page') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300"
        role="status"
        aria-busy="true"
      >
        <div className="animate-in zoom-in duration-300">
          <Spinner size={size} />
        </div>
        {text && (
          <p className={`mt-4 ${textSizes[size]} text-gray-600 font-medium animate-in slide-in-from-bottom-4 duration-300`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Button loader - inline, no text
  if (variant === 'button') {
    return (
      <span className={`inline-flex items-center ${className} animate-in fade-in duration-200`} role="status" aria-busy="true">
        <Spinner size="sm" />
      </span>
    );
  }

  // Inline loader - section with optional text
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className} animate-in fade-in duration-200`} role="status" aria-busy="true">
      <Spinner size={size} />
      {text && (
        <p className={`mt-3 ${textSizes[size]} text-gray-600 font-medium animate-in slide-in-from-bottom-2 duration-300`}>
          {text}
        </p>
      )}
    </div>
  );
}

// LoadingButton - Button with integrated loader
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  const { theme } = useRoleTheme();
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: `bg-gradient-to-r ${theme.gradient} text-white hover:opacity-90 disabled:opacity-50`,
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 disabled:text-gray-400',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader variant="button" />
          <span className="ml-2">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// LoadingOverlay - Simple overlay with loader
export interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  text,
  children,
  className = '',
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <Spinner size="md" />
          {text && <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>}
        </div>
      )}
    </div>
  );
}
