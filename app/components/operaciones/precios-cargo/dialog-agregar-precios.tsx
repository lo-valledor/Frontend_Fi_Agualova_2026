import {
  AlertTriangle,
  PlusCircle,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';

interface DialogAgregarPreciosProps {
  codigo: number;
  descripcion?: string;
  valorAnterior?: number | null;
  onConfirm: (valor: number) => void;
  initialValue?: number | null;
}

const VALOR_INICIAL = '';
const PORCENTAJE_CAMBIO_INUSUAL = 50;

const formatValorCL = (valor: number): string =>
  valor.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const parseValorInput = (input: string): number => {
  if (!input) return 0;
  const numero = Number.parseFloat(input.replace(',', '.'));
  return Number.isFinite(numero) ? numero : 0;
};

export default function DialogAgregarPrecios({
  codigo,
  descripcion,
  valorAnterior,
  onConfirm,
  initialValue
}: Readonly<DialogAgregarPreciosProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [valor, setValor] = useState(VALOR_INICIAL);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const valorNumerico = useMemo(() => parseValorInput(valor), [valor]);
  const hasValorAnterior =
    typeof valorAnterior === 'number' && valorAnterior > 0;

  const diferencia = useMemo(() => {
    if (!hasValorAnterior || valorNumerico <= 0) return null;
    return valorNumerico - (valorAnterior as number);
  }, [hasValorAnterior, valorNumerico, valorAnterior]);

  const diferenciaPorcentual = useMemo(() => {
    if (!hasValorAnterior || diferencia === null) return null;
    return (diferencia / (valorAnterior as number)) * 100;
  }, [hasValorAnterior, diferencia, valorAnterior]);

  const isCambioInusual = useMemo(() => {
    if (diferenciaPorcentual === null) return false;
    return Math.abs(diferenciaPorcentual) > PORCENTAJE_CAMBIO_INUSUAL;
  }, [diferenciaPorcentual]);

  const validationError = useMemo<string | null>(() => {
    if (!valor) return null;
    if (valorNumerico <= 0) return 'El valor debe ser mayor que cero';
    return null;
  }, [valor, valorNumerico]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open && typeof initialValue === 'number' && initialValue > 0) {
        setValor(initialValue.toString());
      } else if (!open) {
        setValor(VALOR_INICIAL);
        setShowConfirmDialog(false);
      }
    },
    [initialValue]
  );

  const handleConfirm = useCallback(() => {
    onConfirm(valorNumerico);
    setIsOpen(false);
    setShowConfirmDialog(false);
    setValor(VALOR_INICIAL);
  }, [onConfirm, valorNumerico]);

  const handleSubmit = useCallback(() => {
    if (!valor) return;
    if (validationError) return;

    if (isCambioInusual) {
      setShowConfirmDialog(true);
      return;
    }
    handleConfirm();
  }, [valor, validationError, isCambioInusual, handleConfirm]);

  const diferenciaClases = useMemo(() => {
    if (diferencia === null) return '';
    if (isCambioInusual) {
      return 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    if (diferencia > 0) {
      return 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    }
    return 'bg-sky-50 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300 border-sky-200 dark:border-sky-800';
  }, [diferencia, isCambioInusual]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              <span className="hidden sm:inline">Agregar Valor de Cargo</span>
              <span className="sm:hidden">Agregar Valor</span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 sm:gap-4 py-2 sm:py-3">
            {descripcion && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {descripcion}
              </p>
            )}

            <div className="bg-muted/30 rounded-lg p-3 border border-border/60">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Valor Mes Anterior
              </p>
              {hasValorAnterior ? (
                <p className="text-base font-semibold font-mono text-foreground">
                  ${formatValorCL(valorAnterior as number)}
                </p>
              ) : (
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Sin Valor
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-1 sm:space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Nuevo Valor
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Precio"
                value={valor}
                onChange={e => setValor(e.target.value)}
                className="bg-background border-border/70 h-8 sm:h-10 text-xs sm:text-sm"
              />
              {validationError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {validationError}
                </p>
              )}
            </div>

            {diferencia !== null &&
              diferenciaPorcentual !== null &&
              valorNumerico > 0 && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${diferenciaClases}`}
                >
                  {diferencia > 0 ? (
                    <TrendingUp className="h-4 w-4 shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 shrink-0" />
                  )}
                  <span className="text-xs font-medium">
                    Diferencia: {diferencia > 0 ? '+' : ''}$
                    {formatValorCL(Math.abs(diferencia))} (
                    {diferenciaPorcentual > 0 ? '+' : ''}
                    {diferenciaPorcentual.toFixed(1)}%)
                  </span>
                </div>
              )}

            {isCambioInusual && (
              <Alert variant="destructive" className="py-2 px-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">
                  Cambio inusual detectado
                </AlertTitle>
                <AlertDescription className="text-xs">
                  La variación supera el {PORCENTAJE_CAMBIO_INUSUAL}% respecto
                  al valor del mes anterior. Se pedirá confirmación antes de
                  agregar a la cola.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-[10px] text-muted-foreground">
              El valor se agregará a la cola de pendientes y se enviará junto
              con los demás al confirmar.
            </p>
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
              disabled={!valor || !!validationError}
              size="sm"
              variant="default"
              className="gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm order-1 sm:order-2"
            >
              <PlusCircle className="h-3 w-3 sm:h-4" />
              <span className="hidden sm:inline">Agregar a la cola</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Confirmar cambio inusual
            </AlertDialogTitle>
            <AlertDialogDescription>
              La diferencia respecto al valor del mes anterior es de{' '}
              <strong>
                {diferenciaPorcentual !== null && diferenciaPorcentual > 0
                  ? '+'
                  : ''}
                {diferenciaPorcentual?.toFixed(1)}%
              </strong>{' '}
              (${formatValorCL(Math.abs(diferencia ?? 0))}). ¿Desea agregar este
              valor a la cola de pendientes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirmar y agregar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
