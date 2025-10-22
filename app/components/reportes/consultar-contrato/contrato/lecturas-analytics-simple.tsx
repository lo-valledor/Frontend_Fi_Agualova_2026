import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

import { memo, useMemo, useState, useRef } from 'react';

import { Area, AreaChart, XAxis, YAxis } from 'recharts';

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
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { TooltipProvider } from '~/components/ui/tooltip';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import type { ExportColumn } from '~/hooks/shared/use-export-data';
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
  const tableContainerRef = useRef<HTMLDivElement>(null);
  // Columnas para exportación
  const lecturasColumns = useMemo(
    (): ExportColumn[] => [
      { key: 'periodo', header: 'Período' },
      { key: 'fechaLectura', header: 'Fecha Lectura' },
      { key: 'lecturaAnterior', header: 'Lectura Anterior' },
      { key: 'lecturaActual', header: 'Lectura Actual' },
      { key: 'consumoPeriodo', header: 'Consumo Período' },
      { key: 'energiaBase', header: 'Energía Base' },
      { key: 'sobreconsumo', header: 'Sobreconsumo' }
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

    // Calcular tendencia usando regresión lineal simple
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

    // Generar predicciones futuras basadas en el último registro real
    const predictions = [];
    const lastRecordedDate = new Date(data[data.length - 1].fecha);

    for (let i = 1; i <= months; i++) {
      // Proyectar desde el último mes registrado, no desde el actual
      const futureDate = new Date(lastRecordedDate);
      futureDate.setMonth(futureDate.getMonth() + i);

      // Buscar datos históricos del mismo mes para ajustar predicción
      const sameMonthData = data.filter(item => {
        const itemDate = new Date(item.fecha);
        return (
          itemDate.getMonth() === futureDate.getMonth() &&
          itemDate.getFullYear() !== futureDate.getFullYear()
        );
      });

      let predictedConsumption = Math.max(0, intercept + slope * (n + i - 1));

      // Ajustar con promedio histórico del mismo mes si existe
      if (sameMonthData.length > 0) {
        const sameMonthAverage =
          sameMonthData.reduce((sum, item) => sum + item.consumo, 0) /
          sameMonthData.length;
        // Ponderar: 70% tendencia lineal + 30% promedio histórico del mes
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

  // Procesamiento de datos simplificado
  const analyticsData = useMemo(() => {
    if (detalleLecturas.length === 0) {
      return {
        maxConsumo: 0,
        minConsumo: 0,
        tendencia: 'stable' as const,
        lecturasProcesadas: [],
        filteredLecturas: [],
        promedioConsumo: 0
      };
    }

    // Procesar datos para gráficos con manejo correcto de fechas
    const lecturasProcesadas = detalleLecturas
      .map(lectura => {
        let fecha;
        let fechaCorta;
        let fechaCompleta;

        // Manejar diferentes formatos de fecha
        if (lectura.fechaLectura && lectura.fechaLectura !== '-') {
          // Si la fecha viene en formato "17/04/2025 15:44:00"
          if (
            typeof lectura.fechaLectura === 'string' &&
            lectura.fechaLectura.includes('/')
          ) {
            const [datePart] = lectura.fechaLectura.split(' ');
            const [day, month, year] = datePart.split('/');
            fecha = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            );
          } else {
            // Intentar parsing directo
            fecha = new Date(lectura.fechaLectura);
          }

          // Verificar si la fecha es válida
          if (isNaN(fecha.getTime())) {
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
          // Sin fecha válida, usar el período
          fecha = new Date();
          fechaCorta = lectura.periodo;
          fechaCompleta = lectura.periodo;
        }

        return {
          periodo: lectura.periodo,
          fechaCorta,
          fechaCompleta,
          fecha: fecha.getTime(), // Para ordenamiento
          consumo: lectura.consumoPeriodo || 0,
          lecturaAnterior: lectura.lecturaAnterior || 0,
          lecturaActual: lectura.lecturaActual || 0,
          energiaBase: lectura.energiaBase || 0,
          sobreconsumo: lectura.sobreconsumo || 0
        };
      })
      .sort((a, b) => a.fecha - b.fecha); // Ordenar por fecha

    // Filtrar por rango de tiempo
    const filteredLecturas = filterByTimeRange(lecturasProcesadas, timeRange);

    // Calcular predicciones basadas en TODOS los datos (independiente del filtro)
    const predictions = calculatePredictions(lecturasProcesadas, 6);
    const dataWithPredictions = [...filteredLecturas, ...predictions];

    const consumos = filteredLecturas.map(l => l.consumo);
    const maxConsumo = consumos.length > 0 ? Math.max(...consumos) : 0;
    const minConsumo = consumos.length > 0 ? Math.min(...consumos) : 0;
    const promedioConsumo =
      consumos.length > 0
        ? consumos.reduce((sum, c) => sum + c, 0) / consumos.length
        : 0;

    // Tendencia simple (usar datos filtrados)
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
      promedioConsumo: Math.round(promedioConsumo)
    };
  }, [detalleLecturas, timeRange]);

  const chartConfig = {
    consumo: {
      label: 'Consumo (kWh)',
      color: '#3b82f6' // azul
    },
    lecturaAnterior: {
      label: 'Lectura Anterior',
      color: '#10b981' // verde
    },
    lecturaActual: {
      label: 'Lectura Actual',
      color: '#8b5cf6' // violeta
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
        {/* Filtros de tiempo */}
        <Card className='border bg-background'>
          <CardContent className='pt-4'>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant={timeRange === '6m' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setTimeRange('6m')}
              >
                Últimos 6 meses
              </Button>
              <Button
                variant={timeRange === '1a' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setTimeRange('1a')}
              >
                Último año
              </Button>
              <Button
                variant={timeRange === '2a' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setTimeRange('2a')}
              >
                Últimos 2 años
              </Button>
              <Button
                variant={timeRange === '5a' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setTimeRange('5a')}
              >
                Últimos 5 años
              </Button>
              <Button
                variant={timeRange === 'todo' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setTimeRange('todo')}
              >
                Todo el historial
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs minimalistas */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card className='border bg-background'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Máximo</p>
                  <p className='text-2xl font-bold'>
                    {analyticsData.maxConsumo.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-muted-foreground'>kWh</p>
                </div>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-background'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Mínimo</p>
                  <p className='text-2xl font-bold'>
                    {analyticsData.minConsumo.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-muted-foreground'>kWh</p>
                </div>
                <TrendingDown className='h-4 w-4 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-background'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Promedio</p>
                  <p className='text-2xl font-bold'>
                    {analyticsData.promedioConsumo.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-muted-foreground'>kWh</p>
                </div>
                <Activity className='h-4 w-4 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-background'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Tendencia</p>
                  {(() => {
                    let badgeVariant: 'destructive' | 'default' | 'secondary';
                    let badgeText: string;
                    switch (analyticsData.tendencia) {
                      case 'up':
                        badgeVariant = 'destructive';
                        badgeText = 'Al alza';
                        break;
                      case 'down':
                        badgeVariant = 'default';
                        badgeText = 'A la baja';
                        break;
                      default:
                        badgeVariant = 'secondary';
                        badgeText = 'Estable';
                    }
                    return <Badge variant={badgeVariant}>{badgeText}</Badge>;
                  })()}
                </div>
                <BarChart3 className='h-4 w-4 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de evolución */}
        <div className='grid gap-6 lg:grid-cols-1'>
          {/* Evolución del Consumo */}
          <Card className='border bg-background'>
            <CardHeader>
              <CardTitle className='text-base'>Evolución del Consumo</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className='aspect-[4/3]'>
                <AreaChart data={analyticsData.filteredLecturas}>
                  <XAxis
                    dataKey='fechaCorta'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
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
                  />
                  <Area
                    dataKey='consumo'
                    fill='#3b82f6'
                    fillOpacity={0.2}
                    stroke='#3b82f6'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabla de datos colapsable */}
        <Card className='border bg-background'>
          <CardHeader
            className='flex flex-row items-center justify-between space-y-0 pb-4 cursor-pointer'
            onClick={() => setShowDataTable(!showDataTable)}
          >
            <CardTitle className='text-base flex items-center gap-2'>
              Historial de Lecturas ({detalleLecturas.length})
              {showDataTable ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </CardTitle>
            <ExportButton
              data={detalleLecturas}
              columns={lecturasColumns}
              filename={`lecturas_contrato_${contratoId}`}
              size='sm'
            />
          </CardHeader>
          {showDataTable && (
            <CardContent>
              <div
                ref={tableContainerRef}
                className='rounded-md border overflow-auto'
                style={{ height: '500px' }}
              >
                <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHeader className='sticky top-0 z-10 bg-background'>
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
                              className='h-10 px-3 text-xs font-medium'
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
                            display: 'table',
                            tableLayout: 'fixed'
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
                </Table>
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
