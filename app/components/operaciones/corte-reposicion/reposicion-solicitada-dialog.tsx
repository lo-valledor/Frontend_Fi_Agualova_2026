import { AlertTriangle, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import api from '~/lib/api';

interface ReposicionSolicitadaDialogProps {
  acometida: string;
  onSuccess: () => void;
  disabled?: boolean;
}

export function ReposicionSolicitadaDialog({
  acometida,
  onSuccess,
  disabled = false
}: Readonly<ReposicionSolicitadaDialogProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await api.post('reposicion-solicitada', null, {
        params: { acometida }
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
                disabled={disabled}
              >
                <Undo2 className='h-4 w-4' />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {disabled
                ? 'No tiene permisos para solicitar reposición'
                : 'Solicitar Reposición'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent className='mx-4 sm:max-w-md rounded-xl border border-sky-200/40 bg-white/95 backdrop-blur-sm dark:border-sky-800/40 dark:bg-gray-900/95'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-sky-900 dark:text-sky-100 text-base sm:text-lg'>
            <div className='flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-500 flex-shrink-0'>
              <Undo2 className='h-2.5 w-2.5 sm:h-3 sm:w-3' />
            </div>
            <span className='truncate'>¿Solicitar Reposición?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className='text-sky-700 dark:text-sky-300 text-sm sm:text-base'>
            <div className='space-y-2 sm:space-y-3'>
              <p>
                Esta acción solicitará la reposición para la acometida{' '}
                <span className='font-mono font-medium text-xs sm:text-sm break-all'>
                  {acometida}
                </span>
                .
              </p>
              <div className='flex items-start gap-2 p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800'>
                <AlertTriangle className='h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
                <p className='text-xs sm:text-sm text-amber-700 dark:text-amber-300'>
                  Esta acción no se puede deshacer una vez confirmada.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-col sm:flex-row gap-2 sm:gap-0'>
          <AlertDialogCancel
            disabled={isSubmitting}
            className='w-full sm:w-auto text-sm sm:text-base'
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className='w-full sm:w-auto bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-sm sm:text-base'
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
