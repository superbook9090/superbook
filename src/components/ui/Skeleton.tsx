'use client';

import React from 'react';

export interface SkeletonProps {
  /** Width of skeleton - can be percentage, px, or tailwind class */
  width?: string;
  /** Height of skeleton - can be px or tailwind class */
  height?: string;
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Base Skeleton component with shimmer animation
 * 
 * @example
 * <Skeleton width="w-full" height="h-32" rounded="lg" />
 */
export default function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`
        ${width}
        ${height}
        ${roundedClasses[rounded]}
        bg-gray-200
        relative
        overflow-hidden
        animate-pulse
        ${className}
      `}
    >
      {/* Shimmer effect overlay */}
      <div
        className="
          absolute
          inset-0
          -translate-x-full
          animate-shimmer
          bg-gradient-to-r
          from-transparent
          via-gray-300/50
          to-transparent
        "
      />
    </div>
  );
}

/**
 * Card skeleton for course/quiz cards
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        bg-white
        rounded-lg
        shadow-sm
        border
        border-gray-200
        overflow-hidden
        animate-pulse
        ${className}
      `}
    >
      {/* Image placeholder */}
      <Skeleton width="w-full" height="h-40" rounded="none" />
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton width="w-3/4" height="h-5" rounded="sm" />
        
        {/* Description lines */}
        <Skeleton width="w-full" height="h-3" rounded="sm" />
        <Skeleton width="w-5/6" height="h-3" rounded="sm" />
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton width="w-20" height="h-4" rounded="sm" />
          <Skeleton width="w-16" height="h-8" rounded="md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Stats card skeleton for dashboard
 */
export function StatsCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        bg-white
        rounded-lg
        shadow-sm
        border
        border-gray-200
        p-4
        sm:p-6
        animate-pulse
        ${className}
      `}
    >
      <div className="flex items-center">
        {/* Icon placeholder */}
        <Skeleton width="w-12" height="h-12" rounded="md" />
        
        <div className="ml-4 space-y-2 flex-1">
          {/* Label */}
          <Skeleton width="w-24" height="h-4" rounded="sm" />
          
          {/* Value */}
          <Skeleton width="w-16" height="h-8" rounded="sm" />
        </div>
      </div>
    </div>
  );
}

/**
 * List item skeleton
 */
export function ListItemSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        flex
        items-center
        py-3
        px-4
        animate-pulse
        ${className}
      `}
    >
      {/* Avatar placeholder */}
      <Skeleton width="w-10" height="h-10" rounded="full" />
      
      <div className="ml-4 flex-1 space-y-2">
        <Skeleton width="w-48" height="h-4" rounded="sm" />
        <Skeleton width="w-32" height="h-3" rounded="sm" />
      </div>
      
      {/* Action placeholder */}
      <Skeleton width="w-16" height="h-6" rounded="sm" />
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ 
  columns = 4, 
  className = '' 
}: { 
  columns?: number; 
  className?: string;
}) {
  return (
    <tr className={`animate-pulse ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton 
            width={i === 0 ? 'w-32' : 'w-20'} 
            height="h-4" 
            rounded="sm" 
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * Dashboard skeleton grid
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <Skeleton width="w-48" height="h-8" rounded="lg" />
        <Skeleton width="w-32" height="h-10" rounded="lg" />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      
      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton width="w-full" height="h-64" rounded="lg" />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          <Skeleton width="w-full" height="h-40" rounded="lg" />
          <Skeleton width="w-full" height="h-40" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Course cards grid skeleton
 */
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Quiz list skeleton
 */
export function QuizListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <Skeleton width="w-48" height="h-6" rounded="sm" />
          <Skeleton width="w-24" height="h-8" rounded="md" />
        </div>
      </div>
      
      {/* List items */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton width="w-48" height="h-5" rounded="sm" />
                <Skeleton width="w-32" height="h-4" rounded="sm" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton width="w-16" height="h-6" rounded="full" />
                <Skeleton width="w-20" height="h-8" rounded="md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6 max-w-2xl">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          {/* Label */}
          <Skeleton width="w-32" height="h-5" rounded="sm" />
          
          {/* Input */}
          <Skeleton width="w-full" height="h-10" rounded="md" />
        </div>
      ))}
      
      {/* Submit button */}
      <div className="flex justify-end pt-4">
        <Skeleton width="w-32" height="h-10" rounded="md" />
      </div>
    </div>
  );
}

/**
 * Profile skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <Skeleton width="w-24" height="h-24" rounded="full" />
        
        <div className="flex-1 space-y-4 text-center sm:text-left">
          {/* Name */}
          <Skeleton width="w-48" height="h-8" rounded="sm" />
          
          {/* Email */}
          <Skeleton width="w-64" height="h-5" rounded="sm" />
          
          {/* Role badge */}
          <Skeleton width="w-24" height="h-6" rounded="full" />
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-4">
            <Skeleton width="w-20" height="h-12" rounded="md" />
            <Skeleton width="w-20" height="h-12" rounded="md" />
            <Skeleton width="w-20" height="h-12" rounded="md" />
          </div>
        </div>
      </div>
    </div>
  );
}
