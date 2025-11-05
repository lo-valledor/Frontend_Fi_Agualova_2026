import { memo, useMemo, useState } from 'react';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import type { DetalleFacturas } from '~/types/reportes';

import { formatCurrency } from './billing-dashboard';

interface BillingEvolutionChartProps {
  facturas: Array<
    DetalleFacturas & { consumoPeriodo: number; costoPorKwh: number }
  >;
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

const BillingEvolutionChart = memo(function BillingEvolutionChart({
  facturas
}: BillingEvolutionChartProps) {
  const [timeRange, setTimeRange] = useState<'6m' | '1a' | '2a' | 'todo'>(
    'todo'
  );

  // Filtrar por rango temporal
  const facturasFiltradas = useMemo(() => {
    if (timeRange === 'todo') return facturas;

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1a':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case '2a':
        cutoffDate.setFullYear(now.getFullYear() - 2);
        break;
    }

    return facturas.filter(f => {
      const { mes, ano } = extraerAnoMes(f.periodo);
      const fecha = new Date(parseInt(ano), Number.parseInt(mes) - 1, 1);
      return fecha >= cutoffDate;
    });
  }, [facturas, timeRange]);

  // Calcular promedio móvil de 3 meses
  const calcularPromedioMovil = (index: number): number => {
    if (index < 2) return 0;
    const ultimos3 = facturasFiltradas.slice(index - 2, index + 1);
    return (
      ultimos3.reduce((sum, f) => sum + (f.valorTotal || 0), 0) /
      ultimos3.length
    );
  };

  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    return facturasFiltradas.map((f, index) => {
      const { mes, ano } = extraerAnoMes(f.periodo);
      return {
        periodo: f.periodo,
        periodoDisplay: `${getNombreMes(mes)} ${ano}`,
        valorNeto: f.valorNeto || 0,
        iva: f.iva || 0,
        valorTotal: f.valorTotal || 0,
        promedioMovil: calcularPromedioMovil(index),
        consumo: f.consumoPeriodo || 0,
        costoPorKwh: f.costoPorKwh || 0,
        nroFactura: f.nroFactura,
        fechaEmision: new Date(f.fechaEmision).toLocaleDateString('es-CL')
      };
    });
  }, [facturasFiltradas]);

  const chartConfig = {
    valorNeto: {
      label: 'Valor Neto',
      color: '#3b82f6'
    },
    iva: {
      label: 'IVA',
      color: '#10b981'
    },
    valorTotal: {
      label: 'Valor Total',
      color: '#8b5cf6'
    },
    promedioMovil: {
      label: 'Promedio Móvil 3M',
      color: '#64748b'
    }
  };

  return (
    <Card className='border bg-background'>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <CardTitle className='text-base'>
              Evolución de Facturación
            </CardTitle>
            <CardDescription>
              Análisis histórico de valores netos, IVA y totales
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            {(['6m', '1a', '2a', 'todo'] as const).map(range => (
              <Button
                key={range}
                size='sm'
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
                className='text-xs h-8'
              >
                {range === '6m'
                  ? '6M'
                  : range === '1a'
                    ? '1A'
                    : range === '2a'
                      ? '2A'
                      : 'Todo'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[400px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chartData}>
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
                tickFormatter={value => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='rounded-lg border bg-background p-3 shadow-md'>
                        <div className='space-y-2'>
                          <div className='font-medium text-sm border-b pb-2'>
                            {data.periodoDisplay}
                          </div>
                          <div className='text-xs space-y-1'>
                            <div className='flex items-center justify-between gap-4'>
                              <span className='text-slate-600 dark:text-slate-400'>
                                Factura:
                              </span>
                              <span className='font-medium'>
                                {data.nroFactura}
                              </span>
                            </div>
                            <div className='flex items-center justify-between gap-4'>
                              <span className='text-slate-600 dark:text-slate-400'>
                                Emisión:
                              </span>
                              <span className='font-medium text-xs'>
                                {data.fechaEmision}
                              </span>
                            </div>
                            <div className='flex items-center justify-between gap-4 pt-1 border-t'>
                              <span className='text-blue-600 font-medium'>
                                Valor Neto:
                              </span>
                              <span className='font-medium'>
                                {formatCurrency(data.valorNeto)}
                              </span>
                            </div>
                            <div className='flex items-center justify-between gap-4'>
                              <span className='text-emerald-600 font-medium'>
                                IVA (19%):
                              </span>
                              <span className='font-medium'>
                                {formatCurrency(data.iva)}
                              </span>
                            </div>
                            <div className='flex items-center justify-between gap-4 pt-1 border-t'>
                              <span className='text-violet-600 font-bold'>
                                Total:
                              </span>
                              <span className='font-bold'>
                                {formatCurrency(data.valorTotal)}
                              </span>
                            </div>
                            <div className='flex items-center justify-between gap-4 pt-1 border-t'>
                              <span className='text-slate-600 dark:text-slate-400'>
                                Consumo:
                              </span>
                              <span className='font-medium'>
                                {data.consumo.toLocaleString('es-CL')} kWh
                              </span>
                            </div>
                            <div className='flex items-center justify-between gap-4'>
                              <span className='text-slate-600 dark:text-slate-400'>
                                Costo/kWh:
                              </span>
                              <span className='font-medium'>
                                ${data.costoPorKwh.toFixed(0)}
                              </span>
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
                  if (value === 'valorNeto') return 'Valor Neto';
                  if (value === 'iva') return 'IVA';
                  if (value === 'valorTotal') return 'Valor Total';
                  if (value === 'promedioMovil') return 'Promedio Móvil 3M';
                  return value;
                }}
              />

              {/* Áreas apiladas */}
              <defs>
                <linearGradient id='colorValorNeto' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id='colorIva' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <Area
                type='monotone'
                dataKey='valorNeto'
                stackId='1'
                stroke='#3b82f6'
                strokeWidth={2}
                fill='url(#colorValorNeto)'
                name='Valor Neto'
              />
              <Area
                type='monotone'
                dataKey='iva'
                stackId='1'
                stroke='#10b981'
                strokeWidth={2}
                fill='url(#colorIva)'
                name='IVA'
              />

              {/* Línea de valor total */}
              <Line
                type='monotone'
                dataKey='valorTotal'
                stroke='#8b5cf6'
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name='Valor Total'
              />

              {/* Línea de promedio móvil */}
              {chartData.some(d => d.promedioMovil > 0) && (
                <Line
                  type='monotone'
                  dataKey='promedioMovil'
                  stroke='#64748b'
                  strokeWidth={2}
                  strokeDasharray='5 5'
                  dot={false}
                  name='Promedio Móvil 3M'
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});

export default BillingEvolutionChart;
