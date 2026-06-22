import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Loader2,
  Lock,
  PencilIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { operacionesService } from '~/services/operacionesService';

interface DialogModificarPrecioProps {
  codigoCargo: number;
  descripcion?: string;
  valorActual?: string;
  onSuccess?: () => void;
}

interface FormState {
  nuevoValor: string;
  motivo: string;
  passwordConfirmacion: string;
}

const FORM_INICIAL: FormState = {
  nuevoValor: '',
  motivo: '',
  passwordConfirmacion: ''
};

const MIN_LONGITUD_MOTIVO = 5;

const normalizarValor = (valor: string): number => {
  if (!valor) return 0;
  const limpio = valor.replace(/\./g, '').replace(',', '.');
  const numero = parseFloat(limpio);
  return Number.isNaN(numero) ? 0 : numero;
};

const formatearValorCL = (valor: string): string =>
  normalizarValor(valor).toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

export default function DialogModificarPrecio({
  codigoCargo,
  descripcion = '',
  valorActual = '',
  onSuccess
}: Readonly<DialogModificarPrecioProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = (): void => {
    setForm(FORM_INICIAL);
    setError('');
  };

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ): void => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validarFormulario = (): boolean => {
    const nuevoValorNum = normalizarValor(form.nuevoValor);

    if (nuevoValorNum <= 0) {
      setError('El valor debe ser un número positivo');
      return false;
    }

    if (!form.motivo.trim() || form.motivo.trim().length < MIN_LONGITUD_MOTIVO) {
      setError(`El motivo debe tener al menos ${MIN_LONGITUD_MOTIVO} caracteres`);
      return false;
    }

    if (!form.passwordConfirmacion) {
      setError('La contraseña de confirmación es obligatoria');
      return false;
    }

    return true;
  };

  const handleConfirmar = async (): Promise<void> => {
    if (!validarFormulario()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await operacionesService.postCorregirPrecioCargo({
        codigoCargo,
        nuevoValor: normalizarValor(form.nuevoValor),
        motivo: form.motivo.trim(),
        passwordConfirmacion: form.passwordConfirmacion
      });

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success('Precio modificado correctamente');
      setIsOpen(false);
      resetForm();
      onSuccess?.();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error al modificar el precio';
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 sm:px-3 text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors text-xs sm:text-sm"
        >
          <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
          <span className="hidden sm:inline">Modificar</span>
          <span className="sm:hidden">Mod</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                Modificar Precio
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Modifica el valor del cargo y registra el motivo del cambio.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {descripcion && (
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Descripción
              </Label>
              <div className="bg-muted/30 p-2 sm:p-3 rounded-xl text-xs sm:text-sm border">
                {descripcion}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Código Cargo
              </Label>
              <Input
                type="text"
                value={codigoCargo}
                disabled
                className="bg-muted/30 h-8 sm:h-10 text-xs sm:text-sm font-mono"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Valor Actual
              </Label>
              <Input
                type="text"
                value={formatearValorCL(valorActual)}
                disabled
                className="bg-muted/30 h-8 sm:h-10 text-xs sm:text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="valor" className="text-xs sm:text-sm font-medium">
              Nuevo Valor
            </Label>
            <Input
              id="valor"
              type="number"
              placeholder="0,00"
              value={form.nuevoValor}
              onChange={e => updateField('nuevoValor', e.target.value)}
              min="0"
              step="0.01"
              className="bg-background border h-8 sm:h-10 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="motivo" className="text-xs sm:text-sm font-medium">
              Motivo de la Modificación
            </Label>
            <Textarea
              id="motivo"
              placeholder="Describe el motivo (mínimo 5 caracteres)"
              value={form.motivo}
              onChange={e => updateField('motivo', e.target.value)}
              className="min-h-[60px] sm:min-h-[80px] bg-background border text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label
              htmlFor="password"
              className="text-xs sm:text-sm font-medium flex items-center gap-1.5"
            >
              <Lock className="h-3 w-3" />
              Contraseña de confirmación
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={form.passwordConfirmacion}
              onChange={e => updateField('passwordConfirmacion', e.target.value)}
              autoComplete="current-password"
              className="bg-background border h-8 sm:h-10 text-xs sm:text-sm"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            size="sm"
            className="flex-1 order-2 sm:order-1 text-xs sm:text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={isLoading}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 order-1 sm:order-2 text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="hidden sm:inline">Procesando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Actualizar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
