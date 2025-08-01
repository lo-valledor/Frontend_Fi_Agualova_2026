import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  InfoIcon,
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { cn } from '~/lib/utils';

export default function DialogInformacion() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 h-8 w-8 sm:h-10 sm:w-10'
        >
          <InfoIcon className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-lg sm:text-xl font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2'>
            <InfoIcon className='h-4 w-4 sm:h-5 sm:w-5' />
            <span className='hidden sm:inline'>Información de Cierre de Lecturas</span>
            <span className='sm:hidden'>Info Cierre Lecturas</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='space-y-3 sm:space-y-4 py-3 sm:py-4'>
          <p className='text-xs sm:text-sm'>
            <span className='hidden sm:inline'>El cierre de lecturas es el proceso que permite validar y confirmar las lecturas de medidores para su facturación.</span>
            <span className='sm:hidden'>Proceso para validar lecturas de medidores para facturación.</span>
          </p>

          {[
            {
              full: 'Verifica las lecturas que tienen claves rojas o naranjas antes de cerrar.',
              short: 'Verifica claves rojas/naranjas antes de cerrar.'
            },
            {
              full: 'Las lecturas con clave roja requieren revisión obligatoria.',
              short: 'Clave roja requiere revisión obligatoria.'
            },
            {
              full: 'Puedes cerrar lecturas por sector o por nicho según necesites.',
              short: 'Cierra por sector o nicho según necesites.'
            },
            {
              full: 'Una vez cerradas, las lecturas estarán disponibles para facturación.',
              short: 'Lecturas cerradas disponibles para facturación.'
            },
          ].map((item, index) => (
            <div key={index} className='flex gap-2 sm:gap-3 items-start'>
              <span
                className={cn(
                  'flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-semibold',
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                )}
              >
                {index + 1}
              </span>
              <p className='text-xs sm:text-sm leading-relaxed'>
                <span className='hidden sm:inline'>{item.full}</span>
                <span className='sm:hidden'>{item.short}</span>
              </p>
            </div>
          ))}

          <div className='border border-border/60 rounded-lg p-2 sm:p-3 bg-muted/30 mt-2'>
            <h4 className='text-xs sm:text-sm font-medium mb-2'>
              <span className='hidden sm:inline'>Tipos de indicadores:</span>
              <span className='sm:hidden'>Indicadores:</span>
            </h4>
            <div className='space-y-1.5 sm:space-y-2'>
              <div className='flex items-center gap-1.5 sm:gap-2'>
                <Badge
                  variant='outline'
                  className='bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 text-xs px-1.5 sm:px-2'
                >
                  <AlertCircle className='mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3' />
                  <span className='hidden sm:inline'>Clave Roja</span>
                  <span className='sm:hidden'>Roja</span>
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  <span className='hidden sm:inline'>Requiere revisión obligatoria</span>
                  <span className='sm:hidden'>Revisión obligatoria</span>
                </span>
              </div>
              <div className='flex items-center gap-1.5 sm:gap-2'>
                <Badge
                  variant='outline'
                  className='bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 text-xs px-1.5 sm:px-2'
                >
                  <AlertTriangle className='mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3' />
                  <span className='hidden sm:inline'>Clave Naranja</span>
                  <span className='sm:hidden'>Naranja</span>
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  <span className='hidden sm:inline'>Posible anomalía, revisar</span>
                  <span className='sm:hidden'>Posible anomalía</span>
                </span>
              </div>
              <div className='flex items-center gap-1.5 sm:gap-2'>
                <Badge
                  variant='outline'
                  className='bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-xs px-1.5 sm:px-2'
                >
                  <CheckCircle className='mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3' />
                  <span className='hidden sm:inline'>Lecturas OK</span>
                  <span className='sm:hidden'>OK</span>
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  <span className='hidden sm:inline'>Lecturas verificadas sin problemas</span>
                  <span className='sm:hidden'>Sin problemas</span>
                </span>
              </div>
            </div>
          </div>
        </DialogDescription>
        <DialogFooter className='pt-3 sm:pt-4'>
          <DialogClose asChild>
            <Button type='button' variant='secondary' size='sm' className='w-full sm:w-auto text-xs sm:text-sm'>
              Entendido
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
