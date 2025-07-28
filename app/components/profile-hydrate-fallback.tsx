import React from 'react';

import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export const ProfileHydrateFallback: React.FC = () => {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-12 w-12 rounded-xl' />
            <div>
              <Skeleton className='h-8 w-32 mb-2' />
              <Skeleton className='h-4 w-64' />
            </div>
          </div>
        </div>
        <Skeleton className='h-10 w-32' />
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
