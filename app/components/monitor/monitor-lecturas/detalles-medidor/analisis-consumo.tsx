import {
  BarChart3,
  Gauge,
  History,
  Info,
  Table2,
  TrendingDown,
  TrendingUp,
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
  YAxis,
} from 'recharts';

import { useEffect, useMemo, useState } from 'react';

import { chartConfig } from '~/components/chart-config';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '~/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from '~/components/ui/tooltip';
import api from '~/lib/api';
import type {
  CompararConsumoMedidor,
  EtapaCuatro,
  EtapaDos,
  EtapaUno,
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
  error,
}: AnalisisConsumoProps) {
  const [periodoSeleccionado, setPeriodoSeleccionado] =
    useState<PeriodoTiempo>('todo');
  const [datosComparacion, setDatosComparacion] = useState<
    CompararConsumoMedidor[]
  >([]);

  useEffect(() => {
    const getComparacionData = async (
      numeroSerie: string,
      periodoActual: string
    ) => {
      try {
        const response = await api.post('/comparar-consumo-medidor', {
          numeroSerie,
          periodoActual,
        });
        setDatosComparacion(response.data as CompararConsumoMedidor[]);
      } catch (e) {
        console.error('Error fetching comparison data:', e);
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
      'Diciembre',
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
          consumoAnterior: null,
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
      ...consumos,
    }));
  }, [datosComparacion]);

  const getMensualComparisonTable = useMemo(() => {
    return getMensualComparisonData.map(item => {
      const diferencia =
        item.consumoActual !== null && item.consumoAnterior !== null
          ? item.consumoActual - item.consumoAnterior
          : null;
      const variacionPorcentaje =
        item.consumoActual !== null &&
        item.consumoAnterior !== null &&
        item.consumoAnterior !== 0
          ? ((item.consumoActual - item.consumoAnterior) /
              item.consumoAnterior) *
            100
          : null;
      return {
        ...item,
        diferencia,
        variacionPorcentaje,
      };
    });
  }, [getMensualComparisonData]);

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
      const consumosOrdenados = [...consumos].sort((a, b) => a - b);
      const mediana =
        consumosOrdenados.length % 2 === 0
          ? (consumosOrdenados[consumosOrdenados.length / 2 - 1] +
              consumosOrdenados[consumosOrdenados.length / 2]) /
            2
          : consumosOrdenados[Math.floor(consumosOrdenados.length / 2)];

      // Análisis del último consumo vs promedio
      const ultimoConsumo = consumos[consumos.length - 1];
      const variacionUltimoVsPromedio =
        consumoPromedio > 0
          ? ((ultimoConsumo - consumoPromedio) / consumoPromedio) * 100
          : 0;

      // Análisis de variación del último periodo vs anterior
      const variacionUltimoPeriodo =
        consumos.length >= 2
          ? ((ultimoConsumo - consumos[consumos.length - 2]) /
              consumos[consumos.length - 2]) *
            100
          : 0;

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
        mediana,
        ultimoConsumo,
        variacionUltimoVsPromedio,
        variacionUltimoPeriodo,
        periodoMaximo,
        periodoMinimo,
        ultimoPeriodo,
        totalPeriodos: consumos.length,
      };
    };
  }, []);

  const estadisticas = getEstadisticasConsumo(dataEtapaCuatro);

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
    // Asumimos que LM_Periodo es un string tipo MMYYYY
    const periodoA =
      parseInt(a.LM_Periodo.slice(2)) * 100 +
      parseInt(a.LM_Periodo.slice(0, 2));
    const periodoB =
      parseInt(b.LM_Periodo.slice(2)) * 100 +
      parseInt(b.LM_Periodo.slice(0, 2));
    return periodoA - periodoB;
  });

  // Primer consumo registrado
  let primerConsumo = null;
  let periodoPrimerConsumo = '';
  if (datosValidosOrdenados.length > 0) {
    primerConsumo = datosValidosOrdenados[0]?.LM_ConsumoPeriodo;
    periodoPrimerConsumo = datosValidosOrdenados[0]?.LM_Periodo;
  }
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

  // Calcular variación respecto al primer consumo
  let variacionPrimerConsumo = null;
  if (
    primerConsumo !== null &&
    primerConsumo !== undefined &&
    primerConsumo > 0
  ) {
    variacionPrimerConsumo =
      ((ultimoConsumo - primerConsumo) / primerConsumo) * 100;
  }

  // Calcular estadísticas adicionales
  let desviacionEstandar = null;
  let rango = null;
  if (datosValidosOrdenados.length > 2) {
    const consumos = datosValidosOrdenados.map(item => item.LM_ConsumoPeriodo);
    const promedio = consumos.reduce((a, b) => a + b, 0) / consumos.length;
    const varianza =
      consumos.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) /
      (consumos.length - 1);
    desviacionEstandar = Math.sqrt(varianza);
    rango = Math.max(...consumos) - Math.min(...consumos);
  }

  return (
    <Card className='border-slate-200 dark:border-slate-800 shadow-md'>
      <CardHeader className='bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 border-b border-slate-200 dark:border-slate-800'>
        <CardTitle className='flex items-center gap-3 text-slate-900 dark:text-slate-100'>
          <div className='p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg'>
            <TrendingUp className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          </div>
          <span className='font-semibold'>Análisis de Consumo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-6'>
        {error ? (
          <Alert variant='destructive' className='mb-3'>
            <Info className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !tieneDatosValidos(dataEtapaCuatro) ? (
          <Alert className='mb-3 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'>
            <Info className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            <AlertDescription className='text-amber-800 dark:text-amber-200'>
              No se encontraron datos válidos de consumo para este medidor. Esto
              puede deberse a que el medidor es nuevo o no tiene lecturas
              registradas aún.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue='estadisticas' className='w-full'>
            <TabsList className='w-full justify-start rounded-none border-b bg-transparent p-0'>
              <TabsTrigger
                value='estadisticas'
                className='relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-blue-500 data-[state=active]:text-foreground data-[state=active]:shadow-none'
              >
                <BarChart3 className='mr-2 h-4 w-4' />
                Estadísticas
              </TabsTrigger>
              <TabsTrigger
                value='historico'
                className='relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-blue-500 data-[state=active]:text-foreground data-[state=active]:shadow-none'
              >
                <History className='mr-2 h-4 w-4' />
                Histórico
              </TabsTrigger>
              <TabsTrigger
                value='comparativas'
                className='relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-blue-500 data-[state=active]:text-foreground data-[state=active]:shadow-none'
              >
                <Table2 className='mr-2 h-4 w-4' />
                Comparativas
              </TabsTrigger>
            </TabsList>
            <TabsContent value='estadisticas' className='pt-6'>
              <div className='space-y-6'>
                {!estadisticas ? (
                  <div className='text-center py-8'>
                    <div className='text-slate-500 dark:text-slate-400 mb-2'>
                      No hay datos suficientes para mostrar estadísticas
                    </div>
                    <div className='text-xs text-slate-400 dark:text-slate-500'>
                      Se requieren lecturas válidas con fechas y consumos
                      mayores a 0
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Tarjetas de estadísticas principales */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                      <div className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/30'>
                        <div className='flex items-center justify-between mb-2'>
                          <Gauge className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                          <span className='text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide'>
                            Promedio
                          </span>
                        </div>
                        <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                          {estadisticas.consumoPromedio.toLocaleString(
                            'es-CL',
                            { maximumFractionDigits: 0 }
                          )}
                        </p>
                        <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                          kWh/periodo
                        </p>
                      </div>

                      <div className='bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30'>
                        <div className='flex items-center justify-between mb-2'>
                          <TrendingUp className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                          <span className='text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide'>
                            Máximo
                          </span>
                        </div>
                        <p className='text-2xl font-bold text-emerald-900 dark:text-emerald-100'>
                          {estadisticas.consumoMaximo.toLocaleString('es-CL')}
                        </p>
                        <p className='text-xs text-emerald-600 dark:text-emerald-400 mt-1'>
                          {estadisticas.periodoMaximo}
                        </p>
                      </div>

                      <div className='bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/30'>
                        <div className='flex items-center justify-between mb-2'>
                          <BarChart3 className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                          <span className='text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide'>
                            Mínimo
                          </span>
                        </div>
                        <p className='text-2xl font-bold text-amber-900 dark:text-amber-100'>
                          {estadisticas.consumoMinimo.toLocaleString('es-CL')}
                        </p>
                        <p className='text-xs text-amber-600 dark:text-amber-400 mt-1'>
                          {estadisticas.periodoMinimo}
                        </p>
                      </div>

                      <div className='bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/30'>
                        <div className='flex items-center justify-between mb-2'>
                          <History className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                          <span className='text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide'>
                            Último vs Promedio
                          </span>
                        </div>
                        <p className='text-lg font-bold text-purple-900 dark:text-purple-100'>
                          {(variacionMesAnterior !== null &&
                          variacionMesAnterior > 0
                            ? '+'
                            : '') + variacionMesAnterior?.toFixed(1)}
                          %
                        </p>
                        <p className='text-xs text-purple-600 dark:text-purple-400 mt-1'>
                          {variacionMesAnterior !== null &&
                          variacionMesAnterior > 5
                            ? 'Por encima del promedio'
                            : variacionMesAnterior !== null &&
                                variacionMesAnterior < -5
                              ? 'Por debajo del promedio'
                              : 'Cercano al promedio'}
                        </p>
                      </div>
                    </div>

                    {/* Gráfico de evolución */}
                    <div className='bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 overflow-hidden'>
                      <div className='p-6 border-b border-slate-100 dark:border-slate-800/30'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                          <div>
                            <h3 className='text-base font-semibold text-slate-900 dark:text-slate-100'>
                              Evolución de Consumo
                            </h3>
                            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
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
                              <TabsList className='bg-slate-100 dark:bg-slate-800/50'>
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
                      <div className='p-6'>
                        <ChartContainer
                          config={chartConfig}
                          className='min-h-[320px] w-full'
                        >
                          <LineChart
                            data={[
                              ...getDatosFiltrados(dataEtapaCuatro),
                            ].reverse()}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray='3 3'
                              vertical={false}
                              className='stroke-slate-200/50 dark:stroke-slate-700/30'
                            />
                            <XAxis
                              dataKey='LM_Periodo'
                              tickLine={false}
                              tickMargin={12}
                              axisLine={false}
                              tick={{
                                fill: 'var(--color-detallesMedidor)',
                                fontSize: 11,
                              }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{
                                fill: 'var(--color-detallesMedidor)',
                                fontSize: 11,
                              }}
                            />
                            <Tooltip
                              content={
                                <ChartTooltipContent
                                  labelFormatter={value => `Periodo: ${value}`}
                                  formatter={value => [
                                    `${value} kWh`,
                                    'Consumo',
                                  ]}
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
                                r: 4,
                              }}
                              activeDot={{
                                r: 6,
                                fill: 'var(--color-detallesMedidor)',
                                stroke: '#fff',
                                strokeWidth: 2,
                              }}
                            />
                          </LineChart>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='bg-slate-50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800'>
                        <h4 className='font-semibold text-slate-900 dark:text-slate-100 mb-3'>
                          Resumen Estadístico
                        </h4>
                        <div className='space-y-2 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Consumo Total:
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {estadisticas.consumoTotal.toLocaleString(
                                'es-CL'
                              )}{' '}
                              kWh
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Mediana
                            </span>
                            <span className='text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1'>
                              {estadisticas.mediana.toLocaleString('es-CL', {
                                maximumFractionDigits: 0,
                              })}
                              <TooltipProvider>
                                <UITooltip delayDuration={150}>
                                  <TooltipTrigger asChild>
                                    <Info className='h-3 w-3 text-blue-400 dark:text-blue-300 cursor-pointer' />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span>
                                      La mediana es el valor central de todos
                                      los consumos registrados, útil para evitar
                                      que valores extremos distorsionen el
                                      análisis.
                                    </span>
                                  </TooltipContent>
                                </UITooltip>
                              </TooltipProvider>
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Períodos registrados:
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {estadisticas.totalPeriodos}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Promedio:
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {estadisticas.consumoPromedio.toLocaleString(
                                'es-CL',
                                { maximumFractionDigits: 0 }
                              )}
                              kWh
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Máximo:
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {estadisticas.consumoMaximo.toLocaleString(
                                'es-CL'
                              )}
                              kWh ({estadisticas.periodoMaximo})
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Mínimo:
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {estadisticas.consumoMinimo.toLocaleString(
                                'es-CL'
                              )}
                              kWh ({estadisticas.periodoMinimo})
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Desviación estándar:
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {desviacionEstandar !== null
                                ? desviacionEstandar.toLocaleString('es-CL', {
                                    maximumFractionDigits: 0,
                                  }) + ' kWh'
                                : '-'}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Rango:
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {rango !== null
                                ? rango.toLocaleString('es-CL', {
                                    maximumFractionDigits: 0,
                                  }) + ' kWh'
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='bg-slate-50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800'>
                        <div className='flex items-center gap-2 mb-3'>
                          <h4 className='font-semibold text-slate-900 dark:text-slate-100'>
                            Datos de Consumo
                          </h4>
                        </div>
                        <div className='space-y-3 text-sm'>
                          <div className='flex items-center justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Último consumo registrado ({periodoUltimoConsumo}
                              ):
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {ultimoConsumo?.toLocaleString('es-CL')}
                              kWh
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Mes anterior ({periodoMesAnterior}):
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {consumoMesAnterior?.toLocaleString('es-CL')}
                              kWh
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Primer consumo registrado ({periodoPrimerConsumo}
                              ):
                            </span>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                              {primerConsumo?.toLocaleString('es-CL')}
                              kWh
                            </span>
                          </div>
                          <div className='flex items-center justify-between mt-2'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              Variación respecto al primer consumo:
                            </span>
                            {primerConsumo !== null &&
                            primerConsumo !== undefined &&
                            variacionPrimerConsumo !== null &&
                            variacionPrimerConsumo !== undefined ? (
                              primerConsumo <= 20 ? (
                                <span className='text-slate-600 dark:text-slate-400'>
                                  El consumo inicial es muy bajo, la variación
                                  puede no ser representativa.
                                </span>
                              ) : variacionPrimerConsumo > 0 ? (
                                <span className='text-red-600 dark:text-red-400'>
                                  El consumo ha aumentado{' '}
                                  {variacionPrimerConsumo.toFixed(1)}% respecto
                                  al primer registro.
                                </span>
                              ) : variacionPrimerConsumo < 0 ? (
                                <span className='text-green-600 dark:text-green-400'>
                                  El consumo ha disminuido{' '}
                                  {Math.abs(variacionPrimerConsumo).toFixed(1)}%
                                  respecto al primer registro.
                                </span>
                              ) : (
                                <span className='text-slate-600 dark:text-slate-400'>
                                  El consumo es igual al primer registro.
                                </span>
                              )
                            ) : (
                              <span className='text-slate-400 dark:text-slate-500'>
                                No hay datos suficientes para calcular la
                                variación respecto al primer consumo.
                              </span>
                            )}
                          </div>

                          {consumoMesAnterior !== null &&
                            variacionMesAnterior !== null && (
                              <div className='flex items-center justify-between'>
                                <span className='text-slate-600 dark:text-slate-400'>
                                  Variación respecto al mes anterior:
                                </span>
                                <span
                                  className={`font-medium flex items-center gap-1 ${
                                    variacionMesAnterior > 0
                                      ? 'text-red-600 dark:text-red-400'
                                      : variacionMesAnterior < 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {variacionMesAnterior > 0 ? '+' : ''}
                                  {variacionMesAnterior.toFixed(1)}%
                                  {variacionMesAnterior > 0 ? (
                                    <TrendingUp className='h-4 w-4' />
                                  ) : (
                                    <TrendingDown className='h-4 w-4' />
                                  )}
                                </span>
                              </div>
                            )}
                          <div className='mt-3 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg'>
                            <div className='flex items-center gap-2'>
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  estadisticas.variacionUltimoVsPromedio > 5
                                    ? 'bg-red-500'
                                    : estadisticas.variacionUltimoVsPromedio <
                                        -5
                                      ? 'bg-green-500'
                                      : 'bg-blue-500'
                                }`}
                              ></div>
                              <span className='text-xs font-medium text-slate-700 dark:text-slate-300'>
                                {estadisticas.variacionUltimoVsPromedio > 5
                                  ? 'Consumo por encima del promedio'
                                  : estadisticas.variacionUltimoVsPromedio < -5
                                    ? 'Consumo por debajo del promedio'
                                    : 'Consumo cercano al promedio'}{' '}
                                (
                                {estadisticas.consumoPromedio.toLocaleString(
                                  'es-CL',
                                  { maximumFractionDigits: 0 }
                                )}{' '}
                                kWh)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value='historico' className='pt-6'>
              <div className='rounded-lg border border-slate-200 dark:border-slate-800'>
                <div className='p-4 border-b border-slate-100 dark:border-slate-800'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                    <div>
                      <h3 className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                        Histórico de Lecturas
                      </h3>
                      <p className='text-xs text-slate-500 dark:text-slate-400'>
                        Detalle de lecturas y consumos por periodo
                      </p>
                    </div>
                    <div className='w-full sm:w-auto'>
                      <Tabs
                        defaultValue='todo'
                        value={periodoSeleccionado}
                        onValueChange={value =>
                          setPeriodoSeleccionado(value as PeriodoTiempo)
                        }
                        className='w-full'
                      >
                        <TabsList className='grid grid-cols-3 w-full'>
                          <TabsTrigger value='todo'>Todo</TabsTrigger>
                          <TabsTrigger value='6meses'>6 Meses</TabsTrigger>
                          <TabsTrigger value='3meses'>3 Meses</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className='hover:bg-slate-100/50 dark:hover:bg-slate-800/50'>
                      <TableHead className='font-semibold text-slate-900 dark:text-slate-200'>
                        Periodo
                      </TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-slate-200'>
                        Fecha Lectura
                      </TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-slate-200 text-right'>
                        Lectura Actual
                      </TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-slate-200 text-right'>
                        Consumo
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDatosFiltrados(dataEtapaCuatro).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className='text-center py-8'>
                          <div className='text-slate-500 dark:text-slate-400 mb-2'>
                            No hay lecturas válidas disponibles
                          </div>
                          <div className='text-xs text-slate-400 dark:text-slate-500'>
                            Los datos mostrados anteriormente pueden contener
                            fechas inválidas o consumos en 0
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      getDatosFiltrados(dataEtapaCuatro).map((item, index) => (
                        <TableRow
                          key={index}
                          className='hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
                        >
                          <TableCell className='font-medium text-slate-900 dark:text-slate-200'>
                            {item.LM_Periodo}
                          </TableCell>
                          <TableCell className='text-slate-700 dark:text-slate-300'>
                            {new Date(item.LM_FechaLectura).toLocaleDateString(
                              'es-CL',
                              {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </TableCell>
                          <TableCell className='text-right font-medium text-slate-900 dark:text-slate-200'>
                            {item.LM_ValorLecturaActual?.toLocaleString(
                              'es-CL'
                            ) || ''}
                          </TableCell>
                          <TableCell className='text-right'>
                            <span className='inline-flex items-center gap-1 font-medium text-slate-900 dark:text-slate-200'>
                              {item.LM_ConsumoPeriodo?.toLocaleString(
                                'es-CL'
                              ) || '0'}
                              <span className='text-xs text-slate-500 dark:text-slate-400'>
                                kWh
                              </span>
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value='comparativas' className='pt-6'>
              <div className='space-y-6'>
                {datosComparacion.length === 0 ? (
                  <pre>{JSON.stringify(datosComparacion, null, 2)}</pre>
                ) : (
                  <>
                    <div className='bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg'>
                      <p className='text-slate-700 dark:text-slate-300 text-sm'>
                        Esta comparativa muestra el consumo del mismo mes en
                        diferentes años. Solo se muestran los meses que tienen
                        datos disponibles en ambos años.
                      </p>
                    </div>

                    {getMensualComparisonData.filter(
                      item =>
                        item.consumoActual !== null &&
                        item.consumoAnterior !== null
                    ).length === 0 ? (
                      <div className='p-6 text-center border border-slate-200 dark:border-slate-800 rounded-lg'>
                        <div className='text-slate-500 dark:text-slate-400 mb-2'>
                          No hay lecturas suficientes para realizar
                          comparaciones entre años
                        </div>
                        <div className='text-xs text-slate-400 dark:text-slate-500'>
                          Se requieren datos válidos del mismo mes en diferentes
                          años
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Gráfico de barras comparativo */}
                        <div className='bg-white dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/30 overflow-hidden'>
                          <div className='p-4 border-b border-slate-100 dark:border-slate-800/30'>
                            <h3 className='text-base font-semibold text-slate-900 dark:text-slate-100'>
                              Comparativa Mensual por Años
                            </h3>
                            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
                              Comparación de consumos del mismo mes en
                              diferentes años
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
                                  bottom: 50,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray='3 3'
                                  vertical={false}
                                  className='stroke-slate-100 dark:stroke-slate-800/50'
                                />
                                <XAxis
                                  dataKey='mes'
                                  tickLine={false}
                                  tickMargin={12}
                                  axisLine={false}
                                  tick={{
                                    fill: 'var(--color-detallesMedidor)',
                                    fontSize: 12,
                                  }}
                                />
                                <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={8}
                                  tick={{
                                    fill: 'var(--color-detallesMedidor)',
                                    fontSize: 12,
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

                        {/* Tabla detallada de comparaciones */}
                        <div className='rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden'>
                          <div className='p-4 border-b border-slate-100 dark:border-slate-800'>
                            <h4 className='font-semibold text-slate-900 dark:text-slate-100'>
                              Análisis Detallado de Variaciones
                            </h4>
                            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                              Comparación numérica y porcentual entre períodos
                            </p>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow className='hover:bg-slate-100/50 dark:hover:bg-slate-800/50'>
                                <TableHead className='font-semibold text-slate-900 dark:text-slate-200'>
                                  Mes
                                </TableHead>
                                <TableHead className='font-semibold text-slate-900 dark:text-slate-200 text-right'>
                                  Año Actual
                                </TableHead>
                                <TableHead className='font-semibold text-slate-900 dark:text-slate-200 text-right'>
                                  Año Anterior
                                </TableHead>
                                <TableHead className='font-semibold text-slate-900 dark:text-slate-200 text-right'>
                                  Diferencia
                                </TableHead>
                                <TableHead className='font-semibold text-slate-900 dark:text-slate-200 text-right'>
                                  Variación %
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getMensualComparisonTable
                                .filter(item => item.diferencia !== null)
                                .map((item, index) => (
                                  <TableRow
                                    key={index}
                                    className='hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
                                  >
                                    <TableCell className='font-medium text-slate-900 dark:text-slate-200'>
                                      {item.mes}
                                    </TableCell>
                                    <TableCell className='text-right font-medium text-blue-600 dark:text-blue-400'>
                                      {item.consumoActual?.toLocaleString(
                                        'es-CL'
                                      )}
                                      <span className='text-xs text-slate-500 dark:text-slate-400 ml-1'>
                                        kWh
                                      </span>
                                    </TableCell>
                                    <TableCell className='text-right font-medium text-orange-600 dark:text-orange-400'>
                                      {item.consumoAnterior?.toLocaleString(
                                        'es-CL'
                                      )}
                                      <span className='text-xs text-slate-500 dark:text-slate-400 ml-1'>
                                        kWh
                                      </span>
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                      <span
                                        className={`${
                                          item.diferencia != null &&
                                          item.diferencia > 0
                                            ? 'text-red-600 dark:text-red-400'
                                            : item.diferencia != null &&
                                                item.diferencia < 0
                                              ? 'text-green-600 dark:text-green-400'
                                              : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                      >
                                        {(item.diferencia != null &&
                                        item.diferencia > 0
                                          ? '+'
                                          : '') +
                                          item.diferencia?.toLocaleString(
                                            'es-CL'
                                          )}
                                        <span className='text-xs text-slate-500 dark:text-slate-400 ml-1'>
                                          kWh
                                        </span>
                                      </span>
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                      <span
                                        className={`${
                                          item.variacionPorcentaje != null &&
                                          item.variacionPorcentaje > 0
                                            ? 'text-red-600 dark:text-red-400'
                                            : item.variacionPorcentaje !=
                                                  null &&
                                                item.variacionPorcentaje < 0
                                              ? 'text-green-600 dark:text-green-400'
                                              : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                      >
                                        {(item.variacionPorcentaje != null &&
                                        item.variacionPorcentaje > 0
                                          ? '+'
                                          : '') +
                                          item.variacionPorcentaje?.toFixed(2) +
                                          '%'}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
