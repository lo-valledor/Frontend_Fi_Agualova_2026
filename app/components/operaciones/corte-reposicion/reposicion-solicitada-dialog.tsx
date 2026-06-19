import { AlertTriangle, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
}

export function ReposicionSolicitadaDialog({
  acometida,
  onSuccess
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
      toast.error(
        'Error al solicitar reposición. Intente nuevamente.',
        error as any
      );
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
                variant="outline"
                size="icon"
                className="h-8 w-8 border-sky-500 text-sky-500 hover:bg-sky-50 hover:border-sky-600 dark:border-sky-700 dark:text-sky-400 dark:hover:bg-sky-900/30 dark:hover:border-sky-600 transition-colors"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Solicitar Reposición</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent className="mx-4 sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 shrink-0">
              <Undo2 className="h-3 w-3 text-white" />
            </div>
            <span className="truncate">Solicitar Reposición - {acometida}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Confirme la solicitud de reposición
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div className="bg-muted rounded-lg p-3 border">
            <p className="text-xs text-muted-foreground">
              Esta acción solicitará la reposición para la acometida{' '}
              <span className="font-mono font-medium">{acometida}</span>.
            </p>
          </div>
          <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Esta acción no se puede deshacer una vez confirmada.
            </p>
          </div>
        </div>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isSubmitting}
            className="text-xs h-8 flex-1"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="text-xs h-8 flex-1"
          >
            <Undo2 className="h-3 w-3 mr-1" />
            {isSubmitting ? 'Procesando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
