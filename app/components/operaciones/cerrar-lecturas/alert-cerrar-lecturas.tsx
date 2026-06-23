import { AlertTriangle, CircleX, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import api from '~/lib/api';

interface AlertCerrarLecturasProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  idsNichos: number[];
  cicloId: number;
  periodoId: string;
  onSuccess?: () => Promise<void> | void;
}

export default function AlertCerrarLecturas({
  isOpen,
  onOpenChange,
  idsNichos,
  cicloId,
  periodoId,
  onSuccess
}: Readonly<AlertCerrarLecturasProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmar = async (): Promise<void> => {
    if (idsNichos.length === 0) {
      toast.error('No hay nichos seleccionados para cerrar');
      return;
    }
    if (!cicloId || !periodoId) {
      toast.error('Faltan datos de ciclo o período');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/cerrar-lecturas/cerrar', {
        idsNichos,
        cicloId,
        periodoId
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success(
          `${idsNichos.length} nicho${idsNichos.length === 1 ? '' : 's'} cerrado${
            idsNichos.length === 1 ? '' : 's'
          } correctamente`
        );
        onOpenChange(false);
        await onSuccess?.();
      } else {
        toast.error('No se pudo cerrar las lecturas');
      }
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error al cerrar las lecturas';
      toast.error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Cierre de Lecturas
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-3 text-sm">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-red-700 dark:text-red-300">
                Estás por cerrar{' '}
                <strong>
                  {idsNichos.length} nicho
                  {idsNichos.length === 1 ? '' : 's'}
                </strong>{' '}
                del ciclo <strong>{cicloId}</strong> del período{' '}
                <strong>{periodoId}</strong>.
              </p>
              <p className="text-red-700 dark:text-red-300 mt-2 text-xs">
                Esta acción es <strong>irreversible</strong> y afectará la
                facturación de los usuarios.
              </p>
            </div>
            <p className="text-foreground">¿Continuar con el cierre?</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isLoading}
              size="sm"
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirmar}
            disabled={isLoading}
            size="sm"
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CircleX className="h-4 w-4 mr-2" />
                Confirmar Cierre
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
