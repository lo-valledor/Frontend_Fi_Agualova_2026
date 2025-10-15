import { Loader2, Zap } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';

interface LoadingStateProps {
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'inline' | 'fullscreen';
}

export function LoadingState({
  title = 'Cargando...',
  description = 'Por favor espera mientras procesamos tu solicitud.',
  showRetry = false,
  onRetry,
  size = 'md',
  variant = 'default'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (variant === 'inline') {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <div
              className={`${sizeClasses[size]} rounded-full border-2 border-border`}
            ></div>
            <div
              className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-2 border-transparent  animate-spin`}
            ></div>
          </div>
          <div className='text-sm'>{title}</div>
        </div>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <Card className='border-0 shadow-2xl bg-background backdrop-blur-sm'>
            <CardHeader className='text-center pb-4'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full  shadow-lg'>
                <Zap className='h-8 w-8' />
              </div>
              <CardTitle className='text-xl font-semibold'>{title}</CardTitle>
              <CardDescription className=''>{description}</CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <div className='flex justify-center'>
                <div className='relative'>
                  <div className='h-12 w-12 rounded-full border-4 border-border'></div>
                  <div className='absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-transparent  animate-spin'></div>
                </div>
              </div>

              {showRetry && onRetry && (
                <div className='pt-4'>
                  <Button
                    onClick={onRetry}
                    variant='outline'
                    className='w-full'
                  >
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Reintentar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className='flex flex-col items-center justify-center p-8 space-y-4'>
      <div className='relative'>
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-border`}
        ></div>
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-2 border-transparent  animate-spin`}
        ></div>
      </div>

      <div className='text-center space-y-2'>
        <h3 className='text-lg font-semibold'>{title}</h3>
        <p className='text-sm'>{description}</p>
      </div>

      {showRetry && onRetry && (
        <Button onClick={onRetry} variant='outline' size='sm'>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default LoadingState;

interface EmptyStateProps {
  message?: string;
  className?: string;
}

export function EmptyState({
  message = 'No se encontraron datos',
  className = ''
}: EmptyStateProps) {
  return (
    <Card className={`mt-4 ${className}`}>
      <CardContent className='flex items-center justify-center p-8'>
        <p className=''>{message}</p>
      </CardContent>
    </Card>
  );
}
