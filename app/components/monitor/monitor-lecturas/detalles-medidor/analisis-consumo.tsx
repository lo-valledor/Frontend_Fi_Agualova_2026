import {
  AlertCircle,
  BarChart3,
  Calendar,
  Gauge,
  History,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { useEffect, useMemo, useState } from 'react';

import { chartConfig } from '~/components/chart-config';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '~/components/ui/chart';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '~/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import api from '~/lib/api';
import type {
  CompararConsumoMedidor,
  EtapaCuatro,
  EtapaDos,
  EtapaUno
} from '~/types/monitor';

interface AnalisisConsumoProps {
  dataEtapaUno: EtapaUno[];
  dataEtapaDos: EtapaDos[];
  dataEtapaCuatro: EtapaCuatro[];
  error?: string;
}

type PeriodoTiempo = 'todo' | '6meses' | '3meses';

export default function AnalisisConsumo({
  dataEtapaUno,
  dataEtapaDos,
  dataEtapaCuatro,
  error
}: AnalisisConsumoProps) {
  const [periodoSeleccionado, setPeriodoSeleccionado] =
    useState<PeriodoTiempo>('todo');
  const [datosComparacion, setDatosComparacion] = useState<
    CompararConsumoMedidor[]
  >([]);

  // Estados para modals de gráficas
  const [showLineChart, setShowLineChart] = useState(false);
  const [showBarChart, setShowBarChart] = useState(false);
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  useEffect(() => {
    const getComparacionData = async (
      numeroSerie: string,
      periodoActual: string
    ) => {
      try {
        const response = await api.post('/comparar-consumo-medidor', {
          numeroSerie,
          periodoActual
        });
        setDatosComparacion(response.data as CompararConsumoMedidor[]);
      } catch (e) {
        console.error(e);
        setDatosComparacion([]);
      }
    };

    if (
      dataEtapaUno.length > 0 &&
      dataEtapaUno[0].ME_NSerie &&
      dataEtapaDos.length > 0 &&
      dataEtapaDos[0].LM_Periodo
    ) {
      getComparacionData(dataEtapaUno[0].ME_NSerie, dataEtapaDos[0].LM_Periodo);
    }
  }, [dataEtapaUno, dataEtapaDos]);

  // Funciones de ayuda (movidas desde el componente padre)
  const getMonthNumber = (periodo: string): number => {
    return parseInt(periodo.substring(0, 2), 10);
  };
  const getYear = (periodo: string): number => {
    return parseInt(periodo.substring(2), 10);
  };
  const getMonthName = (monthNumber: number): string => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];
    return months[monthNumber - 1];
  };

  const getDatosFiltrados = (datos: EtapaCuatro[]) => {
    // Filtrar datos inválidos (fechas 31-12-1969, consumos 0, etc.)
    const datosValidos = datos.filter(item => {
      const fecha = new Date(item.LM_FechaLectura);
      const esFechaValida = fecha.getFullYear() > 1970; // Filtrar fechas como 31-12-1969
      const esConsumoValido =
        item.LM_ConsumoPeriodo !== null &&
        item.LM_ConsumoPeriodo !== undefined &&
        item.LM_ConsumoPeriodo > 0;
      return esFechaValida && esConsumoValido;
    });

    if (periodoSeleccionado === 'todo') {
      return datosValidos;
    }

    const datosOrdenados = [...datosValidos].sort((a, b) => {
      const fechaA = new Date(
        getYear(a.LM_Periodo),
        getMonthNumber(a.LM_Periodo) - 1,
        1
      );
      const fechaB = new Date(
        getYear(b.LM_Periodo),
        getMonthNumber(b.LM_Periodo) - 1,
        1
      );
      return fechaB.getTime() - fechaA.getTime();
    });
    const mesesAMostrar = periodoSeleccionado === '6meses' ? 6 : 3;
    return datosOrdenados.slice(0, mesesAMostrar);
  };

  // Función para verificar si hay datos válidos
  const tieneDatosValidos = (datos: EtapaCuatro[]) => {
    return datos.some(item => {
      const fecha = new Date(item.LM_FechaLectura);
      const esFechaValida = fecha.getFullYear() > 1970;
      const esConsumoValido =
        item.LM_ConsumoPeriodo !== null &&
        item.LM_ConsumoPeriodo !== undefined &&
        item.LM_ConsumoPeriodo > 0;
      return esFechaValida && esConsumoValido;
    });
  };

  const getEstadisticasConsumo = useMemo(() => {
    return (datos: EtapaCuatro[]) => {
      if (datos.length === 0) return null;

      // Filtrar datos válidos para estadísticas
      const datosValidos = datos.filter(item => {
        const fecha = new Date(item.LM_FechaLectura);
        const esFechaValida = fecha.getFullYear() > 1970;
        const esConsumoValido =
          item.LM_ConsumoPeriodo !== null &&
          item.LM_ConsumoPeriodo !== undefined &&
          item.LM_ConsumoPeriodo > 0;
        return esFechaValida && esConsumoValido;
      });

      if (datosValidos.length === 0) return null;

      const consumos = datosValidos.map(item => item.LM_ConsumoPeriodo);
      if (consumos.length === 0) return null;
      const consumoTotal = consumos.reduce((sum, consumo) => sum + consumo, 0);
      const consumoPromedio = consumoTotal / consumos.length;
      const consumoMaximo = Math.max(...consumos);
      const consumoMinimo = Math.min(...consumos);

      const periodoMaximo =
        datosValidos.find(item => item.LM_ConsumoPeriodo === consumoMaximo)
          ?.LM_Periodo || '';
      const periodoMinimo =
        datosValidos.find(item => item.LM_ConsumoPeriodo === consumoMinimo)
          ?.LM_Periodo || '';
      const ultimoPeriodo =
        datosValidos[datosValidos.length - 1]?.LM_Periodo || '';

      return {
        consumoTotal,
        consumoPromedio,
        consumoMaximo,
        consumoMinimo,
        periodoMaximo,
        periodoMinimo,
        ultimoPeriodo,
        totalPeriodos: consumos.length
      };
    };
  }, []);

  const estadisticas = getEstadisticasConsumo(dataEtapaCuatro);

  const getMensualComparisonData = useMemo(() => {
    if (!datosComparacion || datosComparacion.length === 0) return [];

    const groupedByMonth: Record<
      string,
      { consumoActual: number | null; consumoAnterior: number | null }
    > = {};

    datosComparacion.forEach(item => {
      const month = getMonthNumber(item.lM_Periodo);
      const monthName = getMonthName(month);

      if (!groupedByMonth[monthName]) {
        groupedByMonth[monthName] = {
          consumoActual: null,
          consumoAnterior: null
        };
      }

      if (item.tipoPeriodo === 'PeriodoActual') {
        groupedByMonth[monthName].consumoActual = item.lM_ConsumoPeriodo;
      } else if (item.tipoPeriodo === 'PeriodoAnterior') {
        groupedByMonth[monthName].consumoAnterior = item.lM_ConsumoPeriodo;
      }
    });

    return Object.entries(groupedByMonth).map(([mes, consumos]) => ({
      mes,
      ...consumos
    }));
  }, [datosComparacion]);

  const datosValidos = dataEtapaCuatro.filter(item => {
    const fecha = new Date(item.LM_FechaLectura);
    const esFechaValida = fecha.getFullYear() > 1970;
    const esConsumoValido =
      item.LM_ConsumoPeriodo !== null &&
      item.LM_ConsumoPeriodo !== undefined &&
      item.LM_ConsumoPeriodo > 0;
    return esFechaValida && esConsumoValido;
  });

  // Ordenar de menor a mayor periodo (más antiguo a más reciente)
  const datosValidosOrdenados = [...datosValidos].sort((a, b) => {
    const periodoA =
      parseInt(a.LM_Periodo.slice(2)) * 100 +
      parseInt(a.LM_Periodo.slice(0, 2));
    const periodoB =
      parseInt(b.LM_Periodo.slice(2)) * 100 +
      parseInt(b.LM_Periodo.slice(0, 2));
    return periodoA - periodoB;
  });

  // Último consumo registrado (más reciente)
  let ultimoConsumo = 0;
  let periodoUltimoConsumo = '';
  if (datosValidosOrdenados.length > 0) {
    ultimoConsumo =
      datosValidosOrdenados[datosValidosOrdenados.length - 1]
        ?.LM_ConsumoPeriodo || 0;
    periodoUltimoConsumo =
      datosValidosOrdenados[datosValidosOrdenados.length - 1]?.LM_Periodo;
  }

  // Mes anterior
  let consumoMesAnterior = null;
  let periodoMesAnterior = '';
  let variacionMesAnterior = null;
  if (datosValidosOrdenados.length >= 2) {
    consumoMesAnterior =
      datosValidosOrdenados[datosValidosOrdenados.length - 2]
        ?.LM_ConsumoPeriodo;
    periodoMesAnterior =
      datosValidosOrdenados[datosValidosOrdenados.length - 2]?.LM_Periodo;
    if (
      consumoMesAnterior !== null &&
      consumoMesAnterior !== undefined &&
      consumoMesAnterior !== 0
    ) {
      variacionMesAnterior =
        ((ultimoConsumo - consumoMesAnterior) / consumoMesAnterior) * 100;
    }
  }

  // Componente para mostrar métricas clave en móviles
  const MetricCard = ({
    icon,
    label,
    value,
    unit,
    period,
    trend,
    color = 'blue',
    trendMessage
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    unit?: string;
    period?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
    trendMessage?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 ',
      green:
        'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
      amber:
        'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
      purple:
        'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
      red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
    };

    return (
      <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-2'>
            {icon}
            <span className='text-xs font-medium uppercase tracking-wide'>
              {label}
            </span>
          </div>
          {trend && (
            <div className='flex items-center'>
              {trend === 'up' && <TrendingUp className='h-3 w-3' />}
              {trend === 'down' && <TrendingDown className='h-3 w-3' />}
            </div>
          )}
        </div>
        <div className='space-y-1'>
          <p className='text-2xl sm:text-3xl font-bold text-foreground'>
            {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
            {unit && <span className='text-sm font-normal ml-1'>{unit}</span>}
          </p>
          {period && <p className='text-xs opacity-70'>{period}</p>}
          {trendMessage && (
            <p className='text-xs opacity-80 pt-1 border-t border-current/10 mt-2'>
              {trendMessage}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Componente para historial simplificado
  const HistoryCard = ({ item }: { item: EtapaCuatro; index: number }) => (
    <div className='p-3 bg-muted/30 rounded-xl border border-border/20'>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-3 w-3 ' />
          <span className='font-mono text-sm font-medium'>
            {item.LM_Periodo}
          </span>
        </div>
        <span className='text-xs text-muted-foreground'>
          {new Date(item.LM_FechaLectura).toLocaleDateString('es-CL')}
        </span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-muted-foreground'>Consumo:</span>
        <span className='font-semibold text-foreground'>
          {item.LM_ConsumoPeriodo?.toLocaleString('es-CL')} kWh
        </span>
      </div>
      {item.LM_ValorLecturaActual && (
        <div className='flex items-center justify-between mt-1'>
          <span className='text-xs text-muted-foreground'>Lectura:</span>
          <span className='text-xs font-mono text-muted-foreground'>
            {item.LM_ValorLecturaActual.toLocaleString('es-CL')}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Card className='border-0 shadow-none bg-transparent'>
      <CardHeader className='px-0 pb-2'>
        <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
          <div className='h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
            <TrendingUp className='h-3 w-3 ' />
          </div>
          <span>Análisis de Consumo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-0 space-y-3'>
        {error ? (
          <div className='flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800'>
            <AlertCircle className='h-3 w-3 mt-0.5 flex-shrink-0' />
            <span>{error}</span>
          </div>
        ) : !tieneDatosValidos(dataEtapaCuatro) ? (
          <div className='flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800'>
            <AlertCircle className='h-3 w-3 mt-0.5 flex-shrink-0' />
            <span>
              No se encontraron datos válidos de consumo para este medidor. Esto
              puede deberse a que el medidor es nuevo o no tiene lecturas
              registradas aún.
            </span>
          </div>
        ) : (
          <Tabs defaultValue='resumen' className='w-full'>
            {/* Tabs simplificadas para mobile */}
            <TabsList className='w-full justify-start bg-muted/30 p-1 h-auto'>
              <TabsTrigger
                value='resumen'
                className='flex items-center gap-1.5 px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm'
              >
                <Gauge className='h-3 w-3' />
                <span className='hidden xs:inline'>Resumen</span>
              </TabsTrigger>
              <TabsTrigger
                value='historico'
                className='flex items-center gap-1.5 px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm'
              >
                <History className='h-3 w-3' />
                <span className='hidden xs:inline'>Histórico</span>
              </TabsTrigger>
              <TabsTrigger
                value='tendencias'
                className='flex items-center gap-1.5 px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm'
              >
                <BarChart3 className='h-3 w-3' />
                <span className='hidden xs:inline'>Tendencias</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='resumen' className='pt-3'>
              <div className='space-y-3'>
                {!estadisticas ? (
                  <div className='p-6 text-center'>
                    <div className='text-4xl mb-3'>📊</div>
                    <p className='text-sm font-medium text-foreground mb-1'>
                      No hay datos suficientes
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Se requieren lecturas válidas con fechas y consumos
                      mayores a 0
                    </p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <MetricCard
                      icon={<Gauge className='h-4 w-4' />}
                      label='Consumo Promedio'
                      value={Math.round(estadisticas.consumoPromedio)}
                      unit='kWh'
                      color='blue'
                    />
                    <MetricCard
                      icon={<TrendingUp className='h-4 w-4' />}
                      label='Consumo Máximo'
                      value={estadisticas.consumoMaximo}
                      unit='kWh'
                      period={estadisticas.periodoMaximo}
                      color='green'
                    />
                    <MetricCard
                      icon={<TrendingDown className='h-4 w-4' />}
                      label='Consumo Mínimo'
                      value={estadisticas.consumoMinimo}
                      unit='kWh'
                      period={estadisticas.periodoMinimo}
                      color='amber'
                    />
                    <MetricCard
                      icon={<Zap className='h-4 w-4' />}
                      label='Último Consumo'
                      value={ultimoConsumo}
                      unit='kWh'
                      period={periodoUltimoConsumo}
                      trend={
                        variacionMesAnterior
                          ? variacionMesAnterior > 0
                            ? 'up'
                            : 'down'
                          : 'neutral'
                      }
                      color={
                        variacionMesAnterior
                          ? variacionMesAnterior > 0
                            ? 'red'
                            : 'green'
                          : 'purple'
                      }
                      trendMessage={
                        variacionMesAnterior
                          ? variacionMesAnterior > 0
                            ? `Consumo ${Math.abs(variacionMesAnterior).toFixed(1)}% mayor que el mes anterior`
                            : `Consumo ${Math.abs(variacionMesAnterior).toFixed(1)}% menor que el mes anterior`
                          : undefined
                      }
                    />
                  </div>
                )}

                {/* Información adicional compacta */}
                {estadisticas && (
                  <div className='p-3 bg-muted/30 rounded-xl border border-border/20'>
                    <h4 className='text-sm font-medium text-foreground mb-2'>
                      Resumen Estadístico
                    </h4>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Total:</span>
                        <span className='font-medium'>
                          {estadisticas.consumoTotal.toLocaleString('es-CL')}{' '}
                          kWh
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Períodos:</span>
                        <span className='font-medium'>
                          {estadisticas.totalPeriodos}
                        </span>
                      </div>
                      {variacionMesAnterior !== null && (
                        <div className='flex justify-between col-span-2'>
                          <span className='text-muted-foreground'>
                            Variación:
                          </span>
                          <span
                            className={`font-medium ${
                              variacionMesAnterior > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}
                          >
                            {variacionMesAnterior > 0 ? '+' : ''}
                            {variacionMesAnterior.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botones para ver gráficas - Solo en móviles */}
                <div className='md:hidden space-y-2'>
                  <div className='text-xs text-muted-foreground mb-2'>
                    Ver análisis detallado:
                  </div>
                  <div className='grid grid-cols-1 gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowLineChart(true)}
                      className='w-full justify-start h-10'
                    >
                      <TrendingUp className='h-4 w-4 mr-2' />
                      Evolución de Consumo
                    </Button>
                    {getMensualComparisonData.length > 0 && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setShowBarChart(true)}
                        className='w-full justify-start h-10'
                      >
                        <BarChart3 className='h-4 w-4 mr-2' />
                        Comparativa Anual
                      </Button>
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowHistoryTable(true)}
                      className='w-full justify-start h-10'
                    >
                      <History className='h-4 w-4 mr-2' />
                      Tabla Histórica
                    </Button>
                  </div>
                </div>

                {/* Gráficas integradas - Solo en desktop */}
                <div className='hidden md:block space-y-6'>
                  {/* Gráfico de evolución */}
                  <div className='bg-background/95 rounded-xl border border-border/40 overflow-hidden'>
                    <div className='p-4 border-b border-border/40'>
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                        <div>
                          <h3 className='text-base font-semibold text-foreground'>
                            Evolución de Consumo
                          </h3>
                          <p className='text-sm text-muted-foreground mt-1'>
                            Tendencia del consumo energético a lo largo del
                            tiempo
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          <Tabs
                            defaultValue='todo'
                            value={periodoSeleccionado}
                            onValueChange={value =>
                              setPeriodoSeleccionado(value as PeriodoTiempo)
                            }
                          >
                            <TabsList className='bg-muted/50'>
                              <TabsTrigger value='todo' className='text-xs'>
                                Todo
                              </TabsTrigger>
                              <TabsTrigger value='6meses' className='text-xs'>
                                6M
                              </TabsTrigger>
                              <TabsTrigger value='3meses' className='text-xs'>
                                3M
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </div>
                    </div>
                    <div className='p-4'>
                      <ChartContainer
                        config={chartConfig}
                        className='min-h-[320px] w-full'
                      >
                        <LineChart
                          data={[
                            ...getDatosFiltrados(dataEtapaCuatro)
                          ].reverse()}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 20
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray='3 3'
                            vertical={false}
                            className='stroke-border/50'
                          />
                          <XAxis
                            dataKey='LM_Periodo'
                            tickLine={false}
                            tickMargin={12}
                            axisLine={false}
                            tick={{
                              fill: 'var(--color-detallesMedidor)',
                              fontSize: 11
                            }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{
                              fill: 'var(--color-detallesMedidor)',
                              fontSize: 11
                            }}
                          />
                          <Tooltip
                            content={
                              <ChartTooltipContent
                                labelFormatter={value => `Periodo: ${value}`}
                                formatter={value => [`${value} kWh`, 'Consumo']}
                              />
                            }
                          />
                          <Line
                            type='monotone'
                            dataKey='LM_ConsumoPeriodo'
                            stroke='var(--color-detallesMedidor)'
                            strokeWidth={3}
                            dot={{
                              fill: 'var(--color-detallesMedidor)',
                              strokeWidth: 2,
                              stroke: '#fff',
                              r: 4
                            }}
                            activeDot={{
                              r: 6,
                              fill: 'var(--color-detallesMedidor)',
                              stroke: '#fff',
                              strokeWidth: 2
                            }}
                          />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  </div>

                  {/* Gráfico de barras comparativo - Solo si hay datos */}
                  {getMensualComparisonData.filter(
                    item =>
                      item.consumoActual !== null &&
                      item.consumoAnterior !== null
                  ).length > 0 && (
                    <div className='bg-background/95 rounded-xl border border-border/40 overflow-hidden'>
                      <div className='p-4 border-b border-border/40'>
                        <h3 className='text-base font-semibold text-foreground'>
                          Comparativa Mensual por Años
                        </h3>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Comparación de consumos del mismo mes en diferentes
                          años
                        </p>
                      </div>
                      <div className='p-4'>
                        <ChartContainer
                          config={chartConfig}
                          className='min-h-[300px] w-full'
                        >
                          <BarChart
                            data={getMensualComparisonData.filter(
                              item =>
                                item.consumoActual !== null &&
                                item.consumoAnterior !== null
                            )}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 50
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray='3 3'
                              vertical={false}
                              className='stroke-border/50'
                            />
                            <XAxis
                              dataKey='mes'
                              tickLine={false}
                              tickMargin={12}
                              axisLine={false}
                              tick={{
                                fill: 'var(--color-detallesMedidor)',
                                fontSize: 12
                              }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{
                                fill: 'var(--color-detallesMedidor)',
                                fontSize: 12
                              }}
                            />
                            <Tooltip
                              content={
                                <ChartTooltipContent
                                  labelFormatter={value => `Mes: ${value}`}
                                />
                              }
                            />
                            <Legend
                              verticalAlign='top'
                              height={36}
                              wrapperStyle={{ paddingBottom: '10px' }}
                            />
                            <Bar
                              name='Año Anterior'
                              dataKey='consumoAnterior'
                              fill='#f97316'
                              radius={[4, 4, 0, 0]}
                              barSize={60}
                            />
                            <Bar
                              name='Año Actual'
                              dataKey='consumoActual'
                              fill='#3b82f6'
                              radius={[4, 4, 0, 0]}
                              barSize={60}
                            />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='historico' className='pt-3'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='text-xs text-muted-foreground'>
                    Últimas {Math.min(datosValidosOrdenados.length, 10)}{' '}
                    lecturas registradas
                  </div>
                  {/* Botón para ver tabla completa - Solo móviles */}
                  <div className='md:hidden'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowHistoryTable(true)}
                      className='h-7 px-2 text-xs'
                    >
                      <History className='h-3 w-3 mr-1' />
                      Ver Todo
                    </Button>
                  </div>
                </div>
                {getDatosFiltrados(dataEtapaCuatro)
                  .slice(-10)
                  .reverse()
                  .map((item, index) => (
                    <HistoryCard key={index} item={item} index={index} />
                  ))}

                {/* Tabla completa - Solo desktop */}
                <div className='hidden md:block mt-6'>
                  <div className='bg-background/95 rounded-xl border border-border/40 overflow-hidden'>
                    <div className='p-4 border-b border-border/40'>
                      <h3 className='text-base font-semibold text-foreground'>
                        Historial Completo de Consumos
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Registro detallado de todas las lecturas válidas
                      </p>
                    </div>
                    <div className='overflow-auto max-h-[400px]'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='text-xs'>Período</TableHead>
                            <TableHead className='text-xs'>
                              Fecha Lectura
                            </TableHead>
                            <TableHead className='text-xs text-right'>
                              Consumo (kWh)
                            </TableHead>
                            <TableHead className='text-xs text-right'>
                              Lectura Actual
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosValidosOrdenados
                            .reverse()
                            .map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className='font-mono text-xs font-semibold'>
                                  {item.LM_Periodo}
                                </TableCell>
                                <TableCell className='text-xs'>
                                  {new Date(
                                    item.LM_FechaLectura
                                  ).toLocaleDateString('es-CL')}
                                </TableCell>
                                <TableCell className='text-xs text-right font-semibold'>
                                  {item.LM_ConsumoPeriodo?.toLocaleString(
                                    'es-CL'
                                  )}
                                </TableCell>
                                <TableCell className='text-xs text-right font-mono'>
                                  {item.LM_ValorLecturaActual?.toLocaleString(
                                    'es-CL'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='tendencias' className='pt-3'>
              <div className='space-y-3'>
                {/* Indicadores de tendencia simplificados */}
                <div className='grid grid-cols-1 gap-3'>
                  {variacionMesAnterior !== null && (
                    <div className='p-3 bg-muted/30 rounded-xl border border-border/20'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                          Tendencia Mensual
                        </span>
                        {variacionMesAnterior > 0 ? (
                          <TrendingUp className='h-4 w-4 text-red-600 dark:text-red-400' />
                        ) : (
                          <TrendingDown className='h-4 w-4 text-green-600 dark:text-green-400' />
                        )}
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          variacionMesAnterior > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {variacionMesAnterior > 0 ? '+' : ''}
                        {variacionMesAnterior.toFixed(1)}%
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        vs mes anterior ({periodoMesAnterior})
                      </p>
                    </div>
                  )}

                  <div className='p-3 bg-muted/30 rounded-xl border border-border/20'>
                    <div className='flex items-center gap-2 mb-2'>
                      <BarChart3 className='h-4 w-4 ' />
                      <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Análisis General
                      </span>
                    </div>
                    <div className='space-y-2 text-xs'>
                      <div className='flex justify-between'>
                        <span>Consumo más alto:</span>
                        <span className='font-medium'>
                          {estadisticas?.periodoMaximo} (
                          {estadisticas?.consumoMaximo.toLocaleString('es-CL')}{' '}
                          kWh)
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Consumo más bajo:</span>
                        <span className='font-medium'>
                          {estadisticas?.periodoMinimo} (
                          {estadisticas?.consumoMinimo.toLocaleString('es-CL')}{' '}
                          kWh)
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Diferencia:</span>
                        <span className='font-medium'>
                          {estadisticas
                            ? (
                                estadisticas.consumoMaximo -
                                estadisticas.consumoMinimo
                              ).toLocaleString('es-CL')
                            : 0}{' '}
                          kWh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Modals para gráficas - Solo móviles */}
        <Sheet open={showLineChart} onOpenChange={setShowLineChart}>
          <SheetContent side='bottom' className='h-[85vh] p-0'>
            <SheetHeader className='p-4 border-b border-border/40'>
              <SheetTitle className='text-base font-semibold text-foreground'>
                Evolución de Consumo
              </SheetTitle>
              <SheetDescription className='text-sm text-muted-foreground'>
                Tendencia del consumo energético a lo largo del tiempo
              </SheetDescription>
            </SheetHeader>
            <div className='p-4 flex-1 overflow-auto'>
              <div className='mb-4'>
                <Tabs
                  defaultValue='todo'
                  value={periodoSeleccionado}
                  onValueChange={value =>
                    setPeriodoSeleccionado(value as PeriodoTiempo)
                  }
                >
                  <TabsList className='bg-muted/50 w-full'>
                    <TabsTrigger value='todo' className='text-xs flex-1'>
                      Todo
                    </TabsTrigger>
                    <TabsTrigger value='6meses' className='text-xs flex-1'>
                      6 Meses
                    </TabsTrigger>
                    <TabsTrigger value='3meses' className='text-xs flex-1'>
                      3 Meses
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <ChartContainer
                config={chartConfig}
                className='min-h-[300px] w-full'
              >
                <LineChart
                  data={[...getDatosFiltrados(dataEtapaCuatro)].reverse()}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 20
                  }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    className='stroke-border/50'
                  />
                  <XAxis
                    dataKey='LM_Periodo'
                    tickLine={false}
                    tickMargin={12}
                    axisLine={false}
                    tick={{
                      fill: 'var(--color-detallesMedidor)',
                      fontSize: 10
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{
                      fill: 'var(--color-detallesMedidor)',
                      fontSize: 10
                    }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={value => `Periodo: ${value}`}
                        formatter={value => [`${value} kWh`, 'Consumo']}
                      />
                    }
                  />
                  <Line
                    type='monotone'
                    dataKey='LM_ConsumoPeriodo'
                    stroke='var(--color-detallesMedidor)'
                    strokeWidth={3}
                    dot={{
                      fill: 'var(--color-detallesMedidor)',
                      strokeWidth: 2,
                      stroke: '#fff',
                      r: 3
                    }}
                    activeDot={{
                      r: 5,
                      fill: 'var(--color-detallesMedidor)',
                      stroke: '#fff',
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={showBarChart} onOpenChange={setShowBarChart}>
          <SheetContent side='bottom' className='h-[85vh] p-0'>
            <SheetHeader className='p-4 border-b border-border/40'>
              <SheetTitle className='text-base font-semibold text-foreground'>
                Comparativa Mensual por Años
              </SheetTitle>
              <SheetDescription className='text-sm text-muted-foreground'>
                Comparación de consumos del mismo mes en diferentes años
              </SheetDescription>
            </SheetHeader>
            <div className='p-4 flex-1 overflow-auto'>
              <ChartContainer
                config={chartConfig}
                className='min-h-[300px] w-full'
              >
                <BarChart
                  data={getMensualComparisonData.filter(
                    item =>
                      item.consumoActual !== null &&
                      item.consumoAnterior !== null
                  )}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 40
                  }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    className='stroke-border/50'
                  />
                  <XAxis
                    dataKey='mes'
                    tickLine={false}
                    tickMargin={12}
                    axisLine={false}
                    tick={{
                      fill: 'var(--color-detallesMedidor)',
                      fontSize: 10
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{
                      fill: 'var(--color-detallesMedidor)',
                      fontSize: 10
                    }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={value => `Mes: ${value}`}
                      />
                    }
                  />
                  <Legend
                    verticalAlign='top'
                    height={36}
                    wrapperStyle={{ paddingBottom: '10px' }}
                  />
                  <Bar
                    name='Año Anterior'
                    dataKey='consumoAnterior'
                    fill='#f97316'
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Bar
                    name='Año Actual'
                    dataKey='consumoActual'
                    fill='#3b82f6'
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={showHistoryTable} onOpenChange={setShowHistoryTable}>
          <SheetContent side='bottom' className='h-[85vh] p-0'>
            <SheetHeader className='p-4 border-b border-border/40'>
              <SheetTitle className='text-base font-semibold text-foreground'>
                Tabla Histórica de Consumos
              </SheetTitle>
              <SheetDescription className='text-sm text-muted-foreground'>
                Registro detallado de todas las lecturas
              </SheetDescription>
            </SheetHeader>
            <div className='p-4 flex-1 overflow-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-xs'>Período</TableHead>
                    <TableHead className='text-xs'>Fecha</TableHead>
                    <TableHead className='text-xs text-right'>
                      Consumo
                    </TableHead>
                    <TableHead className='text-xs text-right'>
                      Lectura
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosValidosOrdenados.reverse().map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-mono text-xs'>
                        {item.LM_Periodo}
                      </TableCell>
                      <TableCell className='text-xs'>
                        {new Date(item.LM_FechaLectura).toLocaleDateString(
                          'es-CL'
                        )}
                      </TableCell>
                      <TableCell className='text-xs text-right font-semibold'>
                        {item.LM_ConsumoPeriodo?.toLocaleString('es-CL')} kWh
                      </TableCell>
                      <TableCell className='text-xs text-right font-mono'>
                        {item.LM_ValorLecturaActual?.toLocaleString('es-CL')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}
