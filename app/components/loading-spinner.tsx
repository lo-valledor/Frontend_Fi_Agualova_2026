import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  message = 'Cargando...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen
          ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50'
          : 'h-full min-h-[200px]'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={`inline-block ${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-sky-600 border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
          role="status"
        >
          <span className="sr-only">Cargando...</span>
        </div>
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
