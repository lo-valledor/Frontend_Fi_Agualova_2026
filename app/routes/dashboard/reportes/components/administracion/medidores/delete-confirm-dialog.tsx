import { Gauge } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog';
import type { GetMedidores } from '~/types/administracion';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  medidor: GetMedidores | null;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  medidor
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[95vw] sm:max-w-[500px]">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Gauge className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-lg sm:text-xl font-semibold">
              ¿Estás realmente seguro?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm sm:text-base space-y-2">
            <p>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              medidor del sistema.
            </p>
            {medidor && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="font-medium text-red-900 dark:text-red-100 text-sm">
                    Medidor a eliminar:
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-red-700 dark:text-red-300">
                      Serie:
                    </span>
                    <span className="ml-2 font-mono text-red-900 dark:text-red-100">
                      {medidor.serie}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-700 dark:text-red-300">
                      Código:
                    </span>
                    <span className="ml-2 font-mono text-red-900 dark:text-red-100">
                      {medidor.codigo}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-700 dark:text-red-300">
                      Marca:
                    </span>
                    <span className="ml-2 text-red-900 dark:text-red-100">
                      {medidor.marca}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-700 dark:text-red-300">
                      Modelo:
                    </span>
                    <span className="ml-2 text-red-900 dark:text-red-100">
                      {medidor.modelo}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Sí, eliminar medidor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
