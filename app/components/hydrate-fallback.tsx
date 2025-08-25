import { Loader2, Zap } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';

interface HydrateFallbackProps {
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function HydrateFallback({
  title = 'Cargando aplicación...',
  description = 'Estamos preparando todo para ti. Esto solo tomará un momento.',
  showRetry = false,
  onRetry
}: HydrateFallbackProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card className='border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'>
          <CardHeader className='text-center pb-4'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg'>
              <Zap className='h-8 w-8 text-white' />
            </div>
            <CardTitle className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              {title}
            </CardTitle>
            <CardDescription className='text-slate-600 dark:text-slate-400'>
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Loading Animation */}
            <div className='flex justify-center'>
              <div className='relative'>
                <div className='h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700'></div>
                <div className='absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin'></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='space-y-2'>
              <div className='flex justify-between text-sm text-slate-600 dark:text-slate-400'>
                <span>Inicializando módulos...</span>
                <span className='font-mono'>75%</span>
              </div>
              <div className='h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse'
                  style={{ width: '75%' }}
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
                <span>Inicializando servicios</span>
              </div>
              <div className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                <div className='h-2 w-2 rounded-full bg-yellow-500 animate-pulse'></div>
                <span>Preparando datos</span>
              </div>
            </div>

            {/* Retry Button */}
            {showRetry && onRetry && (
              <div className='pt-4'>
                <Button onClick={onRetry} variant='outline' className='w-full'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Reintentar
                </Button>
              </div>
            )}

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
}

export default HydrateFallback;
