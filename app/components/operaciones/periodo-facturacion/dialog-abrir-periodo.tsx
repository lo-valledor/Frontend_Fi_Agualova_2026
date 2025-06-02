import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import api from "~/lib/api";
import { toast } from "sonner";
import { Loader2, CalendarIcon, CalendarRange } from "lucide-react";
import { useNavigate } from "react-router";

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface DialogAbrirPeriodoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMonth?: string;
  selectedYear?: string;
  onSuccess?: () => void;
}

export default function DialogAbrirPeriodo({
  open,
  onOpenChange,
  selectedMonth = "",
  selectedYear = "",
  onSuccess,
}: DialogAbrirPeriodoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAbrirPeriodo = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Por favor seleccione mes y año");
      return;
    }

    try {
      setIsLoading(true);

      // Primer paso: Enviar datos con el nombre del periodo
      const nombreMes = meses[parseInt(selectedMonth) - 1];
      const params = {
        nombre: `${nombreMes} ${selectedYear}`,
        mesi: selectedMonth,
        añoi: selectedYear,
      };
      const response = await api.post("/ingresa-periodo", params);

      if (response.status === 200) {
        toast.success("El periodo se ha abierto correctamente");
        onOpenChange(false);

        // Llamar a onSuccess si existe
        if (onSuccess) {
          onSuccess();
        } else {
          // Recargar la página si no hay onSuccess
          navigate(0);
        }
      } else {
        toast.error(
          "El periodo ya existe, por favor seleccione otro o reabra el periodo"
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
      let errorMessage = error.response.data;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg border shadow-sm">
              <CalendarRange className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            Confirmar Apertura de Periodo
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            ¿Está seguro que desea abrir el periodo de facturación para el mes y
            año seleccionado?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="mes-inicio"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
            >
              <CalendarIcon className="h-3.5 w-3.5" /> Mes de Inicio
            </Label>
            <Input
              id="mes-inicio"
              value={meses[parseInt(selectedMonth) - 1]}
              disabled
              className="bg-muted/50 border-border/70 text-muted-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="anio-inicio"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
            >
              <CalendarRange className="h-3.5 w-3.5" /> Año de Inicio
            </Label>
            <Input
              id="anio-inicio"
              value={selectedYear}
              disabled
              className="bg-muted/50 border-border/70 text-muted-foreground"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-muted-foreground hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleAbrirPeriodo}
            disabled={isLoading || !selectedMonth || !selectedYear}
            className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CalendarRange className="w-4 h-4" />
                Abrir Periodo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
