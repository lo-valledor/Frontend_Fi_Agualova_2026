import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  AlertCircle,
  Zap
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
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ZAxis
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
import type { DetalleFacturas, DetalleLecturas } from '~/types/reportes';

interface FacturasDashboardProps {
  detalleFacturas: DetalleFacturas[];
  detalleLecturas: DetalleLecturas[];
  contratoId?: number;
}

// Función para extraer año del período MMAAAA
const extraerAno = (periodo: string): string => {
  return periodo.substring(2, 6);
};

// Función para extraer mes del período MMAAAA
const extraerMes = (periodo: string): string => {
  return periodo.substring(0, 2);
};

// Función para obtener nombre del mes
const getNombreMes = (mes: string): string => {
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

// Función para obtener color de heatmap
const getHeatColor = (valorNormalizado: number): string => {
  if (valorNormalizado <= 20) return '#166534'; // Verde oscuro
  if (valorNormalizado <= 40) return '#22c55e'; // Verde
  if (valorNormalizado <= 60) return '#eab308'; // Amarillo
  if (valorNormalizado <= 80) return '#f97316'; // Naranja
  return '#dc2626'; // Rojo
};

const FacturasDashboard = memo(function FacturasDashboard({
  detalleFacturas,
  detalleLecturas,
  contratoId: _contratoId
}: FacturasDashboardProps) {
  // Estados para filtrado
  const [tipoVista, setTipoVista] = useState<'general' | 'ano' | 'mes'>(
    'general'
  );
  const [timeRange, setTimeRange] = useState<
    '6m' | '1a' | '2a' | '5a' | 'todo'
  >('todo');
  const [anoSeleccionado, setAnoSeleccionado] = useState<string>('');
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(1); // Default enero
  const [vistaEvolucion, setVistaEvolucion] = useState<'total' | 'neto'>(
    'total'
  );
  const [mesHeatmap, setMesHeatmap] = useState<number>(12); // Default diciembre

  // Obtener años disponibles
  const anosDisponibles = useMemo(() => {
    const anos = new Set(detalleFacturas.map(f => extraerAno(f.periodo)));
    return Array.from(anos).sort((a, b) => b.localeCompare(a));
  }, [detalleFacturas]);

  // Inicializar año seleccionado
  useMemo(() => {
    if (anosDisponibles.length > 0 && !anoSeleccionado) {
      setAnoSeleccionado(anosDisponibles[0]);
    }
  }, [anosDisponibles, anoSeleccionado]);

  // Función para filtrar datos según el tipo de vista
  const filterData = (facturas: any[]) => {
    if (tipoVista === 'ano' && anoSeleccionado) {
      // Filtrar por año específico
      return facturas.filter(f => extraerAno(f.periodo) === anoSeleccionado);
    } else if (tipoVista === 'mes') {
      // Filtrar por mes específico - todos los años
      return facturas.filter(
        f => parseInt(extraerMes(f.periodo)) === mesSeleccionado
      );
    } else {
      // Vista general - usar timeRange
      return filterByTimeRange(facturas, timeRange);
    }
  };

  // Función para filtrar datos por rango de tiempo (solo para vista general)
  const filterByTimeRange = (facturas: any[], range: string) => {
    if (range === 'todo') return facturas;

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
        return facturas;
    }

    return facturas.filter(factura => {
      const ano = extraerAno(factura.periodo);
      const mes = extraerMes(factura.periodo);
      const fecha = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      return fecha >= cutoffDate;
    });
  };

  // Procesamiento de datos
  const dashboardData = useMemo(() => {
    if (detalleFacturas.length === 0) {
      return {
        facturasValidas: [],
        facturaPromedio: 0,
        consumoPromedio: 0,
        costoPromedioKwh: 0,
        totalAnoActual: 0,
        variacionMesAnterior: 0,
        datosCorrelacionados: [],
        datosCostoPorKwh: [],
        datosScatter: [],
        comparativaMensual: null,
        heatmapData: []
      };
    }

    // Filtrar facturas válidas (con valor > 0)
    const facturasValidas = detalleFacturas.filter(
      f => f.valorTotal != null && f.valorTotal > 0
    );

    if (facturasValidas.length === 0) {
      return {
        facturasValidas: [],
        facturaPromedio: 0,
        consumoPromedio: 0,
        costoPromedioKwh: 0,
        totalAnoActual: 0,
        variacionMesAnterior: 0,
        datosCorrelacionados: [],
        datosCostoPorKwh: [],
        datosScatter: [],
        comparativaMensual: null,
        heatmapData: []
      };
    }

    // Ordenar por período
    const facturasOrdenadas = [...facturasValidas].sort((a, b) =>
      a.periodo.localeCompare(b.periodo)
    );

    // Aplicar filtro según el tipo de vista
    const facturasFiltradas = filterData(facturasOrdenadas);

    // Correlacionar con lecturas
    const lecturasMap = new Map(detalleLecturas.map(l => [l.periodo, l]));

    const datosCorrelacionados = facturasFiltradas.map(f => {
      const lectura = lecturasMap.get(f.periodo);
      const mes = extraerMes(f.periodo);
      const ano = extraerAno(f.periodo);
      return {
        periodo: f.periodo,
        periodoDisplay: `${getNombreMes(mes)} ${ano}`,
        mesNombre: getNombreMes(mes),
        mes,
        ano,
        valorTotal: f.valorTotal,
        valorNeto: f.valorNeto,
        iva: f.iva,
        consumoPeriodo: f.consumoPeriodo || 0,
        fechaEmision: f.fechaEmision,
        fechaVencimiento: f.fechaVencimiento,
        tieneLectura: !!lectura
      };
    });

    // KPIs
    const facturaPromedio =
      facturasFiltradas.reduce((sum, f) => sum + f.valorTotal, 0) /
      facturasFiltradas.length;

    const consumoPromedio =
      facturasFiltradas.reduce((sum, f) => sum + (f.consumoPeriodo || 0), 0) /
      facturasFiltradas.length;

    const totalConsumo = facturasFiltradas.reduce(
      (sum, f) => sum + (f.consumoPeriodo || 0),
      0
    );
    const totalValor = facturasFiltradas.reduce(
      (sum, f) => sum + f.valorTotal,
      0
    );
    const costoPromedioKwh = totalConsumo > 0 ? totalValor / totalConsumo : 0;

    // Total año actual
    const anoActual = new Date().getFullYear().toString();
    const totalAnoActual = facturasOrdenadas
      .filter(f => extraerAno(f.periodo) === anoActual)
      .reduce((sum, f) => sum + f.valorTotal, 0);

    // Variación vs mes anterior
    let variacionMesAnterior = 0;
    if (facturasOrdenadas.length >= 2) {
      const ultimaFactura = facturasOrdenadas[facturasOrdenadas.length - 1];
      const penultimaFactura = facturasOrdenadas[facturasOrdenadas.length - 2];
      variacionMesAnterior =
        ((ultimaFactura.valorTotal - penultimaFactura.valorTotal) /
          penultimaFactura.valorTotal) *
        100;
    }

    // Datos para costo por kWh
    const datosCostoPorKwh = datosCorrelacionados
      .filter(d => d.consumoPeriodo > 0)
      .map(d => ({
        periodo: d.periodo,
        costoPorKwh: d.valorTotal / d.consumoPeriodo,
        costoPromedio: costoPromedioKwh
      }));

    // Datos para scatter plot
    const datosScatter = datosCorrelacionados
      .filter(d => d.consumoPeriodo > 0)
      .map(d => ({
        consumoPeriodo: d.consumoPeriodo,
        valorTotal: d.valorTotal,
        periodo: d.periodo
      }));

    // Comparativa mensual
    let comparativaMensual = null;
    if (facturasOrdenadas.length > 0) {
      const ultimaFactura = facturasOrdenadas[facturasOrdenadas.length - 1];
      const mesActual = extraerMes(ultimaFactura.periodo);
      const anoActual = extraerAno(ultimaFactura.periodo);

      // vs Promedio histórico
      const variacionPromedio =
        ((ultimaFactura.valorTotal - facturaPromedio) / facturaPromedio) * 100;

      // vs Mismo mes año anterior
      const anoAnterior = (parseInt(anoActual) - 1).toString();
      const periodoAnoPasado = mesActual + anoAnterior;
      const facturaAnoPasado = facturasOrdenadas.find(
        f => f.periodo === periodoAnoPasado
      );
      let variacionAnoPasado = null;
      if (facturaAnoPasado) {
        variacionAnoPasado =
          ((ultimaFactura.valorTotal - facturaAnoPasado.valorTotal) /
            facturaAnoPasado.valorTotal) *
          100;
      }

      // Eficiencia energética (costo/kWh actual vs promedio)
      const costoKwhActual =
        ultimaFactura.consumoPeriodo > 0
          ? ultimaFactura.valorTotal / ultimaFactura.consumoPeriodo
          : 0;
      const variacionEficiencia =
        costoPromedioKwh > 0
          ? ((costoKwhActual - costoPromedioKwh) / costoPromedioKwh) * 100
          : 0;

      comparativaMensual = {
        actual: ultimaFactura.valorTotal,
        promedio: facturaPromedio,
        variacionPromedio,
        anoPasado: facturaAnoPasado?.valorTotal || null,
        variacionAnoPasado,
        costoKwhActual,
        costoKwhPromedio: costoPromedioKwh,
        variacionEficiencia
      };
    }

    // Heatmap de eficiencia - Filtrado por mes seleccionado
    const heatmapData: any[] = [];
    const metricas = [
      { key: 'valorTotal', label: 'Valor Total' },
      { key: 'consumo', label: 'Consumo' },
      { key: 'costoKwh', label: 'Costo/kWh' },
      { key: 'iva', label: 'IVA' }
    ];

    // Filtrar datos por mes seleccionado para heatmap
    const datosDelMes = datosCorrelacionados.filter(
      d => parseInt(d.mes) === mesHeatmap
    );

    // Calcular min/max por métrica solo para el mes seleccionado
    const minMax: Record<string, { min: number; max: number }> = {};
    metricas.forEach(metrica => {
      const valores = datosDelMes
        .map(d => {
          if (metrica.key === 'valorTotal') return d.valorTotal;
          if (metrica.key === 'consumo') return d.consumoPeriodo;
          if (metrica.key === 'costoKwh')
            return d.consumoPeriodo > 0 ? d.valorTotal / d.consumoPeriodo : 0;
          if (metrica.key === 'iva') return d.iva;
          return 0;
        })
        .filter(v => v > 0);

      if (valores.length > 0) {
        minMax[metrica.key] = {
          min: Math.min(...valores),
          max: Math.max(...valores)
        };
      } else {
        minMax[metrica.key] = { min: 0, max: 1 };
      }
    });

    datosDelMes.forEach(dato => {
      const fila: any = {
        periodo: dato.periodo,
        ano: dato.ano,
        periodoDisplay: dato.periodoDisplay
      };

      metricas.forEach(metrica => {
        let valor = 0;
        if (metrica.key === 'valorTotal') valor = dato.valorTotal;
        else if (metrica.key === 'consumo') valor = dato.consumoPeriodo;
        else if (metrica.key === 'costoKwh')
          valor =
            dato.consumoPeriodo > 0 ? dato.valorTotal / dato.consumoPeriodo : 0;
        else if (metrica.key === 'iva') valor = dato.iva;

        const { min, max } = minMax[metrica.key];
        const normalizado =
          max > min ? ((valor - min) / (max - min)) * 100 : 50;

        fila[metrica.key] = {
          valor,
          normalizado,
          color: getHeatColor(normalizado)
        };
      });

      heatmapData.push(fila);
    });

    return {
      facturasValidas: facturasFiltradas,
      facturaPromedio,
      consumoPromedio,
      costoPromedioKwh,
      totalAnoActual,
      variacionMesAnterior,
      datosCorrelacionados,
      datosCostoPorKwh,
      datosScatter,
      comparativaMensual,
      heatmapData
    };
  }, [
    detalleFacturas,
    detalleLecturas,
    tipoVista,
    timeRange,
    anoSeleccionado,
    mesSeleccionado,
    mesHeatmap
  ]);

  const chartConfig = {
    valorTotal: {
      label: 'Valor Total',
      color: '#10b981'
    },
    valorNeto: {
      label: 'Valor Neto',
      color: '#0891b2'
    },
    iva: {
      label: 'IVA',
      color: '#dc2626'
    },
    consumoPeriodo: {
      label: 'Consumo',
      color: '#3b82f6'
    },
    costoPorKwh: {
      label: 'Costo/kWh',
      color: '#f59e0b'
    }
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header con selector de tipo de vista y filtros */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h2 className='text-xl font-semibold flex items-center gap-2'>
              <DollarSign className='h-5 w-5 text-emerald-600' />
              Dashboard Financiero
            </h2>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Análisis económico y correlación consumo-costo
            </p>
          </div>

          {/* Selector de tipo de vista */}
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant={tipoVista === 'general' ? 'default' : 'outline'}
              onClick={() => setTipoVista('general')}
              className='text-xs'
            >
              General
            </Button>
            <Button
              size='sm'
              variant={tipoVista === 'ano' ? 'default' : 'outline'}
              onClick={() => setTipoVista('ano')}
              className='text-xs'
            >
              Por Año
            </Button>
            <Button
              size='sm'
              variant={tipoVista === 'mes' ? 'default' : 'outline'}
              onClick={() => setTipoVista('mes')}
              className='text-xs'
            >
              Por Mes
            </Button>
          </div>
        </div>

        {/* Filtros según tipo de vista */}
        <div className='flex flex-wrap items-center gap-2'>
          {tipoVista === 'general' && (
            <div className='flex gap-2'>
              <span className='text-xs text-slate-600 dark:text-slate-400 py-2'>
                Rango:
              </span>
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
          )}

          {tipoVista === 'ano' && anosDisponibles.length > 0 && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-slate-600 dark:text-slate-400'>
                Año:
              </span>
              <select
                value={anoSeleccionado}
                onChange={e => setAnoSeleccionado(e.target.value)}
                className='text-xs border rounded px-3 py-1.5 bg-background'
              >
                {anosDisponibles.map(ano => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipoVista === 'mes' && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-slate-600 dark:text-slate-400'>
                Mes:
              </span>
              <select
                value={mesSeleccionado}
                onChange={e => setMesSeleccionado(parseInt(e.target.value))}
                className='text-xs border rounded px-3 py-1.5 bg-background'
              >
                <option value={1}>Enero</option>
                <option value={2}>Febrero</option>
                <option value={3}>Marzo</option>
                <option value={4}>Abril</option>
                <option value={5}>Mayo</option>
                <option value={6}>Junio</option>
                <option value={7}>Julio</option>
                <option value={8}>Agosto</option>
                <option value={9}>Septiembre</option>
                <option value={10}>Octubre</option>
                <option value={11}>Noviembre</option>
                <option value={12}>Diciembre</option>
              </select>
              <span className='text-xs text-slate-500 dark:text-slate-500 italic'>
                (muestra todos los años disponibles para este mes)
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* KPIs */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Factura Promedio */}
        <Card className='border bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                  Factura Promedio
                </p>
                <p className='text-2xl font-bold text-emerald-900 dark:text-emerald-100'>
                  $
                  {dashboardData.facturaPromedio.toLocaleString('es-CL', {
                    maximumFractionDigits: 0
                  })}
                </p>
                <p className='text-xs text-emerald-600 dark:text-emerald-400'>
                  por período
                </p>
              </div>
              <DollarSign className='h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50' />
            </div>
          </CardContent>
        </Card>

        {/* Consumo Promedio */}
        <Card className='border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-blue-700 dark:text-blue-300'>
                  Consumo Promedio
                </p>
                <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                  {dashboardData.consumoPromedio.toLocaleString('es-CL', {
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

        {/* Costo Promedio/kWh */}
        <Card className='border bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-amber-700 dark:text-amber-300'>
                  Costo Promedio/kWh
                </p>
                <p className='text-2xl font-bold text-amber-900 dark:text-amber-100'>
                  ${dashboardData.costoPromedioKwh.toFixed(2)}
                </p>
                <p className='text-xs text-amber-600 dark:text-amber-400'>
                  por kilowatt-hora
                </p>
              </div>
              <Zap className='h-8 w-8 text-amber-600 dark:text-amber-400 opacity-50' />
            </div>
          </CardContent>
        </Card>

        {/* Total Año Actual */}
        <Card className='border bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-violet-700 dark:text-violet-300'>
                  Total Año {new Date().getFullYear()}
                </p>
                <p className='text-2xl font-bold text-violet-900 dark:text-violet-100'>
                  $
                  {dashboardData.totalAnoActual.toLocaleString('es-CL', {
                    maximumFractionDigits: 0
                  })}
                </p>
                <div className='flex items-center gap-1 mt-1'>
                  {dashboardData.variacionMesAnterior !== 0 && (
                    <>
                      {dashboardData.variacionMesAnterior > 0 ? (
                        <TrendingUp className='h-3 w-3 text-rose-600' />
                      ) : (
                        <TrendingDown className='h-3 w-3 text-emerald-600' />
                      )}
                      <Badge
                        variant={
                          dashboardData.variacionMesAnterior > 0
                            ? 'destructive'
                            : 'default'
                        }
                        className='text-xs'
                      >
                        {dashboardData.variacionMesAnterior > 0 ? '+' : ''}
                        {dashboardData.variacionMesAnterior.toFixed(1)}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <Calendar className='h-8 w-8 text-violet-600 dark:text-violet-400 opacity-50' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas 1 y 2 - Grid 2 columnas */}
      <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
        {/* Gráfica 1: Consumo vs Facturación (Dual Axis) */}
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base'>
              1. Consumo vs Facturación
            </CardTitle>
            <CardDescription>
              Correlación entre consumo eléctrico y costo facturado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart data={dashboardData.datosCorrelacionados}>
                  <XAxis
                    dataKey='periodoDisplay'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis
                    yAxisId='left'
                    orientation='left'
                    stroke='#3b82f6'
                    fontSize={11}
                  />
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    stroke='#10b981'
                    fontSize={11}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    yAxisId='left'
                    dataKey='consumoPeriodo'
                    fill='#3b82f6'
                    radius={[4, 4, 0, 0]}
                    name='Consumo (kWh)'
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='valorTotal'
                    stroke='#10b981'
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name='Valor ($)'
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfica 2: Evolución de Facturación */}
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base flex items-center justify-between'>
              <span>2. Evolución de Facturación</span>
              <div className='flex gap-1'>
                <Button
                  size='sm'
                  variant={vistaEvolucion === 'total' ? 'default' : 'outline'}
                  onClick={() => setVistaEvolucion('total')}
                  className='text-xs h-7'
                >
                  Total
                </Button>
                <Button
                  size='sm'
                  variant={vistaEvolucion === 'neto' ? 'default' : 'outline'}
                  onClick={() => setVistaEvolucion('neto')}
                  className='text-xs h-7'
                >
                  Neto
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Tendencia histórica del gasto eléctrico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={dashboardData.datosCorrelacionados}>
                  <XAxis
                    dataKey='periodoDisplay'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={value => [
                      `$${Number(value).toLocaleString('es-CL')}`,
                      vistaEvolucion === 'total' ? 'Valor Total' : 'Valor Neto'
                    ]}
                  />
                  <defs>
                    <linearGradient
                      id='gradientValor'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type='monotone'
                    dataKey={
                      vistaEvolucion === 'total' ? 'valorTotal' : 'valorNeto'
                    }
                    stroke='#10b981'
                    strokeWidth={2}
                    fill='url(#gradientValor)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas 3 y 4 - Grid 2 columnas */}
      <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
        {/* Gráfica 3: Composición de Factura */}
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base'>
              3. Composición de Factura
            </CardTitle>
            <CardDescription>
              Desglose entre valor neto e impuestos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={dashboardData.datosCorrelacionados}>
                  <XAxis
                    dataKey='periodoDisplay'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString('es-CL')}`,
                      name === 'valorNeto' ? 'Valor Neto' : 'IVA'
                    ]}
                  />
                  <Bar
                    dataKey='valorNeto'
                    fill='#0891b2'
                    stackId='a'
                    radius={[0, 0, 4, 4]}
                    name='Valor Neto'
                  />
                  <Bar
                    dataKey='iva'
                    fill='#dc2626'
                    stackId='a'
                    radius={[4, 4, 0, 0]}
                    name='IVA'
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfica 4: Costo por kWh */}
        <Card className='border bg-background'>
          <CardHeader>
            <CardTitle className='text-base'>4. Costo por kWh</CardTitle>
            <CardDescription>
              Variación del costo unitario de energía
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={dashboardData.datosCostoPorKwh.map(d => ({
                    ...d,
                    periodoDisplay:
                      dashboardData.datosCorrelacionados.find(
                        dc => dc.periodo === d.periodo
                      )?.periodoDisplay || d.periodo
                  }))}
                >
                  <XAxis
                    dataKey='periodoDisplay'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(2)}`,
                      name === 'costoPorKwh' ? 'Costo Real' : 'Promedio'
                    ]}
                  />
                  <Line
                    type='monotone'
                    dataKey='costoPorKwh'
                    stroke='#f59e0b'
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 3 }}
                    name='Costo Real'
                  />
                  <Line
                    type='monotone'
                    dataKey='costoPromedio'
                    stroke='#10b981'
                    strokeWidth={2}
                    strokeDasharray='5 5'
                    dot={false}
                    name='Promedio'
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica 5: Scatter Plot */}
      <Card className='border bg-background'>
        <CardHeader>
          <CardTitle className='text-base'>
            5. Análisis de Correlación Consumo-Costo
          </CardTitle>
          <CardDescription>
            Detecta patrones y anomalías en la relación consumo vs facturación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='h-[350px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <ScatterChart>
                <XAxis
                  type='number'
                  dataKey='consumoPeriodo'
                  name='Consumo'
                  unit=' kWh'
                  fontSize={11}
                />
                <YAxis
                  type='number'
                  dataKey='valorTotal'
                  name='Valor'
                  unit=' $'
                  fontSize={11}
                />
                <ZAxis range={[60, 60]} />
                <ChartTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className='rounded-lg border bg-background p-2 shadow-sm'>
                          <div className='grid gap-2'>
                            <div className='font-medium'>{data.periodo}</div>
                            <div className='text-xs text-slate-600 dark:text-slate-400'>
                              Consumo: {data.consumoPeriodo.toLocaleString()}{' '}
                              kWh
                            </div>
                            <div className='text-xs text-slate-600 dark:text-slate-400'>
                              Valor: ${data.valorTotal.toLocaleString('es-CL')}
                            </div>
                            <div className='text-xs text-slate-600 dark:text-slate-400'>
                              Costo/kWh: $
                              {(data.valorTotal / data.consumoPeriodo).toFixed(
                                2
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={dashboardData.datosScatter}
                  fill='#8b5cf6'
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfica 6: Comparativa Mensual */}
      {dashboardData.comparativaMensual && (
        <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
          {/* Card 1: vs Promedio Histórico */}
          <Card className='border bg-background'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium'>
                vs Promedio Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-baseline justify-between'>
                  <span className='text-xs text-slate-600 dark:text-slate-400'>
                    Período actual
                  </span>
                  <span className='text-lg font-bold'>
                    $
                    {dashboardData.comparativaMensual.actual.toLocaleString(
                      'es-CL'
                    )}
                  </span>
                </div>
                <div className='flex items-baseline justify-between'>
                  <span className='text-xs text-slate-600 dark:text-slate-400'>
                    Promedio histórico
                  </span>
                  <span className='text-sm'>
                    $
                    {dashboardData.comparativaMensual.promedio.toLocaleString(
                      'es-CL',
                      { maximumFractionDigits: 0 }
                    )}
                  </span>
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium'>Variación</span>
                  <Badge
                    variant={
                      dashboardData.comparativaMensual.variacionPromedio > 0
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {dashboardData.comparativaMensual.variacionPromedio > 0
                      ? '+'
                      : ''}
                    {dashboardData.comparativaMensual.variacionPromedio.toFixed(
                      1
                    )}
                    %
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: vs Mismo Mes Año Anterior */}
          <Card className='border bg-background'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium'>
                vs Año Anterior
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.comparativaMensual.anoPasado ? (
                <div className='space-y-2'>
                  <div className='flex items-baseline justify-between'>
                    <span className='text-xs text-slate-600 dark:text-slate-400'>
                      Este año
                    </span>
                    <span className='text-lg font-bold'>
                      $
                      {dashboardData.comparativaMensual.actual.toLocaleString(
                        'es-CL'
                      )}
                    </span>
                  </div>
                  <div className='flex items-baseline justify-between'>
                    <span className='text-xs text-slate-600 dark:text-slate-400'>
                      Año pasado
                    </span>
                    <span className='text-sm'>
                      $
                      {dashboardData.comparativaMensual.anoPasado!.toLocaleString(
                        'es-CL'
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-medium'>Variación</span>
                    <div className='flex items-center gap-1'>
                      {dashboardData.comparativaMensual.variacionAnoPasado! >
                      0 ? (
                        <TrendingUp className='h-4 w-4 text-rose-600' />
                      ) : (
                        <TrendingDown className='h-4 w-4 text-emerald-600' />
                      )}
                      <Badge
                        variant={
                          dashboardData.comparativaMensual.variacionAnoPasado! >
                          0
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {dashboardData.comparativaMensual.variacionAnoPasado! >
                        0
                          ? '+'
                          : ''}
                        {dashboardData.comparativaMensual.variacionAnoPasado!.toFixed(
                          1
                        )}
                        %
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center h-full text-center py-4'>
                  <AlertCircle className='h-8 w-8 text-slate-400 mb-2' />
                  <p className='text-xs text-slate-600 dark:text-slate-400'>
                    No hay datos del año anterior
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Eficiencia Energética */}
          <Card className='border bg-background'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium'>
                Eficiencia Energética
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-baseline justify-between'>
                  <span className='text-xs text-slate-600 dark:text-slate-400'>
                    Costo/kWh actual
                  </span>
                  <span className='text-lg font-bold'>
                    $
                    {dashboardData.comparativaMensual.costoKwhActual.toFixed(2)}
                  </span>
                </div>
                <div className='flex items-baseline justify-between'>
                  <span className='text-xs text-slate-600 dark:text-slate-400'>
                    Promedio histórico
                  </span>
                  <span className='text-sm'>
                    $
                    {dashboardData.comparativaMensual.costoKwhPromedio.toFixed(
                      2
                    )}
                  </span>
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium'>Eficiencia</span>
                  <Badge
                    variant={
                      dashboardData.comparativaMensual.variacionEficiencia > 0
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {dashboardData.comparativaMensual.variacionEficiencia > 0
                      ? '+'
                      : ''}
                    {dashboardData.comparativaMensual.variacionEficiencia.toFixed(
                      1
                    )}
                    %
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfica 7: Heatmap de Eficiencia */}
      <Card className='border bg-background'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-base'>
                7. Heatmap de Eficiencia
              </CardTitle>
              <CardDescription>
                Comparativa histórica de métricas por año
              </CardDescription>
            </div>
            <div className='flex gap-1'>
              <select
                value={mesHeatmap}
                onChange={e => setMesHeatmap(parseInt(e.target.value))}
                className='text-xs border rounded px-2 py-1 bg-background'
              >
                <option value={1}>Enero</option>
                <option value={2}>Febrero</option>
                <option value={3}>Marzo</option>
                <option value={4}>Abril</option>
                <option value={5}>Mayo</option>
                <option value={6}>Junio</option>
                <option value={7}>Julio</option>
                <option value={8}>Agosto</option>
                <option value={9}>Septiembre</option>
                <option value={10}>Octubre</option>
                <option value={11}>Noviembre</option>
                <option value={12}>Diciembre</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dashboardData.heatmapData.length > 0 ? (
            <div className='space-y-4'>
              <div className='overflow-x-auto'>
                <div className='inline-block min-w-full'>
                  {/* Headers */}
                  <div className='grid grid-cols-5 gap-2 mb-2'>
                    <div className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                      Año
                    </div>
                    <div className='text-xs font-medium text-slate-600 dark:text-slate-400 text-center'>
                      Valor Total
                    </div>
                    <div className='text-xs font-medium text-slate-600 dark:text-slate-400 text-center'>
                      Consumo
                    </div>
                    <div className='text-xs font-medium text-slate-600 dark:text-slate-400 text-center'>
                      Costo/kWh
                    </div>
                    <div className='text-xs font-medium text-slate-600 dark:text-slate-400 text-center'>
                      IVA
                    </div>
                  </div>

                  {/* Rows */}
                  {dashboardData.heatmapData.map(row => (
                    <div
                      key={row.periodo}
                      className='grid grid-cols-5 gap-2 mb-1'
                    >
                      <div className='text-xs py-2 font-medium'>{row.ano}</div>
                      <div
                        className='rounded text-xs text-center py-2 font-medium text-white'
                        style={{ backgroundColor: row.valorTotal.color }}
                        title={`$${row.valorTotal.valor.toLocaleString('es-CL')}`}
                      >
                        $
                        {row.valorTotal.valor.toLocaleString('es-CL', {
                          maximumFractionDigits: 0
                        })}
                      </div>
                      <div
                        className='rounded text-xs text-center py-2 font-medium text-white'
                        style={{ backgroundColor: row.consumo.color }}
                        title={`${row.consumo.valor.toLocaleString('es-CL')} kWh`}
                      >
                        {row.consumo.valor.toLocaleString('es-CL', {
                          maximumFractionDigits: 0
                        })}
                      </div>
                      <div
                        className='rounded text-xs text-center py-2 font-medium text-white'
                        style={{ backgroundColor: row.costoKwh.color }}
                        title={`$${row.costoKwh.valor.toFixed(2)}`}
                      >
                        ${row.costoKwh.valor.toFixed(2)}
                      </div>
                      <div
                        className='rounded text-xs text-center py-2 font-medium text-white'
                        style={{ backgroundColor: row.iva.color }}
                        title={`$${row.iva.valor.toLocaleString('es-CL')}`}
                      >
                        $
                        {row.iva.valor.toLocaleString('es-CL', {
                          maximumFractionDigits: 0
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leyenda */}
              <div className='flex items-center justify-center gap-2 pt-4 border-t'>
                <span className='text-xs text-slate-600 dark:text-slate-400'>
                  Bajo
                </span>
                {[0, 30, 50, 70, 90].map(nivel => (
                  <div
                    key={nivel}
                    className='w-6 h-4 rounded'
                    style={{ backgroundColor: getHeatColor(nivel) }}
                  />
                ))}
                <span className='text-xs text-slate-600 dark:text-slate-400'>
                  Alto
                </span>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-[200px] text-center'>
              <AlertCircle className='h-12 w-12 text-slate-400 mb-3' />
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

export default FacturasDashboard;
