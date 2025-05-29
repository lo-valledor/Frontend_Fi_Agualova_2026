import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { CircleX, AlertTriangle, Loader2 } from "lucide-react";
import api from "~/lib/api";
import { toast } from "sonner";

interface AlertCerrarLecturasProps {
  nichoId: number;
  cantLecturas: number;
  cicloFact: string;
  periodo: string;
  onSuccess?: () => void;
}

export default function AlertCerrarLecturas({
  nichoId,
  cantLecturas,
  cicloFact,
  periodo,
  onSuccess,
}: AlertCerrarLecturasProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const response = await api.post("/cerrar-lecturas-nicho", {
        nichoId,
        cantLecturas,
        cicloFact,
        periodo,
      });

      if (response.status === 200) {
        toast.success("Lecturas cerradas correctamente");
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      } else {
        toast.error("Error al cerrar lecturas");
      }
    } catch (error: any) {
      console.error("Error al cerrar lecturas:", error);
      toast.error(error.response?.data?.mensaje || "Error al cerrar lecturas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              Estás por cerrar <span className="font-bold">{cantLecturas}</span>{" "}
              lecturas para el nicho{" "}
              <span className="font-bold">{nichoId}</span> del ciclo{" "}
              <span className="font-bold">{cicloFact}</span> del periodo{" "}
              <span className="font-bold">{periodo}</span>.
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
            disabled={isLoading}
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
