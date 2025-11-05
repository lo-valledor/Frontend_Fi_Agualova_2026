import { AlertTriangle, TrendingUp } from 'lucide-react';

import { memo, useMemo } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import type { DetalleLecturas } from '~/types/reportes';

interface OverconsumptionAnalysisProps {
  detalleLecturas: DetalleLecturas[];
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
  const mesNum = Number.parseInt(mes, 10);
  return meses[mesNum - 1] || mes;
};

const OverconsumptionAnalysis = memo(function OverconsumptionAnalysis({
  detalleLecturas
}: OverconsumptionAnalysisProps) {
  // Procesar datos para análisis
  const analysisData = useMemo(() => {
    if (detalleLecturas.length === 0) {
      return {
        chartData: [],
        totalSobreconsumo: 0,
        totalEnergiaBase: 0,
        porcentajeSobreconsumo: 0,
        periodoMasProblematico: null
      };
    }

    // Datos para el gráfico de barras apiladas
    const chartData = detalleLecturas.map(l => {
      const { mes, ano } = extraerAnoMes(l.periodo);
      return {
        periodo: l.periodo,
        periodoDisplay: `${getNombreMes(mes)} ${ano}`,
        energiaBase: l.energiaBase || 0,
        sobreconsumo: l.sobreconsumo || 0,
        consumoTotal: l.consumoPeriodo || 0
      };
    });

    // Calcular totales
    const totalSobreconsumo = detalleLecturas.reduce(
      (sum, l) => sum + (l.sobreconsumo || 0),
      0
    );
    const totalEnergiaBase = detalleLecturas.reduce(
      (sum, l) => sum + (l.energiaBase || 0),
      0
    );
    const totalConsumo = totalEnergiaBase + totalSobreconsumo;
    const porcentajeSobreconsumo =
      totalConsumo > 0 ? (totalSobreconsumo / totalConsumo) * 100 : 0;

    // Encontrar el periodo más problemático
    const periodoMasProblematico = [...detalleLecturas].sort(
      (a, b) => (b.sobreconsumo || 0) - (a.sobreconsumo || 0)
    )[0];

    return {
      chartData,
      totalSobreconsumo,
      totalEnergiaBase,
      porcentajeSobreconsumo,
      periodoMasProblematico
    };
  }, [detalleLecturas]);

  const chartConfig = {
    energiaBase: {
      label: 'Energía Base',
      color: '#10b981'
    },
    sobreconsumo: {
      label: 'Sobreconsumo',
      color: '#ef4444'
    }
  };

  if (detalleLecturas.length === 0) {
    return (
      <Card className='border bg-background'>
        <CardHeader>
          <CardTitle className='text-base'>Análisis de Sobreconsumo</CardTitle>
          <CardDescription>
            No hay periodos con sobreconsumo registrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center h-[300px] text-center'>
            <AlertTriangle className='h-12 w-12 text-slate-400 mb-3' />
            <p className='text-slate-600 dark:text-slate-400'>
              No se detectaron sobreconsumoss en los periodos analizados
            </p>
            <p className='text-sm text-slate-500 dark:text-slate-500 mt-1'>
              Todos los consumos están dentro de la energía base contratada
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* KPIs de Sobreconsumo */}
      <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
        <Card className='border bg-background'>
          <CardContent className='pt-4'>
            <div className='space-y-2'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                Total Sobreconsumo
              </p>
              <p className='text-2xl font-bold text-rose-600'>
                {analysisData.totalSobreconsumo.toLocaleString('es-CL')} kWh
              </p>
              <Badge variant='destructive'>
                {analysisData.porcentajeSobreconsumo.toFixed(1)}% del consumo
                total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className='border bg-background'>
          <CardContent className='pt-4'>
            <div className='space-y-2'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                Periodo Más Problemático
              </p>
              <p className='text-2xl font-bold'>
                {analysisData.periodoMasProblematico?.periodo || 'N/A'}
              </p>
              <p className='text-sm text-rose-600'>
                {(
                  analysisData.periodoMasProblematico?.sobreconsumo || 0
                ).toLocaleString('es-CL')}{' '}
                kWh excedido
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border bg-background'>
          <CardContent className='pt-4'>
            <div className='space-y-2'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                Periodos Afectados
              </p>
              <p className='text-2xl font-bold'>{detalleLecturas.length}</p>
              <div className='flex items-center gap-1 text-xs text-rose-600'>
                <TrendingUp className='h-3 w-3' />
                <span>Requiere atención</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras Apiladas */}
      <Card className='border bg-background'>
        <CardHeader>
          <CardTitle className='text-base'>
            Distribución Energía Base vs Sobreconsumo
          </CardTitle>
          <CardDescription>
            Análisis visual de la proporción de sobreconsumo en cada periodo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='h-[400px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={analysisData.chartData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='stroke-slate-200 dark:stroke-slate-800'
                />
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
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value => `${value} kWh`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const porcentajeSobre =
                        data.consumoTotal > 0
                          ? (data.sobreconsumo / data.consumoTotal) * 100
                          : 0;

                      return (
                        <div className='rounded-lg border bg-background p-3 shadow-md'>
                          <div className='space-y-2'>
                            <div className='font-medium text-sm border-b pb-2'>
                              {data.periodoDisplay}
                            </div>
                            <div className='text-xs space-y-1'>
                              <div className='flex items-center justify-between gap-4'>
                                <span className='text-emerald-600 font-medium'>
                                  Energía Base:
                                </span>
                                <span className='font-medium'>
                                  {data.energiaBase.toLocaleString('es-CL')} kWh
                                </span>
                              </div>
                              <div className='flex items-center justify-between gap-4'>
                                <span className='text-rose-600 font-medium'>
                                  Sobreconsumo:
                                </span>
                                <span className='font-medium'>
                                  {data.sobreconsumo.toLocaleString('es-CL')}{' '}
                                  kWh
                                </span>
                              </div>
                              <div className='flex items-center justify-between gap-4 pt-1 border-t'>
                                <span className='text-slate-600 dark:text-slate-400'>
                                  Total:
                                </span>
                                <span className='font-bold'>
                                  {data.consumoTotal.toLocaleString('es-CL')}{' '}
                                  kWh
                                </span>
                              </div>
                              <div className='flex items-center justify-between gap-4'>
                                <span className='text-slate-600 dark:text-slate-400'>
                                  % Sobreconsumo:
                                </span>
                                <Badge
                                  variant='destructive'
                                  className='text-xs'
                                >
                                  {porcentajeSobre.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={value => {
                    if (value === 'energiaBase') return 'Energía Base';
                    if (value === 'sobreconsumo') return 'Sobreconsumo';
                    return value;
                  }}
                />

                {/* Barras apiladas */}
                <Bar
                  dataKey='energiaBase'
                  stackId='a'
                  fill='#10b981'
                  radius={[0, 0, 4, 4]}
                  name='Energía Base'
                />
                <Bar
                  dataKey='sobreconsumo'
                  stackId='a'
                  fill='#ef4444'
                  radius={[4, 4, 0, 0]}
                  name='Sobreconsumo'
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Recomendaciones */}
          <div className='mt-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5' />
              <div className='space-y-1'>
                <p className='text-sm font-medium text-rose-900 dark:text-rose-100'>
                  Recomendaciones para reducir el sobreconsumo:
                </p>
                <ul className='text-xs text-rose-700 dark:text-rose-300 space-y-1 list-disc list-inside'>
                  <li>
                    Revisar equipos de alto consumo en los meses identificados
                  </li>
                  <li>
                    Considerar ajustar el límite de energía base contratada
                  </li>
                  <li>Implementar medidas de eficiencia energética</li>
                  <li>Monitorear patrones de consumo en tiempo real</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default OverconsumptionAnalysis;
