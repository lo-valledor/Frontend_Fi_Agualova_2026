import {
  ArrowLeft,
  Building2,
  CalendarRange,
  FileText,
  Gauge,
  LayoutList,
  MapPin,
  Receipt,
  TrendingDown,
  TrendingUp,
  User
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  ActiveDot,
  Background,
  Bar,
  Dot,
  EvilComposedChart,
  Grid,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from '~/components/evilcharts/charts/composed-chart';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { ConsolidadoConsultaContrato } from '~/types/reportes';

interface ContratoDetailComponentProps {
  contrato: ConsolidadoConsultaContrato | null;
  error: Error | null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || 'N/A'}</span>
    </div>
  );
}

export default function ContratoDetailComponent({
  contrato,
  error
}: Readonly<ContratoDetailComponentProps>) {
  const navigate = useNavigate();
  const [lecturasRange, setLecturasRange] = useState<'6' | '12' | 'all'>('all');
  const [facturasRange, setFacturasRange] = useState<'6' | '12' | 'all'>('all');

  const lecturasAnalytics = useMemo(() => {
    if (!contrato) {
      return {
        chartData: [],
        tableRows: [],
        latestConsumption: 0,
        averageConsumption: 0,
        maxConsumption: 0,
        zeroPeriods: 0,
        latestPeriodLabel: 'N/A',
        latestReadingDateLabel: 'N/A',
        consumptionDelta: null as DeltaSummary | null,
        averageLine: 0,
        maxLine: 0
      };
    }

    const chartData = contrato.lecturas
      .map(lectura => {
        const consumo = toNumber(lectura.consumo);
        const lecturaActual = toNumber(lectura.lecturaActual);
        const fecha =
          parseApiDate(lectura.fechaLectura) ??
          parsePeriodDate(lectura.periodo) ??
          new Date(0);

        return {
          periodo: lectura.periodo,
          label: formatPeriodShortLabel(lectura.periodo),
          periodoLabel: formatPeriodLabel(lectura.periodo),
          fechaLecturaLabel: formatDateLabel(lectura.fechaLectura),
          consumo,
          lecturaActual,
          fecha: fecha.getTime()
        };
      })
      .sort((a, b) => a.fecha - b.fecha);

    const visibleChartData = sliceByRange(chartData, lecturasRange);
    const consumos = visibleChartData.map(item => item.consumo);

    return {
      chartData: visibleChartData,
      tableRows: visibleChartData.map((item, index, array) => ({
        periodoLabel: item.periodoLabel,
        fechaLecturaLabel: item.fechaLecturaLabel,
        consumoLabel: formatVolume(item.consumo),
        lecturaActualLabel: formatReading(item.lecturaActual),
        variationLabel: formatDeltaLabel(
          buildDeltaSummary(item.consumo, array[index - 1]?.consumo)
        )
      })),
      latestConsumption: visibleChartData.at(-1)?.consumo ?? 0,
      averageConsumption:
        consumos.length > 0
          ? Math.round(
              consumos.reduce((sum, value) => sum + value, 0) / consumos.length
            )
          : 0,
      maxConsumption: consumos.length > 0 ? Math.max(...consumos) : 0,
      zeroPeriods: visibleChartData.filter(item => item.consumo === 0).length,
      latestPeriodLabel: visibleChartData.at(-1)?.periodoLabel ?? 'N/A',
      latestReadingDateLabel:
        visibleChartData.at(-1)?.fechaLecturaLabel ?? 'N/A',
      consumptionDelta: buildDeltaSummary(
        visibleChartData.at(-1)?.consumo,
        visibleChartData.at(-2)?.consumo
      ),
      averageLine:
        consumos.length > 0
          ? consumos.reduce((sum, value) => sum + value, 0) / consumos.length
          : 0,
      maxLine: consumos.length > 0 ? Math.max(...consumos) : 0
    };
  }, [contrato, lecturasRange]);

  const facturasAnalytics = useMemo(() => {
    if (!contrato) {
      return {
        chartData: [],
        tableRows: [],
        latestTotal: 0,
        averageTotal: 0,
        maxTotal: 0,
        totalBilled: 0,
        latestPeriodLabel: 'N/A',
        latestEmissionDateLabel: 'N/A',
        latestDueDateLabel: 'N/A',
        totalDelta: null as DeltaSummary | null,
        consumptionDelta: null as DeltaSummary | null,
        averageLine: 0
      };
    }

    const chartData = contrato.facturas
      .map(factura => {
        const total = toNumber(factura.total);
        const consumo = toNumber(factura.consumo);
        const fechaEmision =
          parseApiDate(factura.fechaEmision) ??
          parsePeriodDate(factura.periodo) ??
          new Date(0);
        const fechaVencimiento =
          parseApiDate(factura.fechaVencimiento) ?? fechaEmision;

        return {
          periodo: factura.periodo,
          label: formatPeriodShortLabel(factura.periodo),
          periodoLabel: formatPeriodLabel(factura.periodo),
          fechaEmisionLabel: formatDateLabel(factura.fechaEmision),
          fechaVencimientoLabel: formatDateLabel(factura.fechaVencimiento),
          total,
          consumo,
          fecha: fechaEmision.getTime(),
          fechaVencimiento: fechaVencimiento.getTime()
        };
      })
      .sort((a, b) => a.fecha - b.fecha);

    const visibleChartData = sliceByRange(chartData, facturasRange);
    const totals = visibleChartData.map(item => item.total);
    const totalBilled = totals.reduce((sum, value) => sum + value, 0);

    return {
      chartData: visibleChartData,
      tableRows: visibleChartData.map((item, index, array) => ({
        periodoLabel: item.periodoLabel,
        fechaEmisionLabel: item.fechaEmisionLabel,
        fechaVencimientoLabel: item.fechaVencimientoLabel,
        totalLabel: formatCurrency(item.total),
        consumoLabel: formatVolume(item.consumo),
        variationLabel: formatDeltaLabel(
          buildDeltaSummary(item.total, array[index - 1]?.total)
        )
      })),
      latestTotal: visibleChartData.at(-1)?.total ?? 0,
      averageTotal:
        totals.length > 0 ? Math.round(totalBilled / totals.length) : 0,
      maxTotal: totals.length > 0 ? Math.max(...totals) : 0,
      totalBilled,
      latestPeriodLabel: visibleChartData.at(-1)?.periodoLabel ?? 'N/A',
      latestEmissionDateLabel:
        visibleChartData.at(-1)?.fechaEmisionLabel ?? 'N/A',
      latestDueDateLabel:
        visibleChartData.at(-1)?.fechaVencimientoLabel ?? 'N/A',
      totalDelta: buildDeltaSummary(
        visibleChartData.at(-1)?.total,
        visibleChartData.at(-2)?.total
      ),
      consumptionDelta: buildDeltaSummary(
        visibleChartData.at(-1)?.consumo,
        visibleChartData.at(-2)?.consumo
      ),
      averageLine:
        totals.length > 0
          ? totals.reduce((sum, value) => sum + value, 0) / totals.length
          : 0
    };
  }, [contrato, facturasRange]);

  if (error || !contrato) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error al cargar el contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error?.message ?? 'No se encontró información del contrato.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate('/dashboard/reportes/consultar-contrato')}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Numero" value={contrato.contrato.nroContrato} />
            <DetailRow label="Tipo" value={contrato.contrato.tipoContrato} />
            <DetailRow label="Tarifa" value={contrato.contrato.codigoTarifa} />
            <DetailRow
              label="Ciclo"
              value={contrato.contrato.cicloFacturacion}
            />
            <DetailRow label="Estado" value={contrato.contrato.estado} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="RUT" value={contrato.cliente.rut} />
            <DetailRow label="Nombre" value={contrato.cliente.nombre} />
            <DetailRow label="Comuna" value={contrato.cliente.comuna} />
            <DetailRow label="Contacto" value={contrato.cliente.contacto} />
            <DetailRow label="Email" value={contrato.cliente.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Propietario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="RUT" value={contrato.propietario.rut} />
            <DetailRow label="Nombre" value={contrato.propietario.nombre} />
            <DetailRow label="Comuna" value={contrato.propietario.comuna} />
            <DetailRow label="Telefono" value={contrato.propietario.telefono} />
            <DetailRow label="Email" value={contrato.propietario.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Ubicacion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Local" value={contrato.lugar.nroLocal} />
            <DetailRow label="Referencia" value={contrato.lugar.otroLugar} />
            <DetailRow label="Acometida" value={contrato.empalme.acometida} />
            <DetailRow label="Sector" value={contrato.empalme.sector} />
            <DetailRow label="Nicho" value={contrato.empalme.nicho} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4" />
              Medidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Serie" value={contrato.medidor.nroMedidor} />
            <DetailRow label="Tipo" value={contrato.medidor.tipoMedidor} />
            <DetailRow
              label="Constante"
              value={contrato.medidor.constanteMultiplicar}
            />
            <DetailRow label="Digitos" value={contrato.medidor.digitos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen historico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow
              label="Lecturas"
              value={String(contrato.lecturas.length)}
            />
            <DetailRow
              label="Facturas"
              value={String(contrato.facturas.length)}
            />
            <DetailRow
              label="Ultimo periodo lectura"
              value={contrato.lecturas.at(-1)?.periodo ?? 'N/A'}
            />
            <DetailRow
              label="Ultimo periodo factura"
              value={contrato.facturas.at(-1)?.periodo ?? 'N/A'}
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lecturas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lecturas" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Lecturas
          </TabsTrigger>
          <TabsTrigger value="facturas" className="gap-2">
            <Receipt className="h-4 w-4" />
            Facturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lecturas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Último consumo"
              value={formatVolume(lecturasAnalytics.latestConsumption)}
              description={`${lecturasAnalytics.latestPeriodLabel} · ${lecturasAnalytics.latestReadingDateLabel}`}
              delta={lecturasAnalytics.consumptionDelta}
            />
            <MetricCard
              title="Promedio"
              value={formatVolume(lecturasAnalytics.averageConsumption)}
              description="Consumo medio del historial visible"
            />
            <MetricCard
              title="Máximo"
              value={formatVolume(lecturasAnalytics.maxConsumption)}
              description="Punto más alto del período visible"
            />
            <MetricCard
              title="Períodos en cero"
              value={lecturasAnalytics.zeroPeriods.toLocaleString('es-CL')}
              description="Períodos sin consumo registrado"
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarRange className="h-4 w-4" />
                  Evolución de lecturas
                </CardTitle>
                <RangeSelector
                  value={lecturasRange}
                  onChange={setLecturasRange}
                />
              </div>
            </CardHeader>
            <CardContent>
              {lecturasAnalytics.chartData.length > 0 ? (
                <EvilComposedChart
                  data={lecturasAnalytics.chartData}
                  config={{
                    consumo: {
                      label: 'Consumo',
                      colors: {
                        light: ['#2563eb'],
                        dark: ['#60a5fa']
                      }
                    },
                    lecturaActual: {
                      label: 'Lectura actual',
                      colors: {
                        light: ['#0f172a'],
                        dark: ['#e2e8f0']
                      }
                    }
                  }}
                  className="h-[360px] w-full p-4"
                  xDataKey="label"
                  showBrush={lecturasAnalytics.chartData.length > 6}
                  brushFormatLabel={value => String(value).substring(0, 6)}
                >
                  <Background variant="grid" />
                  <Grid />
                  <XAxis
                    dataKey="label"
                    tickFormatter={value => String(value)}
                  />
                  <YAxis
                    yAxisId="consumo"
                    tickFormatter={value => `${value}`}
                    width={48}
                  />
                  <YAxis
                    yAxisId="lectura"
                    orientation="right"
                    tickFormatter={value => `${value}`}
                    width={56}
                  />
                  <Line
                    yAxisId="consumo"
                    type="monotone"
                    dataKey={() => lecturasAnalytics.averageLine}
                    stroke="#f59e0b"
                    strokeDasharray="6 4"
                    dot={false}
                    activeDot={false}
                    name="Promedio"
                  />
                  <Line
                    yAxisId="consumo"
                    type="monotone"
                    dataKey={() => lecturasAnalytics.maxLine}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    dot={false}
                    activeDot={false}
                    name="Máximo"
                  />
                  <Tooltip />
                  <Legend isClickable variant="rounded-square" align="left" />
                  <Bar yAxisId="consumo" dataKey="consumo" name="Consumo" />
                  <Line
                    yAxisId="lectura"
                    type="monotone"
                    dataKey="lecturaActual"
                    isClickable
                    name="Lectura actual"
                  >
                    <ActiveDot variant="colored-border" />
                    <Dot variant="default" />
                  </Line>
                </EvilComposedChart>
              ) : (
                <EmptyState message="No hay lecturas disponibles para graficar." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen por período</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Fecha lectura</TableHead>
                    <TableHead className="text-right">Consumo</TableHead>
                    <TableHead className="text-right">Lectura actual</TableHead>
                    <TableHead className="text-right">Variación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lecturasAnalytics.tableRows.map(row => (
                    <TableRow
                      key={`${row.periodoLabel}-${row.fechaLecturaLabel}`}
                    >
                      <TableCell className="font-medium">
                        {row.periodoLabel}
                      </TableCell>
                      <TableCell>{row.fechaLecturaLabel}</TableCell>
                      <TableCell className="text-right">
                        {row.consumoLabel}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.lecturaActualLabel}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.variationLabel}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Último total"
              value={formatCurrency(facturasAnalytics.latestTotal)}
              description={`${facturasAnalytics.latestPeriodLabel} · Emisión ${facturasAnalytics.latestEmissionDateLabel}`}
              delta={facturasAnalytics.totalDelta}
            />
            <MetricCard
              title="Promedio"
              value={formatCurrency(facturasAnalytics.averageTotal)}
              description="Promedio facturado del historial visible"
            />
            <MetricCard
              title="Máximo"
              value={formatCurrency(facturasAnalytics.maxTotal)}
              description="Mayor factura del período visible"
            />
            <MetricCard
              title="Último consumo"
              value={formatVolume(
                facturasAnalytics.chartData.at(-1)?.consumo ?? 0
              )}
              description={`Último vencimiento ${facturasAnalytics.latestDueDateLabel}`}
              delta={facturasAnalytics.consumptionDelta}
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Evolución de facturas
                </CardTitle>
                <RangeSelector
                  value={facturasRange}
                  onChange={setFacturasRange}
                />
              </div>
            </CardHeader>
            <CardContent>
              {facturasAnalytics.chartData.length > 0 ? (
                <EvilComposedChart
                  data={facturasAnalytics.chartData}
                  config={{
                    total: {
                      label: 'Total factura',
                      colors: {
                        light: ['#059669'],
                        dark: ['#34d399']
                      }
                    },
                    consumo: {
                      label: 'Consumo',
                      colors: {
                        light: ['#7c3aed'],
                        dark: ['#c084fc']
                      }
                    }
                  }}
                  className="h-[360px] w-full p-4"
                  xDataKey="label"
                  showBrush={facturasAnalytics.chartData.length > 6}
                  brushFormatLabel={value => String(value).substring(0, 6)}
                >
                  <Background variant="dots" />
                  <Grid />
                  <XAxis
                    dataKey="label"
                    tickFormatter={value => String(value)}
                  />
                  <YAxis
                    yAxisId="monto"
                    tickFormatter={value => `$${value}`}
                    width={72}
                  />
                  <YAxis
                    yAxisId="consumo"
                    orientation="right"
                    tickFormatter={value => `${value}`}
                    width={56}
                  />
                  <Line
                    yAxisId="monto"
                    type="monotone"
                    dataKey={() => facturasAnalytics.averageLine}
                    stroke="#f59e0b"
                    strokeDasharray="6 4"
                    dot={false}
                    activeDot={false}
                    name="Promedio"
                  />
                  <Tooltip />
                  <Legend isClickable variant="rounded-square" align="left" />
                  <Bar
                    yAxisId="monto"
                    dataKey="total"
                    isClickable
                    name="Total factura"
                  />
                  <Line
                    yAxisId="consumo"
                    type="monotone"
                    dataKey="consumo"
                    isClickable
                    name="Consumo"
                  >
                    <ActiveDot variant="colored-border" />
                    <Dot variant="default" />
                  </Line>
                </EvilComposedChart>
              ) : (
                <EmptyState message="No hay facturas disponibles para graficar." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen por período</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Emisión</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Consumo</TableHead>
                    <TableHead className="text-right">Variación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturasAnalytics.tableRows.map(row => (
                    <TableRow
                      key={`${row.periodoLabel}-${row.fechaEmisionLabel}-${row.fechaVencimientoLabel}`}
                    >
                      <TableCell className="font-medium">
                        {row.periodoLabel}
                      </TableCell>
                      <TableCell>{row.fechaEmisionLabel}</TableCell>
                      <TableCell>{row.fechaVencimientoLabel}</TableCell>
                      <TableCell className="text-right">
                        {row.totalLabel}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.consumoLabel}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.variationLabel}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  delta
}: {
  title: string;
  value: string;
  description?: string;
  delta?: DeltaSummary | null;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
        {delta ? <DeltaIndicator delta={delta} /> : null}
      </CardContent>
    </Card>
  );
}

type DeltaSummary = {
  absolute: number;
  percentage: number | null;
  direction: 'up' | 'down' | 'stable';
};

function DeltaIndicator({ delta }: { delta: DeltaSummary }) {
  const Icon =
    delta.direction === 'up'
      ? TrendingUp
      : delta.direction === 'down'
        ? TrendingDown
        : CalendarRange;

  const toneClass =
    delta.direction === 'up'
      ? 'text-emerald-600'
      : delta.direction === 'down'
        ? 'text-rose-600'
        : 'text-muted-foreground';

  return (
    <div className={`mt-2 flex items-center gap-1.5 text-xs ${toneClass}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>
        {formatSignedValue(delta.absolute)}{' '}
        {delta.percentage !== null
          ? `(${formatSignedPercentage(delta.percentage)})`
          : '(sin base)'}
      </span>
    </div>
  );
}

function RangeSelector({
  value,
  onChange
}: {
  value: '6' | '12' | 'all';
  onChange: (value: '6' | '12' | 'all') => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
      <LayoutList className="mx-1 h-3.5 w-3.5 text-muted-foreground" />
      <RangeButton
        isActive={value === '6'}
        onClick={() => onChange('6')}
        label="6"
      />
      <RangeButton
        isActive={value === '12'}
        onClick={() => onChange('12')}
        label="12"
      />
      <RangeButton
        isActive={value === 'all'}
        onClick={() => onChange('all')}
        label="Todo"
      />
    </div>
  );
}

function RangeButton({
  isActive,
  onClick,
  label
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        isActive
          ? 'bg-background text-foreground shadow-xs'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function toNumber(value: string) {
  const parsed = Number(value?.trim?.() || '0');
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseApiDate(value: string) {
  const normalized = value?.trim();
  if (!normalized) return null;

  const [datePart] = normalized.split(' ');
  const [day, month, year] = datePart.split('/');
  if (!day || !month || !year) return null;

  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parsePeriodDate(periodo: string) {
  const normalized = periodo?.trim();
  if (!normalized || normalized.length !== 6) return null;

  const month = Number(normalized.slice(0, 2));
  const year = Number(normalized.slice(2));
  if (!month || !year) return null;

  const parsed = new Date(year, month - 1, 1);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatPeriodLabel(periodo: string) {
  const parsed = parsePeriodDate(periodo);
  if (!parsed) return periodo;

  return parsed.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric'
  });
}

function formatPeriodShortLabel(periodo: string) {
  const parsed = parsePeriodDate(periodo);
  if (!parsed) return periodo;

  return parsed.toLocaleDateString('es-CL', {
    month: 'short',
    year: '2-digit'
  });
}

function formatDateLabel(value: string) {
  const parsed = parseApiDate(value);
  if (!parsed) return 'N/A';

  return parsed.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

function formatVolume(value: number) {
  return `${value.toLocaleString('es-CL')} m³`;
}

function formatReading(value: number) {
  return value.toLocaleString('es-CL');
}

function buildDeltaSummary(
  current?: number,
  previous?: number
): DeltaSummary | null {
  if (current == null || previous == null) {
    return null;
  }

  const absolute = current - previous;
  const percentage = previous !== 0 ? (absolute / previous) * 100 : null;
  const direction = absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'stable';

  return {
    absolute,
    percentage,
    direction
  };
}

function sliceByRange<T>(data: T[], range: '6' | '12' | 'all') {
  if (range === 'all') return data;

  const size = Number(range);
  return data.slice(-size);
}

function formatSignedValue(value: number) {
  const formatted = Math.abs(value).toLocaleString('es-CL');
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function formatSignedPercentage(value: number) {
  const formatted = Math.abs(value).toFixed(1);
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `-${formatted}%`;
  return `${formatted}%`;
}

function formatDeltaLabel(delta: DeltaSummary | null) {
  if (!delta) return 'N/A';

  if (delta.percentage === null) {
    return `${formatSignedValue(delta.absolute)} (sin base)`;
  }

  return `${formatSignedValue(delta.absolute)} (${formatSignedPercentage(delta.percentage)})`;
}
