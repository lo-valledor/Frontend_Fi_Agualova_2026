import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Copy,
  Gauge,
  History,
  Key,
  PlugIcon,
  RefreshCw,
  Save,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import { LoadingCard } from '~/components/ui/loading-card';
import { monitorService } from '~/services/monitorService';
import type {
  MonitorHistorialLectura,
  MonitorProps
} from '~/types/monitor';

interface DetallesMedidorProps {
  lecturaId: number;
  onSuccess?: () => void;
}

export default function DetallesMedidor({
  lecturaId,
  onSuccess
}: Readonly<DetallesMedidorProps>) {
  const [historial, setHistorial] = useState<MonitorHistorialLectura | null>(
    null
  );
  const [detalle, setDetalle] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [lecturaActual, setLecturaActual] = useState<string>('');
  const [lecturaAnterior, setLecturaAnterior] = useState<string>('');
  const [existeAdicional, setExisteAdicional] = useState(false);
  const [tipoAdicional, setTipoAdicional] = useState<number>(0);
  const [lecturaActualAd, setLecturaActualAd] = useState<string>('');
  const [lecturaAnteriorAd, setLecturaAnteriorAd] = useState<string>('');
  const [complementoBT43, setComplementoBT43] = useState<string>('');

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [historialRes, detalleRes] = await Promise.all([
        monitorService.getHistorialLectura(lecturaId),
        monitorService.getDetalleRegistro(lecturaId)
      ]);

      if (historialRes.error || !historialRes.data) {
        setError(historialRes.error ?? 'No se pudo cargar el historial');
        return;
      }

      const h = historialRes.data;
      setHistorial(h);
      setDetalle(detalleRes.data ?? null);

      // Pre-fill lectura anterior from historial if available
      const lastReading = h.lecturasAnteriores?.[0];
      if (lastReading) {
        setLecturaAnterior(lastReading);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
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
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al copiar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrar = async (): Promise<void> => {
    if (!lecturaActual) {
      toast.error('Debe ingresar la lectura actual');
      return;
    }

    setIsSubmitting(true);
    try {
      const body: MonitorProps = {
        idLectura: lecturaId,
        fecha,
        lecturaActual: Number(lecturaActual),
        lecturaAnterior: Number(lecturaAnterior || 0),
        existeAdicional,
        tipoAdicional,
        lecturaActualAd: Number(lecturaActualAd || 0),
        lecturaAnteriorAd: Number(lecturaAnteriorAd || 0)
      };
      const res = await monitorService.postRegistroLectura(body);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Lectura registrada correctamente');
      await fetchData();
      if (onSuccess) onSuccess();
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
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al aceptar');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (lecturaId) {
      fetchData();
    }
  }, [lecturaId]);

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
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!historial) return null;

  return (
    <ScrollArea className="overflow-y-auto">
      <div className="space-y-4 p-1">
        {/* Meter info card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Gauge className="h-4 w-4 text-blue-600" />
              Información del Medidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <FieldItem
                icon={<Gauge className="h-3 w-3" />}
                label="Medidor"
                value={historial.cabecera.nroMedidor}
              />
              <FieldItem
                icon={<Zap className="h-3 w-3 text-emerald-600" />}
                label="Tipo"
                value={historial.cabecera.tipo}
              />
              <FieldItem
                icon={<Key className="h-3 w-3 text-amber-600" />}
                label="Tarifa"
                value={historial.cabecera.tarifa}
              />
              <FieldItem
                icon={<Gauge className="h-3 w-3 text-purple-600" />}
                label="Constante"
                value={historial.cabecera.constante}
              />
              <FieldItem
                icon={<PlugIcon className="h-3 w-3 text-orange-600" />}
                label="Subempalme"
                value={historial.cabecera.subempalme}
              />
              <div className="p-3 rounded-xl border border-border bg-background">
                <div className="flex items-center gap-2 mb-1.5">
                  <History className="h-3 w-3 text-slate-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Estado
                  </span>
                </div>
                <Badge
                  variant={historial.permiteAceptar ? 'default' : 'secondary'}
                >
                  {historial.permiteAceptar
                    ? 'Permite aceptar'
                    : historial.permiteIngresar
                      ? 'Permite ingresar'
                      : 'Cerrado'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading form */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-emerald-600" />
              Registrar Lectura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lecturaAnterior">Lectura Anterior</Label>
                <Input
                  id="lecturaAnterior"
                  type="number"
                  value={lecturaAnterior}
                  onChange={(e) => setLecturaAnterior(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lecturaActual">Lectura Actual</Label>
                <Input
                  id="lecturaActual"
                  type="number"
                  value={lecturaActual}
                  onChange={(e) => setLecturaActual(e.target.value)}
                />
              </div>
            </div>

            {historial.lecturasAnteriores?.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Lecturas anteriores:{' '}
                {historial.lecturasAnteriores.join(' / ')}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopiarUltimaLectura}
                disabled={isSubmitting}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar última
              </Button>
              <Button
                size="sm"
                onClick={handleRegistrar}
                disabled={isSubmitting || !historial.permiteIngresar}
              >
                <Save className="h-3 w-3 mr-1" />
                Registrar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAceptar}
                disabled={isSubmitting || !historial.permiteAceptar}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Aceptar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchData}
                disabled={isSubmitting}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refrescar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keys */}
        {historial.claves?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Key className="h-4 w-4 text-amber-600" />
                Claves de Lectura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {historial.claves.map((clave, idx) => (
                <div
                  key={`${clave}-${idx}`}
                  className="p-3 bg-muted/30 rounded-xl border border-border/20"
                >
                  <span className="font-mono text-sm">{clave}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* BT43 complemento */}
        {historial.complementoBT43 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-purple-600" />
                Complemento BT43
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Label htmlFor="complementoBT43">Detalle BT43</Label>
                <Input
                  id="complementoBT43"
                  value={complementoBT43 || historial.complementoBT43}
                  onChange={(e) => setComplementoBT43(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />
        <div className="text-xs text-muted-foreground text-center">
          Lectura ID: {lecturaId}
        </div>
      </div>
    </ScrollArea>
  );
}

interface FieldItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

function FieldItem({ icon, label, value }: FieldItemProps) {
  return (
    <div className="p-3 rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-mono text-sm font-semibold text-foreground truncate">
        {value || '-'}
      </p>
    </div>
  );
}
