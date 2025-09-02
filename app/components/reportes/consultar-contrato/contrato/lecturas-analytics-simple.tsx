import {
  Activity,
  BarChart3,
  Info,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Separator } from '~/components/ui/separator';
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
  const [timeRange, setTimeRange] = useState<'6m' | '1a' | '2a' | '5a' | 'todo'>('todo');
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
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
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
    
    // Verificar si tenemos registros del mismo mes en años anteriores para mejorar predicción
    const lastMonth = lastRecordedDate.getMonth();
    const lastYear = lastRecordedDate.getFullYear();
    
    for (let i = 1; i <= months; i++) {
      // Proyectar desde el último mes registrado, no desde el actual
      const futureDate = new Date(lastRecordedDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      // Buscar datos históricos del mismo mes para ajustar predicción
      const sameMonthData = data.filter(item => {
        const itemDate = new Date(item.fecha);
        return itemDate.getMonth() === futureDate.getMonth() && itemDate.getFullYear() !== futureDate.getFullYear();
      });
      
      let predictedConsumption = Math.max(0, intercept + slope * (n + i - 1));
      
      // Ajustar con promedio histórico del mismo mes si existe
      if (sameMonthData.length > 0) {
        const sameMonthAverage = sameMonthData.reduce((sum, item) => sum + item.consumo, 0) / sameMonthData.length;
        // Ponderar: 70% tendencia lineal + 30% promedio histórico del mes
        predictedConsumption = (predictedConsumption * 0.7) + (sameMonthAverage * 0.3);
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
    const lecturasProcesadas = detalleLecturas.map((lectura) => {
      let fecha;
      let fechaCorta;
      let fechaCompleta;

      // Manejar diferentes formatos de fecha
      if (lectura.fechaLectura && lectura.fechaLectura !== '-') {
        // Si la fecha viene en formato "17/04/2025 15:44:00"
        if (typeof lectura.fechaLectura === 'string' && lectura.fechaLectura.includes('/')) {
          const [datePart] = lectura.fechaLectura.split(' ');
          const [day, month, year] = datePart.split('/');
          fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
    }).sort((a, b) => a.fecha - b.fecha); // Ordenar por fecha

    // Filtrar por rango de tiempo
    const filteredLecturas = filterByTimeRange(lecturasProcesadas, timeRange);

    // Calcular predicciones basadas en los datos filtrados
    const predictions = calculatePredictions(filteredLecturas, 6);
    const dataWithPredictions = [...filteredLecturas, ...predictions];

    const consumos = filteredLecturas.map(l => l.consumo);
    const maxConsumo = consumos.length > 0 ? Math.max(...consumos) : 0;
    const minConsumo = consumos.length > 0 ? Math.min(...consumos) : 0;
    const promedioConsumo = consumos.length > 0 ? consumos.reduce((sum, c) => sum + c, 0) / consumos.length : 0;

    // Tendencia simple (usar datos filtrados)
    const ultimos2 = filteredLecturas.slice(-2);
    const anteriores2 = filteredLecturas.slice(-4, -2);
    
    let tendencia: 'up' | 'down' | 'stable' = 'stable';
    if (ultimos2.length > 0 && anteriores2.length > 0) {
      const promedioUltimos = ultimos2.reduce((sum, l) => sum + l.consumo, 0) / ultimos2.length;
      const promedioAnteriores = anteriores2.reduce((sum, l) => sum + l.consumo, 0) / anteriores2.length;
      
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

  if (detalleLecturas.length === 0) {
    return (
      <Card className='border bg-white dark:bg-slate-900'>
        <CardContent className='pt-6 text-center'>
          <div className='text-slate-500'>No hay datos de lecturas disponibles</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className='space-y-6'>
        {/* Filtros de tiempo */}
      <Card className='border bg-white dark:bg-slate-900'>
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
        <Card className='border bg-white dark:bg-slate-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Máximo</p>
                <p className='text-2xl font-bold'>{analyticsData.maxConsumo.toLocaleString('es-CL')}</p>
                <p className='text-xs text-muted-foreground'>kWh</p>
              </div>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card className='border bg-white dark:bg-slate-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Mínimo</p>
                <p className='text-2xl font-bold'>{analyticsData.minConsumo.toLocaleString('es-CL')}</p>
                <p className='text-xs text-muted-foreground'>kWh</p>
              </div>
              <TrendingDown className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card className='border bg-white dark:bg-slate-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Promedio</p>
                <p className='text-2xl font-bold'>{analyticsData.promedioConsumo.toLocaleString('es-CL')}</p>
                <p className='text-xs text-muted-foreground'>kWh</p>
              </div>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card className='border bg-white dark:bg-slate-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Tendencia</p>
                <Badge variant={
                  analyticsData.tendencia === 'up' ? 'destructive' :
                  analyticsData.tendencia === 'down' ? 'default' : 'secondary'
                }>
                  {analyticsData.tendencia === 'up' ? 'Al alza' :
                   analyticsData.tendencia === 'down' ? 'A la baja' : 'Estable'}
                </Badge>
              </div>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos simples */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Evolución del Consumo */}
        <Card className='border bg-white dark:bg-slate-900'>
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

        {/* Proyección de Consumo Futuro */}
        <Card className='border bg-white dark:bg-slate-900'>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              Proyección de Consumo (6 meses)
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-4 w-4 text-muted-foreground cursor-help' />
                </TooltipTrigger>
                <TooltipContent className='max-w-xs p-3'>
                  <div className='space-y-2 text-sm'>
                    <p className='font-semibold'>¿Cómo funciona la proyección?</p>
                    <div className='space-y-1'>
                      <p><strong>• Análisis de tendencia:</strong> Calcula la dirección del consumo usando datos históricos (70%)</p>
                      <p><strong>• Patrón estacional:</strong> Considera el promedio histórico del mismo mes (30%)</p>
                      <p><strong>• Proyección desde:</strong> Último mes con datos registrados reales</p>
                    </div>
                    <p className='text-xs text-muted-foreground'>Las estimaciones son aproximadas y pueden variar según cambios en el uso energético.</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='aspect-[4/3]'>
              <LineChart data={analyticsData.dataWithPredictions}>
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
                      return item.isPrediction 
                        ? `${item.periodo} (Proyección)` 
                        : item.fechaCompleta !== item.periodo 
                          ? `${item.periodo} (${item.fechaCompleta})` 
                          : item.periodo;
                    }
                    return label;
                  }}
                  formatter={(value, name, props) => {
                    const isPred = props.payload?.isPrediction;
                    const prefix = isPred ? '~' : '';
                    const suffix = isPred ? ' (estimado)' : '';
                    return [
                      `${prefix}${Number(value).toLocaleString('es-CL')} kWh${suffix}`,
                      isPred ? 'Consumo Proyectado' : 'Consumo Real'
                    ];
                  }}
                />
                {/* Línea de datos reales */}
                <Line
                  dataKey={(item: any) => !item.isPrediction ? item.consumo : null}
                  stroke='#3b82f6'
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  connectNulls={false}
                />
                {/* Línea de predicciones */}
                <Line
                  dataKey={(item: any) => item.isPrediction ? item.consumo : null}
                  stroke='#f59e0b'
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f59e0b' }}
                  strokeDasharray="8 4"
                  connectNulls={false}
                />
              </LineChart>
            </ChartContainer>
            <div className='mt-3 flex items-center gap-4 text-xs text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <div className='w-3 h-0.5 bg-blue-500'></div>
                <span>Datos reales</span>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-3 h-0.5 bg-orange-500 opacity-70' style={{borderTop: '2px dashed #f59e0b'}}></div>
                <span>Proyección</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tabla de datos */}
      <Card className='border bg-white dark:bg-slate-900'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <CardTitle className='text-base'>
            Historial de Lecturas ({detalleLecturas.length})
          </CardTitle>
          <ExportButton
            data={detalleLecturas}
            columns={lecturasColumns}
            filename={`lecturas_contrato_${contratoId}`}
            size='sm'
          />
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <DataTable
              columns={lecturasTableColumns}
              data={detalleLecturas}
              showSearch={false}
              defaultPageSize={10}
            />
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
});

export default LecturasAnalyticsSimple;