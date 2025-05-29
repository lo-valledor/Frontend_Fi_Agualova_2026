import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import api from "~/lib/api";
import { Loader2, PlusCircle } from "lucide-react";
import type { DialogAgregarPreciosProps } from "~/types/operaciones";

export default function DialogAgregarPrecios({
  codigo,
  mes,
  anio,
  onSuccess,
}: DialogAgregarPreciosProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [valores, setValores] = useState({
    valor1: "",
    valor2: "",
    valor3: "",
  });

  const handleSubmit = async () => {
    if (!valores.valor1 || !valores.valor2 || !valores.valor3) {
      toast.error("Por favor complete todos los valores");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/ingresar-precio-cargo", {
        mes: parseInt(mes),
        año: parseInt(anio),
        codigo: codigo,
        valor: parseFloat(valores.valor1),
        valor2: parseFloat(valores.valor2),
        valor3: parseFloat(valores.valor3),
      });

      if (response.status === 200) {
        toast.success("Precios agregados correctamente");
        setIsOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error al agregar precios:", error);
      toast.error("Error al agregar los precios");
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
          className="gap-1.5 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-800/40"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
            Agregar Precios de Cargo
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Valor 1{" "}
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el precio 1"
              value={valores.valor1}
              onChange={(e) =>
                setValores({ ...valores, valor1: e.target.value })
              }
              className="bg-background border-border/70"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Valor 2{" "}
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el precio 2"
              value={valores.valor2}
              onChange={(e) =>
                setValores({ ...valores, valor2: e.target.value })
              }
              className="bg-background border-border/70"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Valor 3{" "}
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ingrese el precio 3"
              value={valores.valor3}
              onChange={(e) =>
                setValores({ ...valores, valor3: e.target.value })
              }
              className="bg-background border-border/70"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-muted-foreground hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Agregar Valores
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
