import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "~/lib/api";
import { useNavigate } from "react-router";

interface ConfirmarReaperturaProps {
  periodoId: string;
  clave: number;
}

export default function ConfirmarReapertura({
  periodoId,
  clave,
}: ConfirmarReaperturaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const navigate = useNavigate();

  const handleConfirmar = async () => {
    if (!descripcion.trim()) {
      toast.error("Por favor ingrese un motivo para la reapertura");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/reabrir-periodo", {
        periodoId,
        descripcion,
        claveId: clave,
      });

      if (response.status === 200) {
        toast.success("Periodo reaperturado exitosamente");
        setIsOpen(false);
        setDescripcion("");
        // Recargar la página para mostrar los cambios
        navigate(0);
      } else {
        throw new Error("Error al reabrir el periodo");
      }
    } catch (error: any) {
      console.error("Error:", error);
      let errorMessage = "Error al reabrir el periodo";

      if (error.response) {
        // Error de respuesta del servidor
        if (error.response.status === 404) {
          errorMessage = "La ruta de la API no está disponible";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Error de conexión
        errorMessage = "No se pudo conectar con el servidor";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 gap-1.5 w-full"
        >
          <RefreshCw className="h-4 w-4" />
          Reabrir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg border shadow-sm">
              <RefreshCw className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            Reapertura de Periodo
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Esta acción permitirá reabrir el periodo seleccionado. Por favor,
            indique el motivo de la reapertura.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="motivo"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
            >
              <AlertCircle className="h-3.5 w-3.5" /> Motivo de Reapertura
            </Label>
            <Input
              id="motivo"
              placeholder="Ingrese el motivo de la reapertura"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="bg-background border-border/70"
            />
          </div>
          <div className="text-sm text-muted-foreground flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              La reapertura del periodo permitirá realizar modificaciones.
              Asegúrese de proporcionar un motivo claro y específico.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-muted-foreground hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleConfirmar}
            disabled={isLoading || !descripcion.trim()}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Confirmar Reapertura
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
