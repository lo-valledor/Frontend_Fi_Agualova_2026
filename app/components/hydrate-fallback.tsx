import React from 'react';

import { Card, CardContent } from '~/components/ui/card';

export default function HydrateFallback() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950/30 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='p-8'>
          <div className='flex flex-col items-center gap-6 text-center'>
            {/* Logo o ícono */}
            <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg'>
              <div className='w-8 h-8 bg-white rounded-lg flex items-center justify-center'>
                <div className='w-4 h-4 bg-emerald-600 rounded-sm'></div>
              </div>
            </div>

            {/* Título */}
            <div className='space-y-2'>
              <h2 className='text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-100 dark:to-teal-100 bg-clip-text text-transparent'>
                Enerlova
              </h2>
              <p className='text-sm text-muted-foreground'>
                Cargando módulo...
              </p>
            </div>

            {/* Spinner */}
            <div className='relative'>
              <div className='w-12 h-12 rounded-full border-4 border-emerald-200 dark:border-emerald-800'></div>
              <div className='absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin'></div>
            </div>

            {/* Mensaje de estado */}
            <div className='space-y-1'>
              <p className='text-sm font-medium text-emerald-700 dark:text-emerald-300'>
                Inicializando aplicación
              </p>
              <p className='text-xs text-muted-foreground'>
                Por favor espere mientras cargamos los recursos necesarios
              </p>
            </div>

            {/* Indicador de progreso */}
            <div className='w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-2'>
              <div className='bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full animate-pulse'></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
