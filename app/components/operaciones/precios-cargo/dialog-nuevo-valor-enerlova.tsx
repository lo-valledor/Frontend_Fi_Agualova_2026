import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Loader2,
  Plus,
  TrendingUp
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '~/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog';
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
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import api from '~/lib/api';

interface DialogNuevoValorAgualovaProps {
  codigo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  valor: number;
  onSuccess: () => void;
  id: string;
}

interface FormValues {
  codigo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor: number;
  id: string;
}

const PORCENTAJE_CAMBIO_INUSUAL = 50;

const formatearFechaADDMMYYYY = (fechaStr: string): string => {
  if (!fechaStr) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(fechaStr)) return fechaStr;
  const partes = fechaStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  return fechaStr;
};

const formatearValorInput = (input: string): string => {
  let limpio = input.replace(/[^\d,]/g, '');
  if (!limpio) return '';
  const partes = limpio.split(',');
  if (partes.length > 2) {
    limpio = `${partes[0]},${partes.slice(1).join('')}`;
  }
  if (partes.length === 2) {
    limpio = `${partes[0]},${partes[1].substring(0, 2)}`;
  }
  return limpio;
};

const parsearValor = (valorStr: string): number => {
  if (!valorStr) return 0;
  const numero = parseFloat(valorStr.replace(',', '.'));
  return Number.isNaN(numero) ? 0 : numero;
};

const formatValorCL = (valor: number): string =>
  valor.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

export default function DialogNuevoValorAgualova({
  codigo,
  descripcion,
  fecha_inicio,
  valor,
  onSuccess,
  id
}: Readonly<DialogNuevoValorAgualovaProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [valorDisplay, setValorDisplay] = useState('');
  const [fechaFinInput, setFechaFinInput] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    codigo,
    descripcion,
    fecha_inicio,
    fecha_fin: '',
    valor: 0,
    id
  });

  useEffect(() => {
    if (isOpen) {
      setValorDisplay(formatValorCL(valor));
      setFormValues({
        codigo,
        descripcion,
        fecha_inicio,
        fecha_fin: '',
        valor,
        id
      });
    } else {
      setFechaFinInput('');
      setValorDisplay('');
    }
  }, [isOpen, valor, fecha_inicio, codigo, descripcion, id]);

  const handleValorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const valorFormateado = formatearValorInput(e.target.value);
      setValorDisplay(valorFormateado);
      setFormValues(prev => ({
        ...prev,
        valor: parsearValor(valorFormateado)
      }));
    },
    []
  );

  const handleValorBlur = useCallback(() => {
    if (formValues.valor > 0) {
      setValorDisplay(formatValorCL(formValues.valor));
    }
  }, [formValues.valor]);

  const handleValorFocus = useCallback(() => {
    if (formValues.valor > 0) {
      setValorDisplay(formValues.valor.toString());
    }
  }, [formValues.valor]);

  const diferenciaPorcentual = useMemo(() => {
    if (!valor || valor === 0) return null;
    return ((formValues.valor - valor) / valor) * 100;
  }, [formValues.valor, valor]);

  const handleFechaFinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fechaYYYYMMDD = e.target.value;
      setFechaFinInput(fechaYYYYMMDD);
      setFormValues(prev => ({ ...prev, fecha_fin: fechaYYYYMMDD }));
    },
    []
  );

  const validationErrors = useMemo<string[]>(() => {
    const errors: string[] = [];

    if (!formValues.fecha_fin) {
      errors.push('La fecha de fin es requerida');
    } else {
      const fechaInicioPartes = formValues.fecha_inicio.split('-');
      const fechaFinPartes = formValues.fecha_fin.split('-');

      if (fechaInicioPartes.length === 3 && fechaFinPartes.length === 3) {
        const fechaInicio = new Date(
          `${fechaInicioPartes[2]}-${fechaInicioPartes[1]}-${fechaInicioPartes[0]}`
        );
        const fechaFin = new Date(formValues.fecha_fin);

        if (fechaFin <= fechaInicio) {
          errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
    }

    if (!formValues.valor || formValues.valor <= 0) {
      errors.push('El valor debe ser mayor que cero');
    }

    return errors;
  }, [formValues]);

  const isFormValid = useMemo(
    () =>
      !!formValues.codigo &&
      !!formValues.descripcion &&
      !!formValues.fecha_inicio &&
      !!formValues.fecha_fin &&
      formValues.valor > 0 &&
      validationErrors.length === 0,
    [formValues, validationErrors]
  );

  const isUnusualChange = useMemo(() => {
    if (!valor || valor === 0 || !formValues.valor) return false;
    return Math.abs(diferenciaPorcentual || 0) > PORCENTAJE_CAMBIO_INUSUAL;
  }, [valor, formValues.valor, diferenciaPorcentual]);

  const saveData = useCallback(async () => {
    try {
      setIsLoading(true);

      const payload = {
        codigo: Number.parseInt(formValues.codigo, 10),
        fechaInicio: formValues.fecha_inicio,
        fechaFin: formatearFechaADDMMYYYY(formValues.fecha_fin),
        valor: formValues.valor
      };

      const response = await api.post('/ingresa-precio-cargo-agualova', payload);

      if (response.status === 200) {
        toast.success('Precio agregado correctamente');
        setIsOpen(false);
        setShowConfirmDialog(false);
        setValorDisplay('');
        setFechaFinInput('');
        onSuccess();
      }
    } catch (error) {
      toast.error('Error al agregar el precio', { description: String(error) });
    } finally {
      setIsLoading(false);
    }
  }, [formValues, onSuccess]);

  const handleSubmit = useCallback(async () => {
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0] ?? 'Error de validación');
      return;
    }

    if (isUnusualChange) {
      setShowConfirmDialog(true);
      return;
    }

    await saveData();
  }, [validationErrors, isUnusualChange, saveData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Nuevo Valor</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] h-[85vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-border/60 bg-muted/30">
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Agregar Nuevo Valor
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure el nuevo precio y período de vigencia para el cargo
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-6 py-6 px-4 sm:px-6">
            <div className="bg-muted/30 rounded-xl p-4 sm:p-5 space-y-4 border border-border/40">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-sky-100 dark:bg-sky-900/40 rounded-lg">
                  <DollarSign className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Cargo
                    </p>
                    <p className="font-semibold text-base text-foreground">
                      {formValues.descripcion}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Código
                      </p>
                      <p className="font-mono font-semibold text-sm">
                        {formValues.codigo}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Valor Actual
                      </p>
                      <p className="font-semibold text-sm text-sky-700 dark:text-sky-300">
                        ${formatValorCL(valor)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Vigencia Actual
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono bg-background/60 rounded-md px-3 py-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formValues.fecha_inicio}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground">Actual</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-100 dark:bg-sky-900/40 rounded-lg">
                  <Calendar className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Período de Vigencia
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fecha_inicio"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <span className="text-muted-foreground">Desde</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="fecha_inicio"
                      value={formValues.fecha_inicio}
                      disabled
                      className="bg-muted/50 pl-10 h-11 font-mono text-sm"
                    />
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="fecha_fin"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <span className="text-muted-foreground">Hasta</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      id="fecha_fin"
                      value={fechaFinInput}
                      onChange={handleFechaFinChange}
                      className="pl-10 h-11 font-mono text-sm"
                    />
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Nuevo Valor del Cargo
                </h3>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="valor"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <span className="text-muted-foreground">Valor</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xl">
                    $
                  </span>
                  <Input
                    id="valor"
                    type="text"
                    value={valorDisplay}
                    onChange={handleValorChange}
                    onBlur={handleValorBlur}
                    onFocus={handleValorFocus}
                    placeholder="0,00"
                    className="pl-10 pr-4 text-xl h-14 font-semibold text-right border-2 focus-visible:ring-2"
                  />
                </div>

                {diferenciaPorcentual !== null &&
                  formValues.valor !== valor &&
                  formValues.valor > 0 && (
                    <div
                      className={`flex items-center justify-between p-3.5 rounded-lg text-sm border-2 ${
                        diferenciaPorcentual > 0
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                      }`}
                    >
                      <span className="text-muted-foreground font-medium">
                        Cambio:
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold ${
                            diferenciaPorcentual > 0
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-red-700 dark:text-red-300'
                          }`}
                        >
                          {diferenciaPorcentual > 0 ? '+' : ''}
                          {diferenciaPorcentual.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="border-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {validationErrors[0]}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t border-border/60 bg-muted/20 flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            size="default"
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            size="default"
            className="flex-1 sm:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Agregar Valor</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Cambio de valor inusual detectado
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="text-base">
                El nuevo valor difiere significativamente del valor actual:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Valor actual:
                  </span>
                  <span className="font-semibold text-base">
                    ${formatValorCL(valor)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Nuevo valor:
                  </span>
                  <span className="font-semibold text-base text-amber-600 dark:text-amber-400">
                    ${formatValorCL(formValues.valor)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cambio:</span>
                  <span
                    className={`font-bold text-lg ${
                      (diferenciaPorcentual || 0) > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {diferenciaPorcentual && diferenciaPorcentual > 0 ? '+' : ''}
                    {diferenciaPorcentual?.toFixed(2)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground pt-2">
                ¿Está seguro de que desea continuar con este cambio?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancelar y revisar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={saveData}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                'Sí, guardar cambio'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
