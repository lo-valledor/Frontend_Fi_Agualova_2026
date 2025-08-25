import { RefreshCw } from 'lucide-react';

import React from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

interface ProfileLoadingStateProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const ProfileLoadingState: React.FC<ProfileLoadingStateProps> = ({
  message = 'Cargando datos del perfil...',
  showRetry = false,
  onRetry
}) => {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header con spinner */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-sky-600' />
              <div className='h-12 w-12 absolute top-0 left-0 animate-ping rounded-full border-2 border-sky-400 opacity-75' />
            </div>
            <div>
              <Skeleton className='h-8 w-32 mb-2' />
              <Skeleton className='h-4 w-64' />
            </div>
          </div>
        </div>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Reintentar
          </Button>
        )}
      </div>

      {/* Mensaje de carga */}
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>{message}</p>
        <div className='flex justify-center space-x-1 mt-4'>
          <div
            className='w-2 h-2 bg-sky-600 rounded-full animate-bounce'
            style={{ animationDelay: '0ms' }}
          />
          <div
            className='w-2 h-2 bg-sky-600 rounded-full animate-bounce'
            style={{ animationDelay: '150ms' }}
          />
          <div
            className='w-2 h-2 bg-sky-600 rounded-full animate-bounce'
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Información Principal - 2 columnas */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Información Personal Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-5 w-5 rounded' />
                <Skeleton className='h-6 w-40' />
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-10 w-full' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-10 w-full' />
                </div>
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-10 w-full' />
              </div>
            </CardContent>
          </Card>

          {/* Seguridad Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-5 w-5 rounded' />
                <Skeleton className='h-6 w-24' />
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-10 w-full' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 columna */}
        <div className='space-y-6'>
          {/* Información de la Cuenta Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-5 w-5 rounded' />
                <Skeleton className='h-6 w-36' />
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-6 w-20' />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Información de Sesión Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-5 w-5 rounded' />
                <Skeleton className='h-6 w-40' />
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {[...Array(2)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-6 w-24' />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
