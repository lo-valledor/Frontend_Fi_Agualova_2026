import React from 'react';

import { Card, CardContent } from '~/components/ui/card';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({
  message = 'Cargando...',
  size = 'md',
  className = '',
}: LoadingStateProps) {
  const spinnerSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const containerSizes = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
  };

  return (
    <div
      className={`flex items-center justify-center ${containerSizes[size]} w-full ${className}`}
    >
      <div className='flex flex-col items-center'>
        <div
          className={`animate-spin rounded-full ${spinnerSizes[size]} border-b-2 border-indigo-600`}
        ></div>
        {message && (
          <p className='text-gray-500 dark:text-gray-400 mt-4'>{message}</p>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  message?: string;
  className?: string;
}

export function EmptyState({
  message = 'No se encontraron datos',
  className = '',
}: EmptyStateProps) {
  return (
    <Card className={`mt-4 ${className}`}>
      <CardContent className='flex items-center justify-center p-8'>
        <p className='text-gray-500 dark:text-gray-400'>{message}</p>
      </CardContent>
    </Card>
  );
}
