import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import api from "~/lib/api";

interface DialogAgregarPreciosProps {
  codigo: number;
  mes: string;
  anio: string;
  onSuccess: () => void;
}

interface ValoresForm {
  valor1: string;
  valor2: string;
  valor3: string;
}

const VALORES_INICIALES: ValoresForm = {
  valor1: "",
  valor2: "",
  valor3: "",
};

export default function DialogAgregarPrecios({
  codigo,
  mes,
  anio,
  onSuccess,
}: Readonly<DialogAgregarPreciosProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [valores, setValores] = useState<ValoresForm>(VALORES_INICIALES);

  const handleSubmit = async (): Promise<void> => {
    if (!valores.valor1 || !valores.valor2 || !valores.valor3) {
      toast.error("Por favor complete todos los valores");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/ingresar-precio-cargo", {
        mes: Number.parseInt(mes, 10),
        anio: Number.parseInt(anio, 10),
        codigo,
        valor: parseFloat(valores.valor1),
      });

      if (response.status === 200) {
        toast.success("Precios agregados correctamente");
        setIsOpen(false);
        setValores(VALORES_INICIALES);
        onSuccess();
      }
    } catch (error) {
      toast.error("Error al agregar los precios", {
        description: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 sm:gap-1.5 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-800/40 text-xs sm:text-sm px-2 sm:px-3"
        >
          <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Agregar</span>
          <span className="sm:hidden">+</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold text-sky-800 dark:text-sky-200">
            <span className="hidden sm:inline">Agregar Precios de Cargo</span>
            <span className="sm:hidden">Agregar Precios</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:gap-4 py-2 sm:py-3">
          {(["valor1", "valor2", "valor3"] as const).map((field) => (
            <div key={field} className="space-y-1 sm:space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Valor {field.charAt(field.length - 1)}
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder={`Precio ${field.charAt(field.length - 1)}`}
                value={valores[field]}
                onChange={(e) =>
                  setValores({ ...valores, [field]: e.target.value })
                }
                className="bg-background border-border/70 h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          ))}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            size="sm"
            className="text-muted-foreground hover:text-muted-foreground hover:bg-muted w-full sm:w-auto text-xs sm:text-sm order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            size="sm"
            variant="default"
            className="gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span className="hidden sm:inline">Agregando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-3 w-3 sm:h-4 sm:h-4" />
                <span className="hidden sm:inline">Agregar Valores</span>
                <span className="sm:hidden">Agregar</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
