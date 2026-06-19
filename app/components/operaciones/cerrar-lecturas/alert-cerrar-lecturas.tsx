import { AlertTriangle, CircleX, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import api from '~/lib/api';
import { type EstadoCierreLecturas } from '~/types/operaciones';

interface AlertCerrarLecturasProps {
  selectedRows: EstadoCierreLecturas[];
  cicloFact: string;
  periodo: string;
  onSuccess?: () => void;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  totalLecturas: number;
}

export default function AlertCerrarLecturas({
  selectedRows,
  cicloFact,
  periodo,
  onSuccess,
  onOpenChange,
  isOpen,
  totalLecturas
}: AlertCerrarLecturasProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Calcular alertas en las filas seleccionadas
  const alertSummary = useMemo(() => {
    const warningRows = selectedRows.filter(
      row => row.cantidadClaveNaranja > 0
    );
    const warningCount = warningRows.reduce(
      (acc, row) => acc + row.cantidadClaveNaranja,
      0
    );

    return {
      hasWarnings: warningRows.length > 0,
      warningCount,
      warningNichos: warningRows.map(row => row.nichoDescripcion)
    };
  }, [selectedRows]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of selectedRows) {
      try {
        const cantLecturas =
          row.cantidadLecturasOK +
          row.cantidadClaveRoja +
          row.cantidadClaveNaranja +
          row.cantidadCorregidas;
        const response = await api.post('/cerrar-lecturas-nicho', {
          nichoId: row.nichoId,
          cantLecturas: cantLecturas,
          cicloFact: cicloFact,
          periodo: periodo
        });
        if (response.status === 200) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error: any) {
        console.error(
          `Error al cerrar lecturas para nicho ${row.nichoId}:`,
          error
        );
        errorCount++;
      }
    }

    setIsLoading(false);

    if (successCount > 0) {
      toast.success(
        `${successCount} nicho(s) cerrado(s) correctamente${
          errorCount > 0 ? ` (${errorCount} con errores)` : ''
        }`
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
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">
              Confirmar Cierre de Lecturas
            </span>
            <span className="sm:hidden">Confirmar Cierre</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed">
              <span className="hidden sm:inline">
                Estás por cerrar{' '}
                <span className="font-bold">{totalLecturas}</span> lecturas para{' '}
                <span className="font-bold">{selectedRows.length}</span>{' '}
                nicho(s) del ciclo{' '}
                <span className="font-bold">{cicloFact}</span> del periodo{' '}
                <span className="font-bold">{periodo}</span>.
              </span>
              <span className="sm:hidden">
                Cerrar <span className="font-bold">{totalLecturas}</span>{' '}
                lecturas de{' '}
                <span className="font-bold">{selectedRows.length}</span>{' '}
                nicho(s), ciclo <span className="font-bold">{cicloFact}</span>,
                período <span className="font-bold">{periodo}</span>.
              </span>
            </p>
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-2">
              <span className="hidden sm:inline">
                Esta acción es <span className="font-bold">irreversible</span> y
                afectará la facturación de los usuarios.
              </span>
              <span className="sm:hidden">
                Acción <span className="font-bold">irreversible</span>. Afecta
                facturación.
              </span>
            </p>
          </div>

          {/* Mostrar advertencias si hay claves de alerta */}
          {alertSummary.hasWarnings && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 font-medium">
                    <span className="hidden sm:inline">
                      ⚠️ Atención: {alertSummary.warningCount} lecturas con
                      claves de alerta
                    </span>
                    <span className="sm:hidden">
                      ⚠️ {alertSummary.warningCount} alertas
                    </span>
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    <span className="hidden sm:inline">
                      Nichos con alertas:{' '}
                      {alertSummary.warningNichos.slice(0, 3).join(', ')}
                      {alertSummary.warningNichos.length > 3 &&
                        ` y ${alertSummary.warningNichos.length - 3} más`}
                    </span>
                    <span className="sm:hidden">
                      {alertSummary.warningNichos.length} nicho(s) con alertas
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs sm:text-sm font-medium">
            <span className="hidden sm:inline">
              ¿Estás seguro de que deseas continuar?
            </span>
            <span className="sm:hidden">¿Continuar?</span>
          </p>
        </DialogDescription>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isLoading}
              size="sm"
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading || selectedRows.length === 0}
            size="sm"
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">Procesando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <CircleX className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Confirmar Cierre</span>
                <span className="sm:hidden">Confirmar</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
