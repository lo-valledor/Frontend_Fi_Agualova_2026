import { memo, useMemo } from 'react';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

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

interface CostDistributionProps {
  facturas: Array<
    DetalleFacturas & { consumoPeriodo: number; costoPorKwh: number }
  >;
}

const CostDistribution = memo(function CostDistribution({
  facturas
}: CostDistributionProps) {
  const distributionData = useMemo(() => {
    const totalValorNeto = facturas.reduce(
      (sum, f) => sum + (f.valorNeto || 0),
      0
    );
    const totalIva = facturas.reduce((sum, f) => sum + (f.iva || 0), 0);
    const total = totalValorNeto + totalIva;

    return {
      data: [
        {
          name: 'Valor Neto',
          value: totalValorNeto,
          porcentaje: (totalValorNeto / total) * 100,
          color: '#3b82f6'
        },
        {
          name: 'IVA (19%)',
          value: totalIva,
          porcentaje: (totalIva / total) * 100,
          color: '#10b981'
        }
      ],
      total
    };
  }, [facturas]);

  const chartConfig = {
    valorNeto: {
      label: 'Valor Neto',
      color: '#3b82f6'
    },
    iva: {
      label: 'IVA',
      color: '#10b981'
    }
  };

  return (
    <Card className='border bg-background'>
      <CardHeader>
        <CardTitle className='text-base'>Distribución de Costos</CardTitle>
        <CardDescription>Proporción entre Valor Neto e IVA</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[350px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={distributionData.data}
                cx='50%'
                cy='50%'
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey='value'
              >
                {distributionData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='rounded-lg border bg-background p-3 shadow-md'>
                        <div className='space-y-2'>
                          <div className='font-medium text-sm border-b pb-2'>
                            {data.name}
                          </div>
                          <div className='text-xs space-y-1'>
                            <div className='flex items-center justify-between gap-4'>
                              <span className='text-slate-600 dark:text-slate-400'>
                                Monto:
                              </span>
                              <span className='font-bold'>
                                {formatCurrency(data.value)}
                              </span>
                            </div>
                            <div className='flex items-center justify-between gap-4'>
                              <span className='text-slate-600 dark:text-slate-400'>
                                Porcentaje:
                              </span>
                              <span className='font-medium'>
                                {data.porcentaje.toFixed(1)}%
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
              {/* Centro del donut con total */}
              <text
                x='50%'
                y='50%'
                textAnchor='middle'
                dominantBaseline='middle'
              >
                <tspan
                  x='50%'
                  dy='-0.5em'
                  className='text-xs fill-slate-600 dark:fill-slate-400'
                >
                  Total Histórico
                </tspan>
                <tspan
                  x='50%'
                  dy='1.5em'
                  className='text-xl font-bold fill-slate-900 dark:fill-slate-100'
                >
                  {formatCurrency(distributionData.total)}
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Leyenda */}
        <div className='mt-4 flex items-center justify-center gap-6'>
          {distributionData.data.map((item, index) => (
            <div key={index} className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded'
                style={{ backgroundColor: item.color }}
              />
              <span className='text-xs'>
                {item.name}: {item.porcentaje.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default CostDistribution;
