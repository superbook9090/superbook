'use client';

import React from 'react';

export interface LoaderProps {
  /** Loader variant type */
  variant?: 'full-page' | 'button' | 'section';
  /** Size of the loader */
  size?: 'sm' | 'md' | 'lg';
  /** Optional loading text */
  text?: string;
  /** Optional className for custom styling */
  className?: string;
  /** Optional background overlay for section loader */
  overlay?: boolean;
}

/**
 * Modern, smooth Loader component with multiple variants
 * 
 * @example
 * // Full page loader
 * <Loader variant="full-page" size="lg" text="Loading courses..." />
 * 
 * @example
 * // Button loader
 * <Loader variant="button" size="sm" />
 * 
 * @example
 * // Section loader with overlay
 * <Loader variant="section" size="md" text="Loading..." overlay />
 */
export default function Loader({
  variant = 'section',
  size = 'md',
  text,
  className = '',
  overlay = false,
}: LoaderProps) {
  // Size configurations
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  // Spinner component with gradient animation
  const Spinner = ({ className: extraClass = '' }: { className?: string }) => (
    <div
      className={`
        ${sizeClasses[size]}
        border-gray-200
        border-t-indigo-600
        border-r-indigo-600
        rounded-full
        animate-spin
        ${extraClass}
      `}
      style={{
        borderTopWidth: variant === 'button' ? '2px' : undefined,
        borderRightWidth: variant === 'button' ? '2px' : undefined,
      }}
    />
  );

  // Dots loader for button variant (alternative)
  const DotsLoader = () => (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            rounded-full
            bg-current
            animate-bounce
            ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2'}
          `}
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );

  // Full page loader
  if (variant === 'full-page') {
    return (
      <div
        className={`
          fixed
          inset-0
          z-50
          flex
          flex-col
          items-center
          justify-center
          bg-white/80
          backdrop-blur-sm
          transition-all
          duration-300
          ${className}
        `}
      >
        <div className="relative">
          {/* Outer ring with pulse */}
          <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-20" />
          
          {/* Main spinner */}
          <div
            className={`
              ${sizeClasses[size]}
              border-gray-200
              border-t-indigo-600
              border-r-indigo-600
              rounded-full
              animate-spin
              relative
            `}
            style={{ borderWidth: '3px' }}
          />
        </div>
        
        {text && (
          <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  // Button loader
  if (variant === 'button') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <DotsLoader />
      </div>
    );
  }

  // Section loader (default)
  return (
    <div
      className={`
        relative
        flex
        flex-col
        items-center
        justify-center
        py-12
        ${overlay ? 'bg-white/60 backdrop-blur-sm rounded-lg' : ''}
        ${className}
      `}
    >
      <Spinner />
      
      {text && (
        <p className="mt-3 text-sm text-gray-500 font-medium">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * LoadingButton component - Button with integrated loader
 */
export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
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
  const baseClasses =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400',
    secondary:
      'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 disabled:text-gray-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * LoadingOverlay component - Overlay with loader for blocking interactions
 */
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
        <div
          className="
            absolute
            inset-0
            z-40
            flex
            flex-col
            items-center
            justify-center
            bg-white/70
            backdrop-blur-sm
            rounded-lg
            transition-all
            duration-200
          "
        >
          <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          
          {text && (
            <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>
          )}
        </div>
      )}
    </div>
  );
}
