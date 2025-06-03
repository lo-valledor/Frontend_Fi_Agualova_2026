import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { AlertTriangle, Trash2, X, Gauge } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  medidorName: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  medidorName,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-rose-800 dark:text-rose-200">
                Confirmar Eliminación
              </AlertDialogTitle>
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>

          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
            <AlertDialogDescription className="text-slate-700 dark:text-slate-300 space-y-3">
              <div>
                <span className="text-sm">
                  Estás a punto de eliminar permanentemente el medidor:
                </span>
              </div>

              <div className="flex items-center justify-center">
                <Badge
                  variant="outline"
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 px-3 py-1 text-sm font-medium"
                >
                  <Gauge className="h-3 w-3 mr-2" />
                  {medidorName}
                </Badge>
              </div>

              <div className="text-xs text-rose-600 dark:text-rose-400 space-y-1">
                <p>
                  <strong>⚠️ Esta acción eliminará:</strong>
                </p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Todos los datos del medidor</li>
                  <li>Su historial de lecturas</li>
                  <li>Sus configuraciones técnicas</li>
                  <li>Su asociación con acometidas</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 pt-4">
          <AlertDialogCancel
            disabled={isLoading}
            className="gap-2 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2 bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Eliminar Medidor
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
