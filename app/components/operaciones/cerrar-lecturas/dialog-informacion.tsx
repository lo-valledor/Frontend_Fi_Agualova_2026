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
          className='rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40'
        >
          <InfoIcon className='h-5 w-5 text-blue-600 dark:text-blue-400' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2'>
            <InfoIcon className='h-5 w-5' />
            Información de Cierre de Lecturas
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='space-y-4 py-4'>
          <p className='text-sm'>
            El cierre de lecturas es el proceso que permite validar y confirmar
            las lecturas de medidores para su facturación.
          </p>

          {[
            'Verifica las lecturas que tienen claves rojas o naranjas antes de cerrar.',
            'Las lecturas con clave roja requieren revisión obligatoria.',
            'Puedes cerrar lecturas por sector o por nicho según necesites.',
            'Una vez cerradas, las lecturas estarán disponibles para facturación.',
          ].map((text, index) => (
            <div key={index} className='flex gap-3 items-start'>
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                )}
              >
                {index + 1}
              </span>
              <p className='text-sm leading-relaxed'>{text}</p>
            </div>
          ))}

          <div className='border border-border/60 rounded-lg p-3 bg-muted/30 mt-2'>
            <h4 className='text-sm font-medium mb-2'>Tipos de indicadores:</h4>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                >
                  <AlertCircle className='mr-1 h-3 w-3' />
                  Clave Roja
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  Requiere revisión obligatoria
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                >
                  <AlertTriangle className='mr-1 h-3 w-3' />
                  Clave Naranja
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  Posible anomalía, revisar
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                >
                  <CheckCircle className='mr-1 h-3 w-3' />
                  Lecturas OK
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  Lecturas verificadas sin problemas
                </span>
              </div>
            </div>
          </div>
        </DialogDescription>
        <DialogFooter className='sm:justify-end'>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Entendido
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
