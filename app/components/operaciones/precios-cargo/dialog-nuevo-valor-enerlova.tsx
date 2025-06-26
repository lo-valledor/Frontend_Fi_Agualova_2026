import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Calendar, Loader2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '~/lib/api';
import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '~/components/ui/dialog';
import { Alert, AlertDescription } from '~/components/ui/alert';

interface DialogNuevoValorEnerlovaProps {
  codigo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor: number;
  onSuccess: () => void;
  id: string;
}

export default function DialogNuevoValorEnerlova({
  codigo,
  descripcion,
  fecha_inicio,
  fecha_fin,
  valor,
  onSuccess,
  id,
}: DialogNuevoValorEnerlovaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    codigo,
    descripcion,
    fecha_inicio,
    fecha_fin,
    valor,
    id,
  });

  // Validaciones del formulario
  const isFormValid = useMemo(() => {
    return (
      !!formValues.codigo &&
      !!formValues.descripcion &&
      !!formValues.fecha_inicio &&
      !!formValues.fecha_fin &&
      !!formValues.valor &&
      !!formValues.id
    );
  }, [formValues]);

  // Función para formatear fecha YYYY-MM-DD a formato DD-MM-YYYY
  const formatearFechaADDMMYYYY = useCallback((fechaStr: string) => {
    if (!fechaStr) return '';
    // Si ya está en formato DD-MM-YYYY, lo devolvemos así
    if (/^\d{2}-\d{2}-\d{4}$/.test(fechaStr)) return fechaStr;

    // Si está en formato YYYY-MM-DD (formato HTML input date), lo convertimos
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    return fechaStr;
  }, []);

  // Errores de validación
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!formValues.fecha_fin) {
      errors.push('La fecha de fin es requerida');
    } else if (
      new Date(formValues.fecha_fin) <= new Date(formValues.fecha_inicio)
    ) {
      errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    if (!formValues.valor || formValues.valor <= 0) {
      errors.push('El valor debe ser mayor que cero');
    }

    return errors;
  }, [formValues]);

  // Manejador para actualizar el valor del input
  const handleInputChange = useCallback(
    (field: keyof typeof formValues, value: string | number) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // Manejador para enviar el formulario
  const handleSubmit = useCallback(async () => {
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    try {
      setIsLoading(true);

      // Formateamos la fecha fin al formato DD-MM-YYYY
      const fechaFinFormateada = formatearFechaADDMMYYYY(formValues.fecha_fin);

      const payload = {
        codigo: parseInt(formValues.codigo),
        fechaInicio: formValues.fecha_inicio, // Ya está en formato DD-MM-YYYY
        fechaFin: fechaFinFormateada,
        valor: formValues.valor,
      };

      const response = await api.post(
        '/ingresa-precio-cargo-enerlova',
        payload,
      );

      if (response.status === 200) {
        toast.success('Precios agregados correctamente');
        setIsOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error al agregar precios:', error);
      toast.error('Error al agregar los precios');
    } finally {
      setIsLoading(false);
    }
  }, [formValues, validationErrors, onSuccess, formatearFechaADDMMYYYY]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Calendar className="h-4 w-4" />
          Nuevo Valor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Nuevo Valor del Cargo
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="codigo"
              className="text-right font-medium text-muted-foreground"
            >
              Código
            </Label>
            <Input
              id="codigo"
              value={formValues.codigo}
              disabled
              className="col-span-3 bg-muted/50"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="descripcion"
              className="text-right font-medium text-muted-foreground"
            >
              Descripción
            </Label>
            <Input
              id="descripcion"
              value={formValues.descripcion}
              disabled
              className="col-span-3 bg-muted/50"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="fecha_inicio"
              className="text-right font-medium text-muted-foreground"
            >
              Fecha Inicio
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="fecha_inicio"
                value={formValues.fecha_inicio}
                disabled
                className="bg-muted/50 pl-9"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="fecha_fin"
              className="text-right font-medium text-muted-foreground"
            >
              Fecha Fin
            </Label>
            <div className="col-span-3 relative">
              <Input
                type="date"
                id="fecha_fin"
                value={formValues.fecha_fin}
                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                className="pl-9"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="valor"
              className="text-right font-medium text-muted-foreground"
            >
              Valor
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formValues.valor || ''}
              onChange={(e) =>
                handleInputChange('valor', parseFloat(e.target.value) || 0)
              }
              className="col-span-3"
            />
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="col-span-full mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors[0]}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
