import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { CircleX, AlertTriangle, Loader2 } from 'lucide-react';
import api from '~/lib/api';
import { toast } from 'sonner';
import { type EstadoCierreLecturas } from '~/types/operaciones';

interface AlertCerrarLecturasProps {
  selectedRows: EstadoCierreLecturas[];
  cicloFact: string;
  periodo: string;
  onSuccess?: () => void;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
}

export default function AlertCerrarLecturas({
  selectedRows,
  cicloFact,
  periodo,
  onSuccess,
  onOpenChange,
  isOpen,
}: AlertCerrarLecturasProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of selectedRows) {
      try {
        const response = await api.post('/cerrar-lecturas-nicho', {
          nichoId: row.nichoId,
          cantLecturas: row.cantidadLecturasOK,
          cicloFact: cicloFact,
          periodo: periodo,
        });
        if (response.status === 200) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error: any) {
        console.error(
          `Error al cerrar lecturas para nicho ${row.nichoId}:`,
          error,
        );
        errorCount++;
      }
    }

    setIsLoading(false);

    if (successCount > 0) {
      toast.success(
        `${successCount} nicho(s) cerrado(s) correctamente${
          errorCount > 0 ? ` (${errorCount} con errores)` : ''
        }`,
      );
    }
    if (errorCount > 0 && successCount === 0) {
      toast.error('Error al cerrar los nichos seleccionados');
    }

    if (onSuccess) {
      onSuccess();
    }
    handleClose();
  };

  const totalLecturas = selectedRows.reduce(
    (acc, row) => acc + row.cantidadLecturasOK,
    0,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
        >
          <CircleX className="h-4 w-4 mr-1" /> Cerrar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Cierre de Lecturas
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              Estás por cerrar{' '}
              <span className="font-bold">{totalLecturas}</span> lecturas para{' '}
              <span className="font-bold">{selectedRows.length}</span> nicho(s)
              del ciclo <span className="font-bold">{cicloFact}</span> del
              periodo <span className="font-bold">{periodo}</span>.
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-2">
              Esta acción es <span className="font-bold">irreversible</span> y
              afectará la facturación de los usuarios.
            </p>
          </div>
          <p className="text-sm font-medium">
            ¿Estás seguro de que deseas continuar?
          </p>
        </DialogDescription>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading || selectedRows.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CircleX className="h-4 w-4 mr-1" />
                Confirmar Cierre
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
