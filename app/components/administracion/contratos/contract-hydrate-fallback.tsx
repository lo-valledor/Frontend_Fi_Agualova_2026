import { FileText, Loader2 } from 'lucide-react';

import React from 'react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export const ContractHydrateFallback: React.FC = () => {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header con título y botón */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-8 w-8 rounded-lg' />
            <div>
              <Skeleton className='h-8 w-48 mb-2' />
              <Skeleton className='h-4 w-64' />
            </div>
          </div>
        </div>
        <Skeleton className='h-10 w-40' />
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-5 rounded' />
            <Skeleton className='h-6 w-24' />
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>
          <div className='flex flex-wrap gap-2'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-6 w-20 rounded-full' />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de contratos */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-5 w-5 rounded' />
              <Skeleton className='h-6 w-32' />
            </div>
            <Skeleton className='h-8 w-24' />
          </div>
        </CardHeader>
        <CardContent>
          {/* Header de tabla */}
          <div className='grid grid-cols-6 gap-4 p-4 border-b'>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className='h-4 w-full' />
            ))}
          </div>

          {/* Filas de tabla */}
          {[...Array(8)].map((_, rowIndex) => (
            <div key={rowIndex} className='grid grid-cols-6 gap-4 p-4 border-b'>
              {[...Array(6)].map((_, colIndex) => (
                <div key={colIndex} className='space-y-1'>
                  <Skeleton className='h-4 w-full' />
                  {colIndex === 0 && <Skeleton className='h-3 w-3/4' />}
                </div>
              ))}
            </div>
          ))}

          {/* Paginación */}
          <div className='flex items-center justify-between pt-4'>
            <Skeleton className='h-4 w-32' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-8' />
              <Skeleton className='h-8 w-8' />
              <Skeleton className='h-8 w-8' />
              <Skeleton className='h-8 w-8' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de carga central */}
      <div className='fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'>
        <Card className='w-full max-w-md border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90'>
          <CardHeader className='text-center pb-4'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 shadow-lg'>
              <FileText className='h-8 w-8 text-white' />
            </div>
            <CardTitle className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Cargando Módulo de Contratos
            </CardTitle>
            <CardDescription className='text-slate-600 dark:text-slate-400'>
              Inicializando componentes y preparando datos...
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Loading Animation */}
            <div className='flex justify-center'>
              <div className='relative'>
                <div className='h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700'></div>
                <div className='absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-transparent border-t-sky-600 dark:border-t-sky-400 animate-spin'></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='space-y-2'>
              <div className='flex justify-between text-sm text-slate-600 dark:text-slate-400'>
                <span>Inicializando módulos...</span>
                <span className='font-mono'>85%</span>
              </div>
              <div className='h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full animate-pulse'
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>

            {/* Status Messages */}
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse'></div>
                <span>Cargando componentes UI</span>
              </div>
              <div className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                <div className='h-2 w-2 rounded-full bg-blue-500 animate-pulse'></div>
                <span>Inicializando servicios de contratos</span>
              </div>
              <div className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                <div className='h-2 w-2 rounded-full bg-yellow-500 animate-pulse'></div>
                <span>Preparando datos de contratos</span>
              </div>
            </div>

            {/* Retry Button */}
            <div className='pt-4'>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                className='w-full'
              >
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Reintentar Carga
              </Button>
            </div>

            {/* Tips */}
            <div className='text-xs text-slate-500 dark:text-slate-500 text-center pt-4 border-t border-slate-200 dark:border-slate-700'>
              <p>
                💡 Tip: Si la carga toma más de 30 segundos, intenta recargar la
                página
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractHydrateFallback;
