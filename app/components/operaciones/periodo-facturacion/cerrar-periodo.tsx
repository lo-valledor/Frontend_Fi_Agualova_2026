import { AlertCircle, Loader2, XCircle } from 'lucide-react';
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
import { cn } from '~/lib/utils';
import { operacionesService } from '~/services/operacionesService';

interface CerrarPeriodoProps {
  periodoId: string;
  onSuccess?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function CerrarPeriodo({
  periodoId,
  onSuccess,
  className,
  disabled = false
}: CerrarPeriodoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCerrarPeriodo = async () => {
    setIsLoading(true);
    try {
      const result =
        await operacionesService.postCerrarPeriodoFacturacion(periodoId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Periodo cerrado correctamente');
      setIsOpen(false);
      onSuccess?.();
    } catch {
      toast.error('Error inesperado al cerrar el periodo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 gap-1 w-full',
            className
          )}
        >
          <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Cerrar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
            <div>
              <AlertDialogTitle className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200">
                Cerrar Período
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Esta acción cerrará el período {periodoId}. ¿Continuar?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-2 my-2">
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
            Al cerrar el período, no se podrán realizar más operaciones a menos
            que sea reabierto.
          </p>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <AlertDialogCancel className="text-muted-foreground hover:text-muted-foreground hover:bg-muted order-2 sm:order-1 text-xs sm:text-sm">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCerrarPeriodo}
            className="gap-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Procesando...</span>
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Cerrar</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
