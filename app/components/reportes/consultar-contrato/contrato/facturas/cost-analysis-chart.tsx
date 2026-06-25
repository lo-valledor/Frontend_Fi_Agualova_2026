import { memo, useMemo } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import type { DetalleFacturas } from '~/types/reportes';

interface CostAnalysisChartProps {
  facturas: Array<
    DetalleFacturas & { consumoPeriodo: number; costoPorKwh: number }
  >;
}

// Función para extraer año y mes
const extraerAnoMes = (periodo: string) => {
  const mes = periodo.substring(0, 2);
  const ano = periodo.substring(2, 6);
  return { mes, ano };
};

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
  return meses[parseInt(mes, 10) - 1] || mes;
};

const CostAnalysisChart = memo(function CostAnalysisChart({
  facturas
}: CostAnalysisChartProps) {
  const chartData = useMemo(() => {
    const ultimos12 = facturas.slice(-12);

    const costoPromedio =
      ultimos12.reduce((sum, f) => sum + (f.costoPorKwh || 0), 0) /
      ultimos12.length;

    return ultimos12.map(f => {
      const { mes, ano } = extraerAnoMes(f.periodo);
      const desviacion = ((f.costoPorKwh || 0) - costoPromedio) / costoPromedio;
      const esAnormal = Math.abs(desviacion) > 0.2; // Más del 20% de desviación

      return {
        periodo: f.periodo,
        periodoDisplay: `${getNombreMes(mes)} ${ano.slice(-2)}`,
        costoPorKwh: f.costoPorKwh || 0,
        consumo: f.consumoPeriodo || 0,
        esAnormal,
        color: esAnormal
          ? '#ef4444'
          : f.costoPorKwh > costoPromedio
            ? '#f59e0b'
            : '#10b981'
      };
    });
  }, [facturas]);

  const costoPromedio = useMemo(() => {
    return (
      chartData.reduce((sum, d) => sum + d.costoPorKwh, 0) / chartData.length
    );
  }, [chartData]);

  const chartConfig = {
    costoPorKwh: {
      label: 'Costo por m³',
      color: '#f59e0b'
    }
  };

  return (
    <Card className="border bg-background">
      <CardHeader>
        <CardTitle className="text-base">Análisis de Costo por m³</CardTitle>
        <CardDescription>
          Últimos 12 periodos con indicador de promedio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <XAxis
                type="number"
                fontSize={11}
                tickFormatter={value => `$${value}`}
              />
              <YAxis
                dataKey="periodoDisplay"
                type="category"
                fontSize={11}
                width={60}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="space-y-2">
                          <div className="font-medium text-sm border-b pb-2">
                            {data.periodoDisplay}
                          </div>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-600 dark:text-slate-400">
                                Costo/m³:
                              </span>
                              <span className="font-bold">
                                ${data.costoPorKwh.toFixed(0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-600 dark:text-slate-400">
                                Consumo:
                              </span>
                              <span className="font-medium">
                                {data.consumo.toLocaleString('es-CL')} m³
                              </span>
                            </div>
                            {data.esAnormal && (
                              <div className="pt-1 border-t">
                                <span className="text-rose-600 text-xs font-medium">
                                  ⚠️ Costo anormalmente alto
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="costoPorKwh"
                radius={[0, 4, 4, 0]}
                name="Costo por m³"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>

              {/* Línea de promedio */}
              <line
                x1={costoPromedio * 100}
                y1="0"
                x2={costoPromedio * 100}
                y2="100%"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 text-xs text-center text-slate-600 dark:text-slate-400">
          Costo promedio:{' '}
          <span className="font-bold">${costoPromedio.toFixed(0)}</span> /m³
        </div>
      </CardContent>
    </Card>
  );
});

export default CostAnalysisChart;
