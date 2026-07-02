import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Key,
  Plus,
  RefreshCw,
  Save,
  Zap
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
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
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { LoadingCard } from '~/components/ui/loading-card';
import { Separator } from '~/components/ui/separator';
import { formatDateDDMMYYYY } from '~/hooks/use-monitor';
import { cn } from '~/lib/utils';
import { monitorService } from '~/services/monitorService';
import type {
  MonitorClaves,
  MonitorDetalleRegistro,
  MonitorHistorialLectura,
  MonitorProps
} from '~/types/monitor';
import { detectReadingAnomaly, type ReadingAnomalyKind } from '~/utils/monitor';

interface DetallesMedidorProps {
  lecturaId: number;
  /**
   * Código de clave actual del medidor (ej. 'SINLEC', 'LEOK').
   * Si se entrega, se usa para derivar el `claveId` numérico que
   * pide el backend al llamar a `postHabilitarEdicionLectura`.
   * Si no se entrega, se intenta derivar desde `historial.claves[0]?.codigo`.
   */
  claveHtml?: string;
  /**
   * Modo de presentación:
   * - `'full'`: formulario completo con todos los campos y acciones
   *   (fecha editable, lectura anterior, lectura actual, adicional,
   *   botones Copiar/Registrar/Aceptar/Habilitar/Refrescar).
   * - `'compact'`: formulario mínimo para popover. Solo lectura actual
   *   y (si aplica) lectura actual adicional. Fecha y lectura anterior
   *   se asumen implícitas (hoy / historial). Acciones reducidas a
   *   Registrar y Aceptar.
   */
  mode?: 'full' | 'compact';
  onSuccess?: () => void;
}

type PendingAction = 'copiar' | 'registrar' | 'aceptar' | 'habilitar' | null;

const hasLowerReadingThanPrevious = (
  previousReading: string,
  currentReading: string
): boolean => {
  const previous = Number.parseFloat(previousReading);
  const current = Number.parseFloat(currentReading);

  if (Number.isNaN(previous) || Number.isNaN(current)) {
    return false;
  }

  return current < previous;
};

export default function DetallesMedidor({
  lecturaId,
  claveHtml,
  mode = 'full',
  onSuccess
}: Readonly<DetallesMedidorProps>) {
  const [historial, setHistorial] = useState<MonitorHistorialLectura | null>(
    null
  );
  const [detalle, setDetalle] = useState<MonitorDetalleRegistro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [fecha, setFecha] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [lecturaActual, setLecturaActual] = useState<string>('');
  const [lecturaAnterior, setLecturaAnterior] = useState<string>('');

  const [tieneAdicional, setTieneAdicional] = useState<boolean>(false);
  const [tipoAdicional, setTipoAdicional] = useState<number>(0);
  const [lecturaActualAd, setLecturaActualAd] = useState<string>('');
  const [lecturaAnteriorAd, setLecturaAnteriorAd] = useState<string>('');

  const [habilitarDescripcion, setHabilitarDescripcion] = useState<string>('');
  const [clavesCatalogo, setClavesCatalogo] = useState<MonitorClaves[]>([]);

  const lecturaActualInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [historialRes, detalleRes, clavesRes] = await Promise.all([
        monitorService.getHistorialLectura(lecturaId),
        monitorService.getDetalleRegistro(lecturaId),
        monitorService.getClaves()
      ]);

      if (historialRes.error || !historialRes.data) {
        setError(historialRes.error ?? 'No se pudo cargar el historial');
        return;
      }

      const h = historialRes.data;
      const d = detalleRes.data ?? null;
      setHistorial(h);
      setDetalle(d);
      setClavesCatalogo(
        !clavesRes.error && Array.isArray(clavesRes.data) ? clavesRes.data : []
      );

      setTieneAdicional(Boolean(d?.tieneAdicional));
      setTipoAdicional(d?.tipoMedidorAdicional ?? 0);
      setLecturaAnteriorAd(
        d?.ultimaLecturaAdicional != null
          ? String(d.ultimaLecturaAdicional)
          : ''
      );

      const lastReading = h.lecturasAnteriores?.[0];
      if (lastReading?.ultimaLectura) {
        setLecturaAnterior(lastReading.ultimaLectura);
        setLecturaActual(lastReading.ultimaLectura);
      } else {
        setLecturaActual('');
      }

      const lastAd = d?.ultimaLecturaAdicional;
      setLecturaActualAd(lastAd != null ? String(lastAd) : '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lecturaId) {
      fetchData();
    }
  }, [lecturaId]);

  useEffect(() => {
    if (!isLoading && historial) {
      setLecturaActual(historial.lecturasAnteriores[0]?.lecturaActual ?? '');
      setLecturaAnterior(historial.lecturasAnteriores[0]?.ultimaLectura ?? 0);
      setLecturaAnteriorAd(
        detalle?.ultimaLecturaAdicional != null
          ? String(detalle.ultimaLecturaAdicional)
          : ''
      );
    }
  }, [isLoading, historial, detalle]);

  const buildSubmitBody = (): MonitorProps | null => {
    const actualNum = Number.parseFloat(lecturaActual);
    if (!lecturaActual || Number.isNaN(actualNum)) {
      toast.error('Debe ingresar la lectura actual');
      return null;
    }

    const anteriorNum = Number.parseFloat(lecturaAnterior || '0');
    const actualAdNum = Number.parseFloat(lecturaActualAd || '0');
    const anteriorAdNum = Number.parseFloat(lecturaAnteriorAd || '0');

    if (!Number.isNaN(anteriorNum) && actualNum < anteriorNum) {
      toast.error(
        'La lectura actual debe ser igual o mayor al valor actual registrado'
      );
      return null;
    }

    if (
      tieneAdicional &&
      !Number.isNaN(actualAdNum) &&
      !Number.isNaN(anteriorAdNum) &&
      actualAdNum < anteriorAdNum
    ) {
      toast.error(
        'La lectura adicional debe ser igual o mayor al valor actual registrado'
      );
      return null;
    }

    return {
      idLectura: lecturaId,
      fecha: formatDateDDMMYYYY(fecha),
      lecturaActual: actualNum,
      lecturaAnterior: Number.isNaN(anteriorNum) ? 0 : anteriorNum,
      existeAdicional: tieneAdicional,
      tipoAdicional: tieneAdicional ? tipoAdicional : 0,
      lecturaActualAd: Number.isNaN(actualAdNum) ? 0 : actualAdNum,
      lecturaAnteriorAd: Number.isNaN(anteriorAdNum) ? 0 : anteriorAdNum
    };
  };

  const handleCopiarUltimaLectura = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const res = await monitorService.postCopiarUltimaLectura(lecturaId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Última lectura copiada');
      const submittedActual = lecturaActual;
      const submittedActualAd = lecturaActualAd;
      const submittedAnterior = lecturaAnterior;
      const submittedAnteriorAd = lecturaAnteriorAd;
      const submittedFecha = fecha;
      await fetchData();
      setLecturaActual(submittedActual);
      setLecturaActualAd(submittedActualAd);
      setLecturaAnterior(submittedAnterior);
      setLecturaAnteriorAd(submittedAnteriorAd);
      setFecha(submittedFecha);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al copiar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrar = async (): Promise<void> => {
    const body = buildSubmitBody();
    if (!body) return;

    setIsSubmitting(true);
    try {
      const res = await monitorService.postRegistroLectura(body);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Lectura registrada correctamente');
      const submittedActual = lecturaActual;
      const submittedActualAd = lecturaActualAd;
      const submittedAnterior = lecturaAnterior;
      const submittedAnteriorAd = lecturaAnteriorAd;
      const submittedFecha = fecha;
      await fetchData();
      setLecturaActual(submittedActual);
      setLecturaActualAd(submittedActualAd);
      setLecturaAnterior(submittedAnterior);
      setLecturaAnteriorAd(submittedAnteriorAd);
      setFecha(submittedFecha);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAceptar = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const res = await monitorService.postAceptarLectura(lecturaId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Lectura aceptada correctamente');
      await fetchData();
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al aceptar');
    } finally {
      setIsSubmitting(false);
    }
  };

  // TODO: reemplazar este hardcodeo cuando el endpoint de claves exponga
  // correctamente el id numérico correspondiente a cada `claveHtml`.
  const CLAVE_ID_HARDCODED = 24;

  const handleHabilitarEdicion = async (descripcion: string): Promise<void> => {
    if (!descripcion.trim()) {
      toast.error('Debe ingresar una descripción');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await monitorService.postHabilitarEdicionLectura({
        lecturaId,
        claveId: CLAVE_ID_HARDCODED,
        descripcion: descripcion.trim()
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Edición habilitada correctamente');
      setHabilitarDescripcion('');
      await fetchData();
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al habilitar la edición'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPending = async (): Promise<void> => {
    const action = pendingAction;
    setPendingAction(null);
    if (action === 'copiar') return handleCopiarUltimaLectura();
    if (action === 'registrar') return handleRegistrar();
    if (action === 'aceptar') return handleAceptar();
    if (action === 'habilitar')
      return handleHabilitarEdicion(habilitarDescripcion);
  };

  const handleSubmitOnEnter = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (isSubmitting || !puedeRegistrar) return;
    setPendingAction('registrar');
  };

  const puedeAceptar = Boolean(historial?.permiteAceptar) && !isSubmitting;

  const anomaliaPrincipal = useMemo(
    () => detectReadingAnomaly(lecturaAnterior, lecturaActual),
    [lecturaAnterior, lecturaActual]
  );

  const anomaliaAdicional = useMemo(
    () => detectReadingAnomaly(lecturaAnteriorAd, lecturaActualAd),
    [lecturaAnteriorAd, lecturaActualAd]
  );

  const puedeRegistrar = useMemo(
    () =>
      Boolean(historial?.permiteIngresar) &&
      lecturaActual.trim() !== '' &&
      !Number.isNaN(Number.parseFloat(lecturaActual)) &&
      !hasLowerReadingThanPrevious(lecturaAnterior, lecturaActual) &&
      (!tieneAdicional ||
        !hasLowerReadingThanPrevious(lecturaAnteriorAd, lecturaActualAd)),
    [
      historial?.permiteIngresar,
      lecturaActual,
      lecturaAnterior,
      tieneAdicional,
      lecturaAnteriorAd,
      lecturaActualAd
    ]
  );

  const claveActual = useMemo(() => {
    if (claveHtml) return claveHtml;
    return historial?.claves?.[0]?.codigo ?? null;
  }, [claveHtml, historial?.claves]);

  const isLecturaSinLectura = claveActual === 'SINLEC';
  const isLecturaCerrada = claveActual === 'LECCER';
  const puedeCopiarUltimaLectura =
    isLecturaSinLectura && !isLecturaCerrada && !isSubmitting;

  const claveIdMemo = useMemo<number | null>(() => {
    if (!claveActual) return null;

    const fromCatalogo =
      clavesCatalogo.find(c => c.text === claveActual) ??
      clavesCatalogo.find(c => c.value === claveActual);
    if (fromCatalogo) {
      const parsed = Number.parseInt(fromCatalogo.value, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }

    const numeric = Number.parseInt(claveActual, 10);
    if (!Number.isNaN(numeric) && String(numeric) === claveActual) {
      return numeric;
    }

    return null;
  }, [claveActual, clavesCatalogo]);

  useEffect(() => {
    if (claveActual && claveIdMemo === null) {
      // eslint-disable-next-line no-console
      console.warn(
        '[DetallesMedidor] No se pudo derivar claveId para habilitar edición.',
        {
          claveActual,
          clavesCatalogoLength: clavesCatalogo.length,
          clavesCatalogoSample: clavesCatalogo.slice(0, 5)
        }
      );
    }
  }, [claveActual, claveIdMemo, clavesCatalogo]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <LoadingCard message="Cargando información del medidor" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!historial) return null;
  // ----------------------------------------------------------------

  const serieAdicional = detalle?.serieAdicional ?? null;
  const resumenLectura = (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Medidor:</span>
        <span className="font-mono">{historial.cabecera.nroMedidor}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Fecha:</span>
        <span className="font-mono">{formatDateDDMMYYYY(fecha)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Lectura anterior:</span>
        <span className="font-mono">{lecturaAnterior || '-'}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Lectura actual:</span>
        <span className="font-mono font-semibold">{lecturaActual || '-'}</span>
      </div>
      {tieneAdicional && (
        <>
          <Separator className="my-2" />
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Adicional {serieAdicional ? `(${serieAdicional})` : ''}
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Tipo adicional:</span>
            <span className="font-mono">{tipoAdicional}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Anterior adicional:</span>
            <span className="font-mono">{lecturaAnteriorAd || '-'}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Actual adicional:</span>
            <span className="font-mono font-semibold">
              {lecturaActualAd || '-'}
            </span>
          </div>
        </>
      )}
    </div>
  );

  const isCompact = mode === 'compact';

  return (
    <>
      <form
        onSubmit={handleSubmitOnEnter}
        className={isCompact ? 'space-y-3' : 'space-y-4'}
      >
        {/* Formulario de lectura principal */}
        <Card>
          <CardHeader className={isCompact ? 'pb-2 p-3' : 'pb-2'}>
            <CardTitle
              className={cn(
                'flex items-center gap-2 font-medium',
                isCompact ? 'text-xs' : 'text-sm'
              )}
            >
              <Zap
                className={cn(
                  'text-emerald-600',
                  isCompact ? 'h-3 w-3' : 'h-4 w-4'
                )}
              />
              Registrar Lectura
              {historial.cabecera.nroMedidor && (
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  · {historial.cabecera.nroMedidor}
                </span>
              )}
              {serieAdicional && (
                <Badge variant="outline" className="font-mono text-[10px] ml-1">
                  Ad: {serieAdicional}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent
            className={cn(isCompact ? 'space-y-3 p-3 pt-0' : 'space-y-4')}
          >
            {/* En compact: lectura anterior y fecha como referencia; en full: inputs editables */}
            {isCompact ? (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Anterior:{' '}
                  <span className="font-mono text-foreground">
                    {lecturaAnterior || '-'}
                  </span>
                </span>
                <span>
                  Fecha:{' '}
                  <span className="font-mono text-foreground">
                    {formatDateDDMMYYYY(fecha)}
                  </span>
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    disabled
                    onChange={e => setFecha(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lecturaAnterior">Lectura Anterior</Label>
                  <Input
                    id="lecturaAnterior"
                    type="number"
                    disabled
                    value={lecturaAnterior}
                    onChange={e => setLecturaAnterior(e.target.value)}
                  />
                </div>
                <div className="space-y-1" />
              </div>
            )}

            <div className="space-y-1">
              <Label
                htmlFor="lecturaActual"
                className={cn(isCompact && 'text-xs')}
              >
                Lectura Actual <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lecturaActual"
                ref={lecturaActualInputRef}
                type="number"
                inputMode="decimal"
                value={lecturaActual}
                onChange={e => setLecturaActual(e.target.value)}
                placeholder="Ingrese lectura"
                className={cn('font-semibold', isCompact && 'h-9')}
              />
            </div>

            {anomaliaPrincipal.kind && (
              <ReadingAnomalyAlert
                kind={anomaliaPrincipal.kind}
                scope="principal"
                delta={anomaliaPrincipal.delta}
              />
            )}

            {/* Sección condicional del adicional */}
            {tieneAdicional && (
              <div
                className={cn(
                  'rounded-xl border border-dashed border-border/60 bg-muted/30 space-y-3',
                  isCompact ? 'p-2' : 'p-3'
                )}
              >
                {!isCompact && (
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Plus className="h-3 w-3" />
                    Medidor Adicional
                    {serieAdicional && (
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px]"
                      >
                        {serieAdicional}
                      </Badge>
                    )}
                  </div>
                )}

                {isCompact ? (
                  <div className="space-y-1">
                    <Label
                      htmlFor="lecturaActualAd"
                      className="text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Medidor Hijo
                      {serieAdicional && (
                        <span className="font-mono text-muted-foreground">
                          ({serieAdicional})
                        </span>
                      )}
                    </Label>
                    <Input
                      id="lecturaActualAd"
                      type="number"
                      inputMode="decimal"
                      value={lecturaActualAd}
                      onChange={e => setLecturaActualAd(e.target.value)}
                      placeholder={`Anterior: ${lecturaAnteriorAd || '-'}`}
                      className="font-semibold h-9"
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="tipoAdicional">Tipo Adicional</Label>
                        <Input
                          id="tipoAdicional"
                          type="number"
                          value={tipoAdicional}
                          disabled
                          readOnly
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lecturaAnteriorAd">
                          Lectura Anterior Ad.
                        </Label>
                        <Input
                          id="lecturaAnteriorAd"
                          type="number"
                          value={lecturaAnteriorAd}
                          onChange={e => setLecturaAnteriorAd(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lecturaActualAd">
                          Lectura Actual Ad.
                        </Label>
                        <Input
                          id="lecturaActualAd"
                          type="number"
                          inputMode="decimal"
                          value={lecturaActualAd}
                          onChange={e => setLecturaActualAd(e.target.value)}
                          placeholder="Ingrese lectura adicional"
                          className="font-semibold"
                        />
                      </div>
                    </div>

                    {anomaliaAdicional.kind && (
                      <ReadingAnomalyAlert
                        kind={anomaliaAdicional.kind}
                        scope="adicional"
                        delta={anomaliaAdicional.delta}
                      />
                    )}
                  </>
                )}

                {isCompact && anomaliaAdicional.kind && (
                  <ReadingAnomalyAlert
                    kind={anomaliaAdicional.kind}
                    scope="adicional"
                    delta={anomaliaAdicional.delta}
                  />
                )}
              </div>
            )}

            {/* Acciones principales */}
            <div
              className={cn(
                'flex flex-wrap gap-2',
                isCompact ? 'pt-1' : 'pt-2'
              )}
            >
              {isCompact ? (
                <>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      !puedeRegistrar || isSubmitting || isLecturaCerrada
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Registrar
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setPendingAction('aceptar')}
                    disabled={!puedeAceptar}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Aceptar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingAction('copiar')}
                    disabled={!puedeCopiarUltimaLectura}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar última
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      !puedeRegistrar || isSubmitting || isLecturaCerrada
                    }
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Registrar
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setPendingAction('aceptar')}
                    disabled={!puedeAceptar}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Aceptar
                  </Button>
                  {!historial.permiteIngresar && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingAction('habilitar')}
                      disabled={isSubmitting}
                      className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30"
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Habilitar edición
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchData}
                    disabled={isSubmitting}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refrescar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {/* AlertDialogs de confirmación */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={open => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === 'registrar' && '¿Registrar lectura?'}
              {pendingAction === 'aceptar' && '¿Aceptar lectura?'}
              {pendingAction === 'copiar' && '¿Copiar última lectura?'}
              {pendingAction === 'habilitar' && '¿Habilitar edición?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {pendingAction === 'copiar' && (
                  <p>
                    Se copiará la última lectura registrada al formulario
                    actual.
                  </p>
                )}
                {pendingAction === 'registrar' && (
                  <p>Se registrarán los siguientes valores para el medidor:</p>
                )}
                {pendingAction === 'aceptar' && (
                  <p>
                    Una vez aceptada, la lectura pasará a facturación. No podrás
                    revertirlo desde aquí.
                  </p>
                )}
                {pendingAction === 'habilitar' && (
                  <div className="space-y-2">
                    <p>
                      Se volverá a permitir el ingreso y edición de la lectura.
                      Indique el motivo:
                    </p>
                    <div className="space-y-1 text-left">
                      <Label htmlFor="habilitar-descripcion">Motivo</Label>
                      <Input
                        id="habilitar-descripcion"
                        value={habilitarDescripcion}
                        onChange={e => setHabilitarDescripcion(e.target.value)}
                        placeholder="Ej. Corrección solicitada por el cliente"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
                {pendingAction !== 'copiar' &&
                  pendingAction !== 'habilitar' &&
                  resumenLectura}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPending}
              disabled={
                isSubmitting ||
                (pendingAction === 'habilitar' && !habilitarDescripcion.trim())
              }
              className={
                pendingAction === 'aceptar'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : pendingAction === 'registrar'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : pendingAction === 'habilitar'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : ''
              }
            >
              {isSubmitting
                ? 'Procesando...'
                : pendingAction === 'registrar'
                  ? 'Registrar'
                  : pendingAction === 'aceptar'
                    ? 'Aceptar'
                    : pendingAction === 'habilitar'
                      ? 'Habilitar'
                      : 'Copiar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ReadingAnomalyAlertProps {
  kind: NonNullable<ReadingAnomalyKind>;
  scope: 'principal' | 'adicional';
  delta: number;
}

function ReadingAnomalyAlert({ kind, scope }: ReadingAnomalyAlertProps) {
  const isWraparound = kind === 'wraparound';
  const title = isWraparound
    ? 'Lectura menor al valor actual'
    : 'Consumo igual a cero';
  const message = isWraparound
    ? `La lectura ingresada es menor que el valor actual registrado. Solo se deben ingresar valores iguales o mayores al consumo actual.`
    : `La lectura actual es igual a la anterior. El consumo del período será 0.`;

  return (
    <Alert
      variant={isWraparound ? 'destructive' : 'default'}
      className={
        isWraparound
          ? 'border-amber-500/60 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200'
          : 'border-yellow-500/60 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-200'
      }
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <span>{message}</span>
      </AlertDescription>
    </Alert>
  );
}
