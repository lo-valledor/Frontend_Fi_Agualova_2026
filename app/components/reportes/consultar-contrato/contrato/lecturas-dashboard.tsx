import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Separator } from '~/components/ui/separator';
import type { DetalleLecturas } from '~/types/reportes';

interface LecturasDashboardProps {
  detalleLecturas: DetalleLecturas[];
  contratoId?: number;
}

// Función para extraer año y mes del período MMAAAA
const extraerAnoMes = (periodo: string) => {
  const mes = periodo.substring(0, 2);
  const ano = periodo.substring(2, 6);
  return { mes, ano };
};

// Función para obtener nombre del mes
const getNombreMes = (mes: string) => {
  const meses = [
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
  const mesNum = parseInt(mes, 10);
  return meses[mesNum - 1] || mes;
};

// Función para calcular intensidad de color para heatmap
const calcularIntensidad = (
  consumo: number,
  min: number,
  max: number
): number => {
  if (max === min) return 2;
  return Math.floor(((consumo - min) / (max - min)) * 4);
};

// Función para obtener color por intensidad
const getColorByIntensity = (intensidad: number, isDark = false): string => {
  if (isDark) {
    const coloresDark = [
      '#1e293b', // slate-800
      '#064e3b', // emerald-900
      '#047857', // emerald-700
      '#059669', // emerald-600
      '#10b981' // emerald-500
    ];
    return coloresDark[intensidad] || coloresDark[2];
  }

  const colores = [
    '#ebedf0', // gris muy claro
    '#9be9a8', // verde claro
    '#40c463', // verde medio
    '#30a14e', // verde oscuro
    '#216e39' // verde muy oscuro
  ];
  return colores[intensidad] || colores[2];
};

const LecturasDashboard = memo(function LecturasDashboard({
  detalleLecturas,
  contratoId: _contratoId
}: LecturasDashboardProps) {
  const [timeRange, setTimeRange] = useState<
    '6m' | '1a' | '2a' | '5a' | 'todo'
  >('todo');

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

    return lecturas.filter(lectura => {
      const { mes, ano } = extraerAnoMes(lectura.periodo);
      const fecha = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      return fecha >= cutoffDate;
    });
  };

  // Procesamiento de datos
  const dashboardData = useMemo(() => {
    if (detalleLecturas.length === 0) {
      return {
        lecturasValidas: [],
        promedioMensual: 0,
        consumoMaximo: 0,
        consumoMinimo: 0,
        periodoMaximo: '',
        periodoMinimo: '',
        proyeccion102025: 0,
        nivelProyeccion: 'media' as const,
        datosConPromedio: [],
        anosDisponibles: [],
        datosComparativaAnos: [],
        datosConSobreconsumo: [],
        heatmapData: [],
        minConsumo: 0,
        maxConsumo: 0
      };
    }

    // Filtrar lecturas válidas
    const lecturasValidas = detalleLecturas.filter(
      lectura => lectura.consumoPeriodo != null && lectura.consumoPeriodo > 0
    );

    if (lecturasValidas.length === 0) {
      return {
        lecturasValidas: [],
        promedioMensual: 0,
        consumoMaximo: 0,
        consumoMinimo: 0,
        periodoMaximo: '',
        periodoMinimo: '',
        proyeccion102025: 0,
        nivelProyeccion: 'media' as const,
        datosConPromedio: [],
        anosDisponibles: [],
        datosComparativaAnos: [],
        datosConSobreconsumo: [],
        heatmapData: [],
        minConsumo: 0,
        maxConsumo: 0
      };
    }

    // Ordenar por período
    const lecturasOrdenadas = [...lecturasValidas].sort((a, b) =>
      a.periodo.localeCompare(b.periodo)
    );

    // Aplicar filtro de tiempo
    const lecturasFiltradas = filterByTimeRange(lecturasOrdenadas, timeRange);

    // Calcular KPIs
    const consumos = lecturasFiltradas.map(l => l.consumoPeriodo!);
    const promedioMensual =
      consumos.reduce((sum, c) => sum + c, 0) / consumos.length;
    const consumoMaximo = Math.max(...consumos);
    const consumoMinimo = Math.min(...consumos);

    const lecturaMax = lecturasFiltradas.find(
      l => l.consumoPeriodo === consumoMaximo
    );
    const lecturaMin = lecturasFiltradas.find(
      l => l.consumoPeriodo === consumoMinimo
    );
    const periodoMaximo = lecturaMax?.periodo || '';
    const periodoMinimo = lecturaMin?.periodo || '';

    // Calcular proyección para período 102025
    let proyeccion102025 = 0;
    let nivelProyeccion: 'alta' | 'media' | 'baja' = 'media';

    const ultimos3Meses = lecturasOrdenadas.slice(-3);
    if (ultimos3Meses.length > 0) {
      const promedioUltimos3 =
        ultimos3Meses.reduce((sum, l) => sum + (l.consumoPeriodo || 0), 0) /
        ultimos3Meses.length;

      // Buscar consumo del mismo mes (octubre) en años anteriores
      const consumosOctubre = lecturasOrdenadas.filter(l => {
        const { mes } = extraerAnoMes(l.periodo);
        return mes === '10';
      });

      let promedioOctubre = 0;
      if (consumosOctubre.length > 0) {
        promedioOctubre =
          consumosOctubre.reduce((sum, l) => sum + (l.consumoPeriodo || 0), 0) /
          consumosOctubre.length;
      }

      // Calcular proyección (70% últimos 3 meses, 30% mismo mes años anteriores)
      if (promedioOctubre > 0) {
        proyeccion102025 = Math.round(
          promedioUltimos3 * 0.7 + promedioOctubre * 0.3
        );
      } else {
        proyeccion102025 = Math.round(promedioUltimos3);
      }

      // Determinar nivel
      if (proyeccion102025 > promedioMensual * 1.15) {
        nivelProyeccion = 'alta';
      } else if (proyeccion102025 < promedioMensual * 0.85) {
        nivelProyeccion = 'baja';
      }
    }

    // Datos para gráfica con promedio
    const datosConPromedio = lecturasFiltradas.map(l => ({
      periodo: l.periodo,
      periodoCorto: getNombreMes(extraerAnoMes(l.periodo).mes),
      consumoPeriodo: l.consumoPeriodo,
      promedio: Math.round(promedioMensual),
      lecturaAnterior: l.lecturaAnterior ?? 0,
      lecturaActual: l.lecturaActual ?? 0,
      energiaBase: l.energiaBase ?? 0,
      sobreconsumo: l.sobreconsumo ?? 0
    }));

    // Extraer años disponibles
    const anosSet = new Set(
      lecturasOrdenadas.map(l => extraerAnoMes(l.periodo).ano)
    );
    const anosDisponibles = Array.from(anosSet).sort();

    // Datos para comparativa año a año
    const datosComparativaAnos: any[] = [];
    if (anosDisponibles.length > 1) {
      const mesesMap = new Map<string, any>();

      lecturasOrdenadas.forEach(lectura => {
        const { mes, ano } = extraerAnoMes(lectura.periodo);
        const mesKey = mes;

        if (!mesesMap.has(mesKey)) {
          mesesMap.set(mesKey, {
            mes: mesKey,
            mesNombre: getNombreMes(mes)
          });
        }

        const entry = mesesMap.get(mesKey);
        entry[ano] = lectura.consumoPeriodo;
      });

      datosComparativaAnos.push(...Array.from(mesesMap.values()));
      datosComparativaAnos.sort((a, b) => a.mes.localeCompare(b.mes));
    }

    // Datos con sobreconsumo
    const datosConSobreconsumo = lecturasFiltradas.filter(
      l => l.sobreconsumo && l.sobreconsumo > 0
    );

    // Datos para heatmap
    const minConsumo = Math.min(
      ...lecturasOrdenadas.map(l => l.consumoPeriodo || 0)
    );
    const maxConsumo = Math.max(
      ...lecturasOrdenadas.map(l => l.consumoPeriodo || 0)
    );

    const heatmapData = lecturasOrdenadas.map(l => {
      const { mes, ano } = extraerAnoMes(l.periodo);
      const consumo = l.consumoPeriodo || 0;
      const intensidad = calcularIntensidad(consumo, minConsumo, maxConsumo);

      return {
        mes,
        ano,
        periodo: l.periodo,
        consumo,
        intensidad,
        mesNombre: getNombreMes(mes)
      };
    });

    return {
      lecturasValidas: lecturasFiltradas,
      promedioMensual,
      consumoMaximo,
      consumoMinimo,
      periodoMaximo,
      periodoMinimo,
      proyeccion102025,
      nivelProyeccion,
      datosConPromedio,
      anosDisponibles,
      datosComparativaAnos,
      datosConSobreconsumo,
      heatmapData,
      minConsumo,
      maxConsumo
    };
  }, [detalleLecturas, timeRange]);

  const chartConfig = {
    consumoPeriodo: {
      label: 'Consumo',
      color: '#3b82f6'
    },
    promedio: {
      label: 'Promedio',
      color: '#10b981'
    },
    lecturaAnterior: {
      label: 'Lectura Anterior',
      color: '#8b5cf6'
    },
    lecturaActual: {
      label: 'Lectura Actual',
      color: '#f59e0b'
    },
    energiaBase: {
      label: 'Energía Base',
      color: '#10b981'
    },
    sobreconsumo: {
      label: 'Sobreconsumo',
      color: '#ef4444'
    }
  };

  // Colores para barras de años
  const coloresAnos: Record<string, string> = {
    '2023': '#6366f1',
    '2024': '#8b5cf6',
    '2025': '#3b82f6'
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header con selector de tiempo */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-blue-600' />
            Dashboard de Lecturas
          </h2>
          <p className='text-sm text-slate-600 dark:text-slate-400'>
            Análisis avanzado del consumo eléctrico
          </p>
        </div>

        <div className='flex gap-2'>
          {(['6m', '1a', '2a', '5a', 'todo'] as const).map(range => (
            <Button
              key={range}
              size='sm'
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className='text-xs'
            >
              {range === '6m'
                ? '6 meses'
                : range === '1a'
                  ? '1 año'
                  : range === '2a'
                    ? '2 años'
                    : range === '5a'
                      ? '5 años'
                      : 'Todo'}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* KPIs */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Promedio Mensual */}
        <Card className='border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-blue-700 dark:text-blue-300'>
                  Promedio Mensual
                </p>
                <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                  {dashboardData.promedioMensual.toLocaleString('es-CL', {
                    maximumFractionDigits: 0
                  })}
                </p>
                <p className='text-xs text-blue-600 dark:text-blue-400'>
                  kWh por período
                </p>
              </div>
              <Activity className='h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50' />
            </div>
          </CardContent>
        </Card>

        {/* Consumo Máximo */}
        <Card className='border bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-rose-700 dark:text-rose-300'>
                  Consumo Máximo
                </p>
                <p className='text-2xl font-bold text-rose-900 dark:text-rose-100'>
                  {dashboardData.consumoMaximo.toLocaleString('es-CL')}
                </p>
                <p className='text-xs text-rose-600 dark:text-rose-400'>
                  {dashboardData.periodoMaximo
                    ? `Período ${dashboardData.periodoMaximo}`
                    : 'kWh'}
                </p>
              </div>
              <TrendingUp className='h-8 w-8 text-rose-600 dark:text-rose-400 opacity-50' />
            </div>
          </CardContent>
        </Card>

        {/* Consumo Mínimo */}
        <Card className='border bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-cyan-700 dark:text-cyan-300'>
                  Consumo Mínimo
                </p>
                <p className='text-2xl font-bold text-cyan-900 dark:text-cyan-100'>
                  {dashboardData.consumoMinimo.toLocaleString('es-CL')}
                </p>
                <p className='text-xs text-cyan-600 dark:text-cyan-400'>
                  {dashboardData.periodoMinimo
                    ? `Período ${dashboardData.periodoMinimo}`
                    : 'kWh'}
                </p>
              </div>
              <TrendingDown className='h-8 w-8 text-cyan-600 dark:text-cyan-400 opacity-50' />
            </div>
          </CardContent>
        </Card>

        {/* Proyección 102025 */}
        <Card className='border bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-amber-700 dark:text-amber-300'>
                  Proyección 102025
                </p>
                <p className='text-2xl font-bold text-amber-900 dark:text-amber-100'>
                  {dashboardData.proyeccion102025.toLocaleString('es-CL')}
                </p>
                <div className='flex items-center gap-1 mt-1'>
                  <Badge
                    variant={
                      dashboardData.nivelProyeccion === 'alta'
                        ? 'destructive'
                        : dashboardData.nivelProyeccion === 'baja'
                          ? 'default'
                          : 'secondary'
                    }
                    className='text-xs'
                  >
                    {dashboardData.nivelProyeccion === 'alta'
                      ? 'Alta'
                      : dashboardData.nivelProyeccion === 'baja'
                        ? 'Baja'
                        : 'Media'}
                  </Badge>
                  <span className='text-xs text-amber-600 dark:text-amber-400'>
                    estimación
                  </span>
                </div>
              </div>
              <Zap className='h-8 w-8 text-amber-600 dark:text-amber-400 opacity-50' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica 1: Consumo Mensual (Barras) */}
      <Card className='border bg-background'>
        <CardHeader>
          <CardTitle className='text-base'>1. Consumo Mensual</CardTitle>
          <CardDescription>
            Comparación de consumo por período con indicador de promedio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='h-[350px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={dashboardData.datosConPromedio}>
                <XAxis
                  dataKey='periodo'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis hide />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={value => [
                    `${Number(value).toLocaleString('es-CL')} kWh`,
                    'Consumo'
                  ]}
                />
                <Bar dataKey='consumoPeriodo' radius={[4, 4, 0, 0]}>
                  {dashboardData.datosConPromedio.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.consumoPeriodo > dashboardData.promedioMensual
                          ? '#ef4444'
                          : '#3b82f6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className='flex items-center justify-center gap-4 mt-4 text-xs'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded bg-blue-500' />
              <span>Por debajo del promedio</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded bg-red-500' />
              <span>Por encima del promedio</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfica 2: Evolución del Consumo (Líneas + Promedio) */}
      <Card className='border bg-background'>
        <CardHeader>
          <CardTitle className='text-base'>2. Evolución del Consumo</CardTitle>
          <CardDescription>
            Tendencia del consumo con línea de promedio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='h-[350px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={dashboardData.datosConPromedio}>
                <XAxis
                  dataKey='periodo'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='consumoPeriodo'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  name='Consumo Real'
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='promedio'
                  stroke='#10b981'
                  strokeWidth={2}
                  strokeDasharray='5 5'
                  name='Promedio'
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfica 3: Lecturas del Medidor (Área) */}
      <Card className='border bg-background'>
        <CardHeader>
          <CardTitle className='text-base'>
            3. Lecturas del Medidor Acumuladas
          </CardTitle>
          <CardDescription>
            Crecimiento acumulado de las lecturas del medidor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='h-[350px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={dashboardData.datosConPromedio}>
                <XAxis
                  dataKey='periodo'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient
                    id='colorLecturaActual'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#f59e0b' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type='monotone'
                  dataKey='lecturaActual'
                  stroke='#f59e0b'
                  strokeWidth={2}
                  fill='url(#colorLecturaActual)'
                  name='Lectura Actual'
                />
                <Line
                  type='monotone'
                  dataKey='lecturaAnterior'
                  stroke='#8b5cf6'
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  name='Lectura Anterior'
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfica 4: Comparativa Año a Año */}
      {dashboardData.anosDisponibles.length > 1 ? (
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base'>
              4. Comparativa Año a Año
            </CardTitle>
            <CardDescription>
              Comparación del consumo del mismo mes en diferentes años
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='h-[350px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={dashboardData.datosComparativaAnos}>
                  <XAxis
                    dataKey='mesNombre'
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
                      `Año ${name}`
                    ]}
                  />
                  <Legend />
                  {dashboardData.anosDisponibles.map(ano => (
                    <Bar
                      key={ano}
                      dataKey={ano}
                      fill={coloresAnos[ano] || '#94a3b8'}
                      name={ano}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base'>
              4. Comparativa Año a Año
            </CardTitle>
            <CardDescription>
              Comparación del consumo del mismo mes en diferentes años
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center justify-center h-[200px] text-center'>
              <Calendar className='h-12 w-12 text-slate-400 mb-3' />
              <p className='text-slate-600 dark:text-slate-400'>
                Datos insuficientes para comparar años
              </p>
              <p className='text-sm text-slate-500 dark:text-slate-500 mt-1'>
                Se requieren lecturas de al menos 2 años diferentes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfica 5: Distribución Base vs Sobreconsumo */}
      {dashboardData.datosConSobreconsumo.length > 0 ? (
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base'>
              5. Distribución Energía Base vs Sobreconsumo
            </CardTitle>
            <CardDescription>
              Proporción de energía base y sobreconsumo por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='h-[350px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={dashboardData.datosConSobreconsumo.map(d => ({
                    periodo: d.periodo,
                    energiaBase: d.energiaBase ?? 0,
                    sobreconsumo: d.sobreconsumo ?? 0
                  }))}
                >
                  <XAxis
                    dataKey='periodo'
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
                      name === 'energiaBase' ? 'Energía Base' : 'Sobreconsumo'
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey='energiaBase'
                    fill='#10b981'
                    stackId='a'
                    radius={[0, 0, 4, 4]}
                    name='Energía Base'
                  />
                  <Bar
                    dataKey='sobreconsumo'
                    fill='#ef4444'
                    stackId='a'
                    radius={[4, 4, 0, 0]}
                    name='Sobreconsumo'
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base'>
              5. Distribución Energía Base vs Sobreconsumo
            </CardTitle>
            <CardDescription>
              Proporción de energía base y sobreconsumo por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center justify-center h-[200px] text-center'>
              <AlertTriangle className='h-12 w-12 text-slate-400 mb-3' />
              <p className='text-slate-600 dark:text-slate-400'>
                No hay sobreconsumos registrados
              </p>
              <p className='text-sm text-slate-500 dark:text-slate-500 mt-1'>
                Todos los consumos están dentro de la energía base
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfica 6: Heatmap Calendario */}
      <Card className='border bg-background'>
        <CardHeader>
          <CardTitle className='text-base'>
            6. Heatmap de Consumo por Período
          </CardTitle>
          <CardDescription>
            Intensidad del consumo visualizada por mes y año
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.heatmapData.length > 0 ? (
            <div className='space-y-4'>
              {/* Grid de años */}
              {dashboardData.anosDisponibles.map(ano => {
                const datosAno = dashboardData.heatmapData.filter(
                  d => d.ano === ano
                );

                return (
                  <div key={ano} className='space-y-2'>
                    <div className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      {ano}
                    </div>
                    <div className='grid grid-cols-12 gap-2'>
                      {Array.from({ length: 12 }, (_, i) => {
                        const mes = (i + 1).toString().padStart(2, '0');
                        const dato = datosAno.find(d => d.mes === mes);

                        return (
                          <div
                            key={mes}
                            className='group relative aspect-square rounded cursor-pointer transition-all hover:ring-2 hover:ring-blue-500'
                            style={{
                              backgroundColor: dato
                                ? getColorByIntensity(dato.intensidad)
                                : '#ebedf0'
                            }}
                            title={
                              dato
                                ? `${dato.mesNombre} ${ano}: ${dato.consumo.toLocaleString('es-CL')} kWh`
                                : `${getNombreMes(mes)} ${ano}: Sin datos`
                            }
                          >
                            {/* Tooltip */}
                            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10'>
                              <div className='bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap'>
                                {dato
                                  ? `${dato.mesNombre} ${ano}: ${dato.consumo.toLocaleString('es-CL')} kWh`
                                  : `${getNombreMes(mes)} ${ano}: Sin datos`}
                                <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900' />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Leyenda */}
              <div className='flex items-center justify-center gap-2 pt-4 border-t'>
                <span className='text-xs text-slate-600 dark:text-slate-400'>
                  Menos
                </span>
                {[0, 1, 2, 3, 4].map(nivel => (
                  <div
                    key={nivel}
                    className='w-4 h-4 rounded'
                    style={{ backgroundColor: getColorByIntensity(nivel) }}
                  />
                ))}
                <span className='text-xs text-slate-600 dark:text-slate-400'>
                  Más
                </span>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-[200px] text-center'>
              <Calendar className='h-12 w-12 text-slate-400 mb-3' />
              <p className='text-slate-600 dark:text-slate-400'>
                No hay datos suficientes para el heatmap
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default LecturasDashboard;
