import React from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

interface LoadingSpinnerProps {
  message?: string;
  showSkeleton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  showSkeleton = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (showSkeleton) {
    return (
      <div className='container mx-auto p-6 space-y-6'>
        {/* Header Skeleton */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-12 w-12 rounded-xl' />
              <div>
                <Skeleton className='h-8 w-48 mb-2' />
                <Skeleton className='h-4 w-64' />
              </div>
            </div>
          </div>
          <Skeleton className='h-10 w-32' />
        </div>

        {/* Content Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <Skeleton className='h-6 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center min-h-[40vh]'>
      <div className='text-center space-y-4'>
        <div className='relative'>
          <div
            className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto`}
          />
          <div
            className={`${sizeClasses[size]} absolute top-0 left-0 animate-ping rounded-full border-2 border-blue-400 opacity-75`}
          />
        </div>
        <div className='space-y-2'>
          <p
            className={`${textSizes[size]} font-medium text-gray-700 dark:text-gray-300`}
          >
            {message}
          </p>
          <div className='flex justify-center space-x-1'>
            <div
              className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
              style={{ animationDelay: '0ms' }}
            />
            <div
              className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
              style={{ animationDelay: '150ms' }}
            />
            <div
              className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente específico para carga de módulos
export const ModuleLoadingSpinner: React.FC = () => {
  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <Card className='w-full max-w-md'>
        <CardContent className='p-8 text-center space-y-6'>
          <div className='relative'>
            <div className='h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto' />
            <div className='h-16 w-16 absolute top-0 left-0 animate-ping rounded-full border-2 border-blue-400 opacity-75' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
              Cargando Módulo
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Estamos preparando todo para ti...
            </p>
          </div>
          <div className='flex justify-center space-x-1'>
            <div
              className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
              style={{ animationDelay: '0ms' }}
            />
            <div
              className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
              style={{ animationDelay: '150ms' }}
            />
            <div
              className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
