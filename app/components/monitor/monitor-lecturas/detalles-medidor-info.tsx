import {
  AlertCircle,
  BarChart3,
  Calendar,
  Gauge,
  History,
  Key,
  PlugIcon,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Rectangle
} from 'recharts';

import {
  Background,
  Bar,
  EvilComposedChart,
  Grid,
  Tooltip,
  XAxis,
  YAxis
} from '~/components/evilcharts/charts/composed-chart';
import {
  type ChartConfig,
  ChartContainer
} from '~/components/evilcharts/ui/chart';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { LoadingCard } from '~/components/ui/loading-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { cn } from '~/lib/utils';
import { monitorService } from '~/services/monitorService';
import type {
  MonitorDetalleRegistro,
  MonitorHistorialLectura
} from '~/types/monitor';

interface DetallesMedidorInfoProps {
  lecturaId: number;
}

type ComparacionConsumoAnual = {
  tipoPeriodo: string;
  periodo: string;
  fechaLectura: string;
  lecturaActual: number;
  consumoPeriodo: number;
};

type ComparacionChartPoint = ComparacionConsumoAnual & {
  label: string;
  tipoLabel: string;
};

type HistorialConsumoChartPoint = {
  periodo: string;
  periodoLabel: string;
  fechaLectura: string;
  lecturaActual: number;
  ultimaLectura: number;
  consumoPeriodo: number;
};

export default function DetallesMedidorInfo({
  lecturaId
}: Readonly<DetallesMedidorInfoProps>) {
  const [historial, setHistorial] = useState<MonitorHistorialLectura | null>(
    null
  );
  const [detalle, setDetalle] = useState<MonitorDetalleRegistro | null>(null);
  const [comparacionConsumo, setComparacionConsumo] = useState<
    ComparacionConsumoAnual[]
  >([]);
  const [comparacionError, setComparacionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setComparacionError(null);
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

        const h = historialRes.data;
        const d = detalleRes.data ?? null;
        setHistorial(h);
        setDetalle(d);

        const numeroSerie = d?.serieMedidor ?? h.cabecera.nroMedidor;
        const periodoActual = h.lecturasAnteriores?.[0]?.periodo;
        if (numeroSerie && periodoActual) {
          const comparacionRes = await monitorService.getComparaConsumoAnual(
            numeroSerie,
            periodoActual
          );

          if (cancelled) return;

          if (comparacionRes.error) {
            setComparacionConsumo([]);
            setComparacionError(comparacionRes.error);
          } else {
            setComparacionConsumo(
              normalizeComparacionConsumoAnual(comparacionRes.data)
            );
          }
        } else {
          setComparacionConsumo([]);
        }
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
  const comparacionChartData: ComparacionChartPoint[] = comparacionConsumo.map(
    item => ({
      ...item,
      label: formatPeriodoLabel(item.periodo),
      tipoLabel: formatTipoPeriodoLabel(item.tipoPeriodo)
    })
  );
  const consumoActual = comparacionConsumo.find(
    item => item.tipoPeriodo === 'PeriodoActual'
  );
  const consumoAnterior = comparacionConsumo.find(
    item => item.tipoPeriodo === 'PeriodoAnterior'
  );
  const variacionConsumo =
    consumoActual && consumoAnterior
      ? consumoActual.consumoPeriodo - consumoAnterior.consumoPeriodo
      : null;

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

      <ConsumoAnualTabs
        chartData={comparacionChartData}
        historial={historial.lecturasAnteriores ?? []}
        error={comparacionError}
        variacionConsumo={variacionConsumo}
      />

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

interface ConsumoAnualTabsProps {
  chartData: ComparacionChartPoint[];
  historial: MonitorHistorialLectura['lecturasAnteriores'];
  error: string | null;
  variacionConsumo: number | null;
}

function normalizeComparacionConsumoAnual(
  value: unknown
): ComparacionConsumoAnual[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap(item => {
    if (!isRecord(item)) return [];

    const periodo = asString(item.periodo);
    const tipoPeriodo = asString(item.tipoPeriodo);
    const lecturaActual = asNumber(item.lecturaActual);
    const consumoPeriodo = asNumber(item.consumoPeriodo);

    if (!periodo || !tipoPeriodo) return [];

    return [
      {
        tipoPeriodo,
        periodo,
        fechaLectura: asString(item.fechaLectura),
        lecturaActual,
        consumoPeriodo
      }
    ];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function asNumber(value: unknown): number {
  const numberValue =
    typeof value === 'number'
      ? value
      : Number(String(value ?? '').replace(',', '.'));

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatTipoPeriodoLabel(tipoPeriodo: string): string {
  const labels: Record<string, string> = {
    PeriodoActual: 'Período actual',
    PeriodoAnterior: 'Mismo período anterior'
  };

  return labels[tipoPeriodo] ?? tipoPeriodo;
}

function formatPeriodoLabel(periodo: string): string {
  if (periodo.length !== 6) return periodo;

  const month = Number(periodo.slice(0, 2));
  const year = periodo.slice(2);
  const monthLabels = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
  ];

  return month >= 1 && month <= 12
    ? `${monthLabels[month - 1]} ${year}`
    : periodo;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 2
  }).format(value);
}

const historialChartConfig = {
  consumoPeriodo: {
    label: 'Consumo período',
    colors: { light: ['#0891b2'], dark: ['#22d3ee'] }
  }
} satisfies ChartConfig;

function ConsumoAnualTabs({
  chartData,
  historial,
  error,
  variacionConsumo
}: ConsumoAnualTabsProps) {
  return (
    <Card className="overflow-hidden border-slate-200/70 shadow-sm dark:border-slate-800 ">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-cyan-600" />
          Comparador de consumo
          {variacionConsumo !== null && (
            <Badge
              variant="outline"
              className={cn(
                'ml-auto font-mono',
                variacionConsumo > 0
                  ? 'border-amber-500/60 text-amber-700 dark:text-amber-300'
                  : 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300'
              )}
            >
              Diferencia: {formatNumber(variacionConsumo)} m³
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grafico" className="gap-4">
          <TabsList className="grid w-full grid-cols-2 sm:w-[360px]">
            <TabsTrigger value="grafico">
              <BarChart3 className="h-3.5 w-3.5" />
              Gráfico
            </TabsTrigger>
            <TabsTrigger value="lecturas">
              <History className="h-3.5 w-3.5" />
              Lecturas anteriores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grafico" className="mt-2">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>No se pudo cargar la comparación</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : chartData.length > 0 ? (
              <div className="rounded-2xl border p-3 dark:border-cyan-950/60">
                <EvilComposedChart
                  data={chartData}
                  config={{
                    consumoPeriodo: {
                      label: 'Consumo período',
                      colors: {
                        light: ['#0891b2'],
                        dark: ['#22d3ee']
                      }
                    }
                  }}
                  className="h-[260px] w-full p-2 sm:h-[300px] sm:p-4"
                  xDataKey="label"
                >
                  <Background variant="grid" />
                  <Grid />
                  <XAxis
                    dataKey="label"
                    tickFormatter={value => String(value)}
                  />
                  <YAxis
                    width={52}
                    tickFormatter={value => `${formatNumber(Number(value))}`}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="consumoPeriodo"
                    name="Consumo período"
                    isClickable
                  />
                </EvilComposedChart>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {chartData.map(item => (
                    <div
                      key={`${item.tipoPeriodo}-${item.periodo}`}
                      className="rounded-xl border bg-background/80 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{item.tipoLabel}</span>
                        <Badge variant="secondary" className="font-mono">
                          {item.periodo}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <span className="text-muted-foreground">Consumo</span>
                        <span className="font-mono text-lg font-semibold">
                          {formatNumber(item.consumoPeriodo)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            m³
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No hay datos de comparación anual para graficar.
              </div>
            )}
          </TabsContent>

          <TabsContent value="lecturas" className="mt-2">
            {historial.length > 0 ? (
              <HistorialConsumosBarChart historial={historial} />
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No hay lecturas anteriores para mostrar.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function HistorialConsumosBarChart({
  historial
}: {
  historial: MonitorHistorialLectura['lecturasAnteriores'];
}) {
  const chartData = normalizeHistorialConsumos(historial);

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-dashed pb-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.28em]">
            Historial de consumos
          </p>
          <p className="font-mono text-2xl font-semibold tracking-tight">
            {chartData.length} períodos
          </p>
        </div>
      </div>

      <ChartContainer
        config={historialChartConfig}
        className="h-[280px] w-full"
      >
        <RechartsBarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 20, right: 12, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="rgba(165, 243, 252, 0.16)"
            strokeDasharray="4 6"
          />
          <RechartsXAxis
            dataKey="periodoLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fill: 'rgba(207, 250, 254, 0.72)', fontSize: 11 }}
          />
          <RechartsYAxis
            width={48}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgba(207, 250, 254, 0.55)', fontSize: 11 }}
            tickFormatter={value => formatNumber(Number(value))}
          />
          <RechartsTooltip
            cursor={{ fill: 'rgba(34, 211, 238, 0.08)' }}
            content={<HistorialConsumoTooltip />}
          />
          <RechartsBar
            dataKey="consumoPeriodo"
            fill="var(--color-consumoPeriodo)"
            radius={[6, 6, 2, 2]}
            shape={<HistorialBarShape />}
            activeBar={<HistorialBarShape isActive />}
          />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}

function normalizeHistorialConsumos(
  historial: MonitorHistorialLectura['lecturasAnteriores']
): HistorialConsumoChartPoint[] {
  return [...historial].reverse().map(item => ({
    periodo: asString(item.periodo),
    periodoLabel: formatPeriodoLabel(asString(item.periodo)),
    fechaLectura: asString(item.fechaLectura),
    lecturaActual: asNumber(item.lecturaActual),
    ultimaLectura: asNumber(item.ultimaLectura),
    consumoPeriodo: asNumber(item.consumoPeriodo)
  }));
}

interface HistorialTooltipPayload {
  payload?: HistorialConsumoChartPoint;
}

function HistorialConsumoTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: HistorialTooltipPayload[];
}) {
  const item = payload?.[0]?.payload;

  if (!active || !item) {
    return null;
  }

  return (
    <div className="min-w-56 rounded-xl border bg-card p-3 font-mono text-cyan-50 text-xs shadow-2xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-cyan-200/70">Período</span>
        <span className="font-semibold">{item.periodoLabel}</span>
      </div>
      <TooltipRow label="Código" value={item.periodo} />
      <TooltipRow label="Fecha lectura" value={item.fechaLectura || '-'} />
      <TooltipRow
        label="Lectura actual"
        value={formatNumber(item.lecturaActual)}
      />
      <TooltipRow
        label="Lectura anterior"
        value={formatNumber(item.ultimaLectura)}
      />
      <div className="mt-2 rounded-lg bg-cyan-400/10 px-2 py-1.5">
        <TooltipRow
          label="Consumo"
          value={`${formatNumber(item.consumoPeriodo)} m³`}
        />
      </div>
    </div>
  );
}

function TooltipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="text-cyan-200/60">{label}</span>
      <span className="text-right text-cyan-50">{value}</span>
    </div>
  );
}

interface HistorialBarShapeProps {
  fill?: string;
  height?: number;
  index?: number;
  isActive?: boolean;
  payload?: HistorialConsumoChartPoint;
  value?: number | [number, number];
  width?: number;
  x?: number;
  y?: number;
}

const COLLAPSED_BAR_SCALE = 0.14;

function HistorialBarShape({
  fill,
  height,
  index,
  isActive,
  payload,
  value,
  width,
  x,
  y
}: HistorialBarShapeProps) {
  const xPosition = Number(x ?? 0);
  const yPosition = Number(y ?? 0);
  const barWidth = Number(width ?? 0);
  const barHeight = Number(height ?? 0);
  const centerX = xPosition + barWidth / 2;
  const centerY = yPosition + barHeight / 2;

  return (
    <>
      <Rectangle
        x={xPosition}
        y={yPosition}
        width={barWidth}
        height={barHeight}
        fill="transparent"
      />
      <AnimatePresence>
        <motion.rect
          key={`historial-consumo-${index}`}
          x={xPosition}
          y={yPosition}
          width={barWidth}
          height={barHeight}
          rx={6}
          fill={fill}
          initial={{ scaleX: isActive ? COLLAPSED_BAR_SCALE : 1 }}
          animate={{ scaleX: isActive ? 1 : COLLAPSED_BAR_SCALE }}
          exit={{ scaleX: COLLAPSED_BAR_SCALE }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          style={{
            transformBox: 'fill-box',
            transformOrigin: `${centerX}px ${centerY}px`
          }}
        />
      </AnimatePresence>
      {isActive && (
        <AnimatePresence>
          <motion.text
            key={`historial-periodo-${index}`}
            className="font-mono"
            initial={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
            transition={{ duration: 0.18 }}
            x={centerX}
            y={Math.max(12, yPosition - 6)}
            fill={fill}
            fontSize={11}
            fontWeight={700}
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            {payload?.periodoLabel ?? value}
          </motion.text>
        </AnimatePresence>
      )}
    </>
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
