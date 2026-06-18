import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
  Zap,
  AlertTriangle,
  Calendar
} from 'lucide-react';

import { memo, useMemo, useState, useRef } from 'react';

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  ComposedChart,
  Line,
  ResponsiveContainer
} from 'recharts';

import { useVirtualizer } from '@tanstack/react-virtual';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState
} from '@tanstack/react-table';

import { ExportButton } from '~/components/shared/export-button';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '~/components/ui/card';
import { TooltipProvider } from '~/components/ui/tooltip';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Separator } from '~/components/ui/separator';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { useExportPDF, type PDFSection } from '~/hooks/shared/use-export-pdf';
import type { DetalleLecturas } from '~/types/reportes';

import { lecturasTableColumns } from './columns-lecturas';

interface LecturasAnalyticsSimpleProps {
  detalleLecturas: DetalleLecturas[];
  contratoId?: number;
}

const LecturasAnalyticsSimple = memo(function LecturasAnalyticsSimple({
  detalleLecturas,
  contratoId
}: LecturasAnalyticsSimpleProps) {
  const [timeRange, setTimeRange] = useState<
    '6m' | '1a' | '2a' | '5a' | 'todo'
  >('todo');
  const [showDataTable, setShowDataTable] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeChart, setActiveChart] = useState<
    'evolution' | 'comparison' | 'analysis'
  >('evolution');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { exportToPDF } = useExportPDF();

  // Columnas para exportación
  const lecturasColumns = useMemo(
    (): ExportColumn[] => [
      { key: 'periodo', header: 'Período' },
      { key: 'fechaLectura', header: 'Fecha Lectura' },
      { key: 'lecturaAnterior', header: 'Lectura Anterior' },
      { key: 'lecturaActual', header: 'Lectura Actual' },
      { key: 'consumoPeriodo', header: 'Consumo Período (kWh)' },
      { key: 'energiaBase', header: 'Energía Base (kWh)' },
      { key: 'sobreconsumo', header: 'Sobreconsumo (kWh)' }
    ],
    []
  );

  // Función para filtrar datos por rango de tiempo
  const filterByTimeRange = (lecturas: any[], range: string) => {
    if (range === 'todo') return lecturas;

    const now = new Date();
    const cutoffDate = new Date();

    switch (range) {
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1a':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case '2a':
        cutoffDate.setFullYear(now.getFullYear() - 2);
        break;
      case '5a':
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
      default:
        return lecturas;
    }

    return lecturas.filter(lectura => lectura.fecha >= cutoffDate.getTime());
  };

  // Función para calcular proyecciones futuras
  const calculatePredictions = (data: any[], months: number = 6) => {
    if (data.length < 2) return [];

    const n = data.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;

    data.forEach((item, index) => {
      const x = index;
      const y = item.consumo;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions = [];
    const lastRecordedDate = new Date(data[data.length - 1].fecha);

    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(lastRecordedDate);
      futureDate.setMonth(futureDate.getMonth() + i);

      const sameMonthData = data.filter(item => {
        const itemDate = new Date(item.fecha);
        return (
          itemDate.getMonth() === futureDate.getMonth() &&
          itemDate.getFullYear() !== futureDate.getFullYear()
        );
      });

      let predictedConsumption = Math.max(0, intercept + slope * (n + i - 1));

      if (sameMonthData.length > 0) {
        const sameMonthAverage =
          sameMonthData.reduce((sum, item) => sum + item.consumo, 0) /
          sameMonthData.length;
        predictedConsumption =
          predictedConsumption * 0.7 + sameMonthAverage * 0.3;
      }

      predictions.push({
        periodo: `Proyección ${futureDate.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })}`,
        fechaCorta: `${futureDate.toLocaleDateString('es-CL', { month: 'short' })}`,
        fechaCompleta: futureDate.toLocaleDateString('es-CL'),
        fecha: futureDate.getTime(),
        consumo: Math.round(predictedConsumption),
        isPrediction: true
      });
    }

    return predictions;
  };

  // Procesamiento de datos mejorado
  const analyticsData = useMemo(() => {
    if (detalleLecturas.length === 0) {
      return {
        maxConsumo: 0,
        minConsumo: 0,
        tendencia: 'stable' as const,
        lecturasProcesadas: [],
        filteredLecturas: [],
        promedioConsumo: 0,
        totalConsumo: 0,
        totalSobreconsumo: 0,
        promedioSobreconsumo: 0,
        periodosConSobreconsumo: 0,
        variacionPromedio: 0,
        dataWithPredictions: [],
        predictions: [],
        lecturasValidas: 0
      };
    }

    // Filtrar lecturas válidas (que tienen consumo registrado)
    const lecturasValidas = detalleLecturas.filter(
      lectura => lectura.consumoPeriodo != null && lectura.consumoPeriodo > 0
    );

    const lecturasProcesadas = lecturasValidas
      .map(lectura => {
        let fecha;
        let fechaCorta;
        let fechaCompleta;

        if (lectura.fechaLectura && lectura.fechaLectura !== '-') {
          if (
            typeof lectura.fechaLectura === 'string' &&
            lectura.fechaLectura.includes('/')
          ) {
            const [datePart] = lectura.fechaLectura.split(' ');
            const [day, month, year] = datePart.split('/');
            fecha = new Date(
              Number.parseInt(year),
              Number.parseInt(month) - 1,
              Number.parseInt(day)
            );
          } else {
            fecha = new Date(lectura.fechaLectura);
          }

          if (Number.isNaN(fecha.getTime())) {
            fecha = new Date();
            fechaCorta = lectura.periodo;
            fechaCompleta = lectura.periodo;
          } else {
            fechaCorta = fecha.toLocaleDateString('es-CL', {
              month: 'short',
              day: 'numeric'
            });
            fechaCompleta = fecha.toLocaleDateString('es-CL', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            });
          }
        } else {
          fecha = new Date();
          fechaCorta = lectura.periodo;
          fechaCompleta = lectura.periodo;
        }

        return {
          periodo: lectura.periodo,
          fechaCorta,
          fechaCompleta,
          fecha: fecha.getTime(),
          consumo: lectura.consumoPeriodo ?? 0,
          lecturaAnterior: lectura.lecturaAnterior ?? 0,
          lecturaActual: lectura.lecturaActual ?? 0,
          energiaBase: lectura.energiaBase ?? 0,
          sobreconsumo: lectura.sobreconsumo ?? 0
        };
      })
      .sort((a, b) => a.fecha - b.fecha);

    const filteredLecturas = filterByTimeRange(lecturasProcesadas, timeRange);

    const predictions = calculatePredictions(lecturasProcesadas, 6);
    const dataWithPredictions = [...filteredLecturas, ...predictions];

    const consumos = filteredLecturas.map(l => l.consumo);
    const maxConsumo = consumos.length > 0 ? Math.max(...consumos) : 0;
    const minConsumo = consumos.length > 0 ? Math.min(...consumos) : 0;
    const totalConsumo = consumos.reduce((sum, c) => sum + c, 0);
    const promedioConsumo =
      consumos.length > 0 ? totalConsumo / consumos.length : 0;

    const totalSobreconsumo = filteredLecturas.reduce(
      (sum, l) => sum + l.sobreconsumo,
      0
    );
    const periodosConSobreconsumo = filteredLecturas.filter(
      l => l.sobreconsumo > 0
    ).length;
    const promedioSobreconsumo =
      periodosConSobreconsumo > 0
        ? totalSobreconsumo / periodosConSobreconsumo
        : 0;

    // Calcular variación promedio entre períodos
    let variacionPromedio = 0;
    if (filteredLecturas.length > 1) {
      const variaciones = [];
      for (let i = 1; i < filteredLecturas.length; i++) {
        if (filteredLecturas[i - 1].consumo > 0) {
          const variacion =
            ((filteredLecturas[i].consumo - filteredLecturas[i - 1].consumo) /
              filteredLecturas[i - 1].consumo) *
            100;
          variaciones.push(variacion);
        }
      }
      if (variaciones.length > 0) {
        variacionPromedio =
          variaciones.reduce((sum, v) => sum + v, 0) / variaciones.length;
      }
    }

    const ultimos2 = filteredLecturas.slice(-2);
    const anteriores2 = filteredLecturas.slice(-4, -2);

    let tendencia: 'up' | 'down' | 'stable' = 'stable';
    if (ultimos2.length > 0 && anteriores2.length > 0) {
      const promedioUltimos =
        ultimos2.reduce((sum, l) => sum + l.consumo, 0) / ultimos2.length;
      const promedioAnteriores =
        anteriores2.reduce((sum, l) => sum + l.consumo, 0) / anteriores2.length;

      if (promedioUltimos > promedioAnteriores * 1.1) tendencia = 'up';
      else if (promedioUltimos < promedioAnteriores * 0.9) tendencia = 'down';
    }

    return {
      maxConsumo,
      minConsumo,
      tendencia,
      lecturasProcesadas,
      filteredLecturas,
      dataWithPredictions,
      predictions,
      promedioConsumo: Math.round(promedioConsumo),
      totalConsumo: Math.round(totalConsumo),
      totalSobreconsumo: Math.round(totalSobreconsumo),
      promedioSobreconsumo: Math.round(promedioSobreconsumo),
      periodosConSobreconsumo,
      variacionPromedio,
      lecturasValidas: lecturasValidas.length
    };
  }, [detalleLecturas, timeRange]);

  const chartConfig = {
    consumo: {
      label: 'Consumo (kWh)',
      color: '#3b82f6'
    },
    energiaBase: {
      label: 'Energía Base',
      color: '#10b981'
    },
    sobreconsumo: {
      label: 'Sobreconsumo',
      color: '#ef4444'
    },
    lecturaAnterior: {
      label: 'Lectura Anterior',
      color: '#8b5cf6'
    },
    lecturaActual: {
      label: 'Lectura Actual',
      color: '#f59e0b'
    }
  };

  // Table setup with react-table
  const table = useReactTable({
    data: detalleLecturas,
    columns: lecturasTableColumns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  // Virtualization setup
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50,
    overscan: 10
  });

  // Función para exportar a PDF
  const handlePDFExport = async () => {
    const sections: PDFSection[] = [
      // KPIs
      {
        title: 'Indicadores Principales',
        type: 'kpis',
        kpis: [
          {
            label: 'Total Consumo',
            value: `${analyticsData.totalConsumo.toLocaleString('es-CL')} kWh`
          },
          {
            label: 'Promedio Período',
            value: `${analyticsData.promedioConsumo.toLocaleString('es-CL')} kWh`
          },
          {
            label: 'Consumo Máximo',
            value: `${analyticsData.maxConsumo.toLocaleString('es-CL')} kWh`
          },
          {
            label: 'Consumo Mínimo',
            value: `${analyticsData.minConsumo.toLocaleString('es-CL')} kWh`
          },
          {
            label: 'Total Sobreconsumo',
            value: `${analyticsData.totalSobreconsumo.toLocaleString('es-CL')} kWh`
          },
          {
            label: 'Variación Promedio',
            value: `${analyticsData.variacionPromedio.toFixed(1)}%`
          }
        ]
      },
      // Tabla de lecturas
      {
        title: 'Detalle de Lecturas',
        type: 'table',
        data: analyticsData.filteredLecturas,
        columns: [
          { key: 'periodo', header: 'Período', width: 25 },
          { key: 'fechaCompleta', header: 'Fecha', width: 25 },
          {
            key: 'lecturaAnterior',
            header: 'Lect. Ant.',
            align: 'right',
            formatter: (val: number) => val.toLocaleString('es-CL')
          },
          {
            key: 'lecturaActual',
            header: 'Lect. Act.',
            align: 'right',
            formatter: (val: number) => val.toLocaleString('es-CL')
          },
          {
            key: 'consumo',
            header: 'Consumo',
            align: 'right',
            formatter: (val: number) => `${val.toLocaleString('es-CL')} kWh`
          },
          {
            key: 'sobreconsumo',
            header: 'Sobreconsumo',
            align: 'right',
            formatter: (val: number) => `${val.toLocaleString('es-CL')} kWh`
          }
        ]
      }
    ];

    await exportToPDF(sections, {
      title: `Análisis de Lecturas - Contrato ${contratoId}`,
      subtitle: `Período: ${timeRange === 'todo' ? 'Todo el historial' : timeRange}`,
      filename: `lecturas_contrato_${contratoId}`,
      orientation: 'landscape',
      companyInfo: {
        name: 'Sistema de Gestión Agualova',
        address: 'Reporte generado automáticamente',
        phone: ''
      }
    });
  };

  if (detalleLecturas.length === 0) {
    return (
      <Card className='border bg-background'>
        <CardContent className='pt-6 text-center'>
          <div className='text-slate-500'>
            No hay datos de lecturas disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className='space-y-6'>
        {/* Filtros de tiempo y exportación */}
        <Card className='border bg-background'>
          <CardContent className='pt-4'>
            <div className='flex flex-col sm:flex-row justify-between gap-4'>
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant={timeRange === '6m' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTimeRange('6m')}
                >
                  <Calendar className='h-3 w-3 mr-1' />6 meses
                </Button>
                <Button
                  variant={timeRange === '1a' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTimeRange('1a')}
                >
                  1 año
                </Button>
                <Button
                  variant={timeRange === '2a' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTimeRange('2a')}
                >
                  2 años
                </Button>
                <Button
                  variant={timeRange === '5a' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTimeRange('5a')}
                >
                  5 años
                </Button>
                <Button
                  variant={timeRange === 'todo' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTimeRange('todo')}
                >
                  Todo
                </Button>
              </div>
              <ExportButton
                data={detalleLecturas}
                columns={lecturasColumns}
                filename={`lecturas_contrato_${contratoId}`}
                size='sm'
                enablePDF={true}
                onPDFExport={handlePDFExport}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPIs mejorados en grid */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
          <Card className='border bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-blue-700 dark:text-blue-300'>
                    Consumo Total
                  </p>
                  <p className='text-xl font-bold text-blue-900 dark:text-blue-100'>
                    {analyticsData.totalConsumo.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-blue-600 dark:text-blue-400'>
                    kWh
                  </p>
                </div>
                <Zap className='h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                    Promedio Período
                  </p>
                  <p className='text-xl font-bold text-emerald-900 dark:text-emerald-100'>
                    {analyticsData.promedioConsumo.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-emerald-600 dark:text-emerald-400'>
                    kWh
                  </p>
                </div>
                <Activity className='h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-linear-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-rose-700 dark:text-rose-300'>
                    Máximo
                  </p>
                  <p className='text-xl font-bold text-rose-900 dark:text-rose-100'>
                    {analyticsData.maxConsumo.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-rose-600 dark:text-rose-400'>
                    kWh
                  </p>
                </div>
                <TrendingUp className='h-8 w-8 text-rose-600 dark:text-rose-400 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-linear-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-cyan-700 dark:text-cyan-300'>
                    Mínimo
                  </p>
                  <p className='text-xl font-bold text-cyan-900 dark:text-cyan-100'>
                    {analyticsData.minConsumo.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-cyan-600 dark:text-cyan-400'>
                    kWh
                  </p>
                </div>
                <TrendingDown className='h-8 w-8 text-cyan-600 dark:text-cyan-400 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-amber-700 dark:text-amber-300'>
                    Sobreconsumo
                  </p>
                  <p className='text-xl font-bold text-amber-900 dark:text-amber-100'>
                    {analyticsData.totalSobreconsumo.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-amber-600 dark:text-amber-400'>
                    {analyticsData.periodosConSobreconsumo} períodos
                  </p>
                </div>
                <AlertTriangle className='h-8 w-8 text-amber-600 dark:text-amber-400 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-slate-700 dark:text-slate-300'>
                    Tendencia
                  </p>
                  <Badge
                    variant={
                      analyticsData.tendencia === 'up'
                        ? 'destructive'
                        : analyticsData.tendencia === 'down'
                          ? 'default'
                          : 'secondary'
                    }
                    className='mt-2'
                  >
                    {analyticsData.tendencia === 'up' ? (
                      <>
                        <TrendingUp className='h-3 w-3 mr-1' />
                        Al alza
                      </>
                    ) : analyticsData.tendencia === 'down' ? (
                      <>
                        <TrendingDown className='h-3 w-3 mr-1' />A la baja
                      </>
                    ) : (
                      'Estable'
                    )}
                  </Badge>
                  <p className='text-xs text-slate-600 dark:text-slate-400 mt-1'>
                    {analyticsData.variacionPromedio > 0 ? '+' : ''}
                    {analyticsData.variacionPromedio.toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className='h-8 w-8 text-slate-600 dark:text-slate-400 opacity-50' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos con tabs */}
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base'>
              Análisis Visual de Consumo
            </CardTitle>
            <CardDescription>
              Visualiza tendencias y patrones en tus lecturas de energía
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeChart}
              onValueChange={v => setActiveChart(v as any)}
            >
              <TabsList className='grid w-full grid-cols-3 mb-4'>
                <TabsTrigger value='evolution'>Evolución Total</TabsTrigger>
                <TabsTrigger value='comparison'>
                  Base vs Sobreconsumo
                </TabsTrigger>
                <TabsTrigger value='analysis'>Lecturas Acumuladas</TabsTrigger>
              </TabsList>

              <TabsContent value='evolution' className='mt-0'>
                <ChartContainer
                  config={chartConfig}
                  className='h-[350px] w-full'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={analyticsData.filteredLecturas}>
                      <XAxis
                        dataKey='fechaCorta'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          if (item) {
                            return item.fechaCompleta !== item.periodo
                              ? `${item.periodo} (${item.fechaCompleta})`
                              : item.periodo;
                          }
                          return label;
                        }}
                        formatter={value => [
                          `${Number(value).toLocaleString('es-CL')} kWh`,
                          'Consumo'
                        ]}
                      />
                      <defs>
                        <linearGradient
                          id='colorConsumo'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='#3b82f6'
                            stopOpacity={0.3}
                          />
                          <stop
                            offset='95%'
                            stopColor='#3b82f6'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey='consumo'
                        fill='url(#colorConsumo)'
                        stroke='#3b82f6'
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>

              <TabsContent value='comparison' className='mt-0'>
                <ChartContainer
                  config={chartConfig}
                  className='h-[350px] w-full'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={analyticsData.filteredLecturas}>
                      <XAxis
                        dataKey='fechaCorta'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [
                          `${Number(value).toLocaleString('es-CL')} kWh`,
                          name === 'energiaBase'
                            ? 'Energía Base'
                            : 'Sobreconsumo'
                        ]}
                      />
                      <Bar
                        dataKey='energiaBase'
                        fill='#10b981'
                        stackId='energia'
                        radius={[0, 0, 4, 4]}
                        name='Energía Base'
                      />
                      <Bar
                        dataKey='sobreconsumo'
                        fill='#ef4444'
                        stackId='energia'
                        radius={[4, 4, 0, 0]}
                        name='Sobreconsumo'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>

              <TabsContent value='analysis' className='mt-0'>
                <ChartContainer
                  config={chartConfig}
                  className='h-[350px] w-full'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <ComposedChart data={analyticsData.filteredLecturas}>
                      <XAxis
                        dataKey='fechaCorta'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [
                          Number(value).toLocaleString('es-CL'),
                          name === 'lecturaActual'
                            ? 'Lectura Actual'
                            : 'Lectura Anterior'
                        ]}
                      />
                      <Line
                        type='monotone'
                        dataKey='lecturaAnterior'
                        stroke='#8b5cf6'
                        strokeWidth={1.5}
                        dot={{ r: 2 }}
                        name='Lectura Anterior'
                      />
                      <Line
                        type='monotone'
                        dataKey='lecturaActual'
                        stroke='#f59e0b'
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', r: 3 }}
                        name='Lectura Actual'
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Separator />

        {/* Tabla de datos colapsable */}
        <Card className='border bg-background'>
          <CardHeader
            className='flex flex-row items-center justify-between space-y-0 pb-4 cursor-pointer'
            onClick={() => setShowDataTable(!showDataTable)}
          >
            <CardTitle className='text-base flex items-center gap-2'>
              Historial Detallado de Lecturas ({detalleLecturas.length}{' '}
              registros - {analyticsData.lecturasValidas} con consumo)
              {showDataTable ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </CardTitle>
          </CardHeader>
          {showDataTable && (
            <CardContent>
              <div
                ref={tableContainerRef}
                className='relative rounded-md border overflow-auto'
                style={{ height: '500px' }}
              >
                <table className='w-full table-fixed caption-bottom text-sm'>
                  <TableHeader className='sticky top-0 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70 shadow-xs'>
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow
                        key={headerGroup.id}
                        className='hover:bg-transparent'
                      >
                        {headerGroup.headers.map(header => {
                          const columnDef = header.column.columnDef;
                          const width = columnDef.minSize || 120;
                          return (
                            <TableHead
                              key={header.id}
                              className='h-[50px] px-3 text-xs font-medium border-b border-border'
                              style={{
                                width: `${width}px`,
                                minWidth: `${width}px`,
                                maxWidth: `${columnDef.maxSize || width}px`
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      position: 'relative'
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                      const row = rows[virtualRow.index];
                      return (
                        <TableRow
                          key={row.id}
                          data-index={virtualRow.index}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '50px',
                            transform: `translateY(${virtualRow.start}px)`,
                            display: 'table'
                          }}
                          className='border-b hover:bg-muted'
                        >
                          {row.getVisibleCells().map(cell => {
                            const columnDef = cell.column.columnDef;
                            const width = columnDef.minSize || 120;
                            return (
                              <TableCell
                                key={cell.id}
                                className='h-[50px] px-3 py-1 text-sm'
                                style={{
                                  width: `${width}px`,
                                  minWidth: `${width}px`,
                                  maxWidth: `${columnDef.maxSize || width}px`
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </table>
                {rows.length === 0 && (
                  <div className='h-20 flex items-center justify-center text-sm text-muted-foreground'>
                    No se encontraron lecturas.
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
});

export default LecturasAnalyticsSimple;
