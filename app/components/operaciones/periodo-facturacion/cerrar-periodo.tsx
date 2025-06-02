import { XCircle, Loader2, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import api from "~/lib/api";
import { useNavigate } from "react-router";

interface CerrarPeriodoProps {
  periodoId: string;
  onSuccess?: () => void;
}

export default function CerrarPeriodo({
  periodoId,
  onSuccess,
}: CerrarPeriodoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCerrarPeriodo = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(
        "/cerrar-periodo",
        JSON.stringify(periodoId),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Periodo cerrado correctamente");
        setIsOpen(false);

        // Llamar a onSuccess si existe
        if (onSuccess) {
          onSuccess();
        } else {
          // Recargar la página si no hay onSuccess
          navigate(0);
        }
      } else {
        toast.error("Error al cerrar el periodo");
      }
    } catch (error) {
      toast.error("Error al cerrar el periodo");
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
          className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 gap-1.5 w-full"
        >
          <XCircle className="h-4 w-4" />
          Cerrar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shadow-sm">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-red-800 dark:text-red-200">
                Cerrar periodo de facturación
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Esta acción cerrará el periodo de facturación {periodoId}.
                ¿Estás seguro de que deseas continuar?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-3 my-2">
          <p className="text-sm text-red-700 dark:text-red-300">
            Al cerrar el periodo, no se podrán realizar más operaciones en él a
            menos que sea reabierto por un usuario autorizado.
          </p>
        </div>

        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel className="text-muted-foreground hover:text-muted-foreground hover:bg-muted">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCerrarPeriodo}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Cerrar Periodo
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
