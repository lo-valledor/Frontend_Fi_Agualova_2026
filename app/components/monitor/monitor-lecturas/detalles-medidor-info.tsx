import {
  AlertCircle,
  Calendar,
  Gauge,
  History,
  Key,
  PlugIcon,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { LoadingCard } from '~/components/ui/loading-card';
import { monitorService } from '~/services/monitorService';
import type {
  MonitorDetalleRegistro,
  MonitorHistorialLectura
} from '~/types/monitor';

import { columnsLeturasAnteriores } from './columns-metercard';

interface DetallesMedidorInfoProps {
  lecturaId: number;
}

export default function DetallesMedidorInfo({
  lecturaId
}: Readonly<DetallesMedidorInfoProps>) {
  const [historial, setHistorial] = useState<MonitorHistorialLectura | null>(
    null
  );
  const [detalle, setDetalle] = useState<MonitorDetalleRegistro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const [historialRes, detalleRes] = await Promise.all([
          monitorService.getHistorialLectura(lecturaId),
          monitorService.getDetalleRegistro(lecturaId)
        ]);

        if (cancelled) return;

        if (historialRes.error || !historialRes.data) {
          setError(historialRes.error ?? 'No se pudo cargar el historial');
          return;
        }

        setHistorial(historialRes.data);
        setDetalle(detalleRes.data ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
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

  const serieAdicional = detalle?.serieAdicional ?? null;

  return (
    <div className="space-y-4">
      {/* Cabecera del medidor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Gauge className="h-4 w-4 text-blue-600" />
            Información del Medidor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
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
            <FieldItem
              icon={<History className="h-3 w-3 text-slate-500" />}
              label="Estado"
              value={
                historial.permiteAceptar
                  ? 'Permite aceptar'
                  : historial.permiteIngresar
                    ? 'Permite ingresar'
                    : 'Cerrado'
              }
            />
          </div>
          {serieAdicional && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Adicional:</span>
              <Badge variant="secondary" className="font-mono">
                {serieAdicional}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lecturas anteriores */}
      {historial.lecturasAnteriores?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4 text-slate-500" />
              Lecturas anteriores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1 max-h-72 overflow-y-auto">
              <DataTable
                columns={columnsLeturasAnteriores}
                data={historial.lecturasAnteriores}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claves de lectura */}
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
                key={`${clave.codigo}-${idx}`}
                className="p-2 bg-muted/30 rounded-lg border border-border/20 space-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold">
                    {clave.codigo}
                  </span>
                  {clave.fecha && (
                    <span className="text-[10px] text-muted-foreground">
                      {clave.fecha}
                    </span>
                  )}
                </div>
                {clave.descripcion && (
                  <p className="text-xs text-muted-foreground">
                    {clave.descripcion}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Complemento BT43 (solo lectura) */}
      {historial.complementoBT43 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-purple-600" />
              Complemento BT43
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
              {historial.complementoBT43}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FieldItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

function FieldItem({ icon, label, value }: FieldItemProps) {
  return (
    <div className="p-2 rounded-lg border border-border bg-background">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-mono text-xs font-semibold text-foreground truncate">
        {value || '-'}
      </p>
    </div>
  );
}
