import { AlertTriangle, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useActivityEvent } from '~/components/activity-tracker-hoc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import api from '~/lib/api';

interface ReposicionSolicitadaDialogProps {
  acometida: string;
  onSuccess: () => void;
}

export function ReposicionSolicitadaDialog({
  acometida,
  onSuccess,
}: ReposicionSolicitadaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { trackDataAction } = useActivityEvent();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      trackDataAction(
        'Solicitar',
        'Corte y Reposición',
        `Reposición solicitada para acometida ${acometida}`
      );
      await api.post('reposicion-solicitada', null, {
        params: { acometida },
      });
      toast.success('Reposición solicitada correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error al solicitar reposición:', error);
      toast.error('Error al solicitar reposición. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8 border-sky-500 text-sky-500 hover:bg-sky-50 hover:border-sky-600 dark:border-sky-700 dark:text-sky-400 dark:hover:bg-sky-900/30 dark:hover:border-sky-600 transition-colors'
              >
                <Undo2 className='h-4 w-4' />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Solicitar Reposición</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent className='sm:max-w-md rounded-xl border border-sky-200/40 bg-white/95 backdrop-blur-sm dark:border-sky-800/40 dark:bg-gray-900/95'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-sky-900 dark:text-sky-100'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white'>
              <Undo2 className='h-3 w-3' />
            </div>
            ¿Solicitar Reposición?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-sky-700 dark:text-sky-300'>
            <div className='space-y-2'>
              <p>
                Esta acción solicitará la reposición para la acometida{' '}
                <span className='font-mono font-medium'>{acometida}</span>.
              </p>
              <div className='flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800'>
                <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
                <p className='text-sm text-amber-700 dark:text-amber-300'>
                  Esta acción no se puede deshacer una vez confirmada.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className='bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white'
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
