import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PencilIcon, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import api from "~/lib/api";
import { toast } from "sonner";
import { useAuth } from "~/context/AuthContext";

interface DialogModificarPrecioProps {
  isAuthorized: boolean;
  indice: number;
  descripcion?: string;
  valorActual?: string;
  onSuccess?: () => void;
}

export default function DialogModificarPrecio({
  isAuthorized,
  indice,
  descripcion = "",
  valorActual = "",
  onSuccess,
}: DialogModificarPrecioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [valor, setValor] = useState(valorActual);
  const [motivo, setMotivo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const resetForm = () => {
    setValor(valorActual);
    setMotivo("");
    setError("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const validateForm = (): boolean => {
    if (!valor.trim()) {
      setError("El valor es obligatorio");
      return false;
    }

    if (isNaN(Number(valor)) || Number(valor) <= 0) {
      setError("El valor debe ser un número positivo");
      return false;
    }

    if (!motivo.trim()) {
      setError("El motivo es obligatorio");
      return false;
    }

    if (motivo.length < 5) {
      setError("El motivo debe tener al menos 5 caracteres");
      return false;
    }

    return true;
  };

  const handleConfirmar = async () => {
    if (!user) {
      toast.error("No se pudo obtener información del usuario");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        indice: indice,
        valor: valor,
        motivo: motivo,
        usuario: user.username,
      };

      const response = await api.post(
        `/modificar-precio-cargo-correccion`,
        payload
      );

      if (response.status === 200) {
        toast.success("Precio modificado correctamente");
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError("No se pudo modificar el precio");
        toast.error("No se pudo modificar el precio");
      }
    } catch (error) {
      console.error("Error al modificar precio:", error);
      setError("Ocurrió un error al procesar la solicitud");
      toast.error("Ocurrió un error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={!isAuthorized}
        >
          <PencilIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-2">
            <PencilIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            Modificar Precio
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modifica el valor del cargo y especifica el motivo del cambio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {descripcion && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Descripción
              </Label>
              <div className="bg-muted/50 p-2 rounded-md text-sm border">
                {descripcion}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Índice
            </Label>
            <Input
              type="text"
              value={indice}
              disabled
              className="bg-muted/50 text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="valor"
              className="text-xs font-medium flex items-center justify-between"
            >
              <span>Valor</span>
              {valorActual && (
                <span className="text-muted-foreground">
                  Valor actual: {valorActual}
                </span>
              )}
            </Label>
            <Input
              id="valor"
              type="number"
              placeholder="Ingrese el nuevo valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              min="0"
              step="0.01"
              className="bg-background border-border/70"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="motivo" className="text-xs font-medium">
              Motivo
            </Label>
            <Textarea
              id="motivo"
              placeholder="Especifique el motivo de la modificación"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="min-h-[80px] bg-background border-border/70"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={isLoading}
            className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
