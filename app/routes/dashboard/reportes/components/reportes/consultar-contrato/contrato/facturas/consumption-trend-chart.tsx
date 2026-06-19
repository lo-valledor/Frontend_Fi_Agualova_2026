import { memo, useMemo } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
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
import type { DetalleLecturas } from '~/types/reportes';

interface ConsumptionTrendChartProps {
  detalleLecturas: DetalleLecturas[];
  consumoPromedio: number;
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

const ConsumptionTrendChart = memo(function ConsumptionTrendChart({
  detalleLecturas,
  consumoPromedio
}: ConsumptionTrendChartProps) {
  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    return detalleLecturas.map(l => {
      const { mes, ano } = extraerAnoMes(l.periodo);
      const tieneSobreconsumo = l.sobreconsumo && l.sobreconsumo > 0;

      return {
        periodo: l.periodo,
        periodoDisplay: `${getNombreMes(mes)} ${ano}`,
        consumoPeriodo: l.consumoPeriodo || 0,
        energiaBase: l.energiaBase || 0,
        sobreconsumo: l.sobreconsumo || 0,
        promedio: Math.round(consumoPromedio),
        tieneSobreconsumo,
        fechaLectura: new Date(l.fechaLectura).toLocaleDateString('es-CL')
      };
    });
  }, [detalleLecturas, consumoPromedio]);

  const chartConfig = {
    consumoPeriodo: {
      label: 'Consumo',
      color: '#3b82f6'
    },
    energiaBase: {
      label: 'Energía Base',
      color: '#10b981'
    },
    promedio: {
      label: 'Promedio',
      color: '#64748b'
    }
  };

  return (
    <Card className="border bg-background">
      <CardHeader>
        <CardTitle className="text-base">
          Tendencia de Consumo Mensual
        </CardTitle>
        <CardDescription>
          Comparación de consumo real vs energía base con indicador de promedio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <XAxis
                dataKey="periodoDisplay"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                angle={-45}
                textAnchor="end"
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
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="space-y-2">
                          <div className="font-medium text-sm border-b pb-2">
                            {data.periodoDisplay}
                          </div>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-600 dark:text-slate-400">
                                Consumo Total:
                              </span>
                              <span className="font-medium">
                                {data.consumoPeriodo.toLocaleString('es-CL')}{' '}
                                kWh
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-600 dark:text-slate-400">
                                Energía Base:
                              </span>
                              <span className="font-medium text-emerald-600">
                                {data.energiaBase.toLocaleString('es-CL')} kWh
                              </span>
                            </div>
                            {data.tieneSobreconsumo && (
                              <div className="flex items-center justify-between gap-4 pt-1 border-t">
                                <span className="text-rose-600 font-medium">
                                  Sobreconsumo:
                                </span>
                                <span className="font-bold text-rose-600">
                                  {data.sobreconsumo.toLocaleString('es-CL')}{' '}
                                  kWh
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-4 pt-1 border-t">
                              <span className="text-slate-600 dark:text-slate-400">
                                Fecha Lectura:
                              </span>
                              <span className="font-medium text-xs">
                                {data.fechaLectura}
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
                  if (value === 'consumoPeriodo') return 'Consumo del Periodo';
                  if (value === 'energiaBase') return 'Energía Base (línea)';
                  if (value === 'promedio') return 'Promedio (línea punteada)';
                  return value;
                }}
              />

              {/* Barras de consumo - color rojo si hay sobreconsumo */}
              <Bar
                dataKey="consumoPeriodo"
                radius={[4, 4, 0, 0]}
                name="Consumo del Periodo"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.tieneSobreconsumo ? '#ef4444' : '#3b82f6'}
                  />
                ))}
              </Bar>

              {/* Línea de energía base */}
              <Line
                type="monotone"
                dataKey="energiaBase"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                name="Energía Base (línea)"
              />

              {/* Línea de promedio (punteada) */}
              <Line
                type="monotone"
                dataKey="promedio"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Promedio (línea punteada)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Leyenda de colores */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Consumo Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Con Sobreconsumo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-emerald-500" />
            <span>Energía Base</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5 bg-slate-500"
              style={{ borderTop: '2px dashed' }}
            />
            <span>Promedio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default ConsumptionTrendChart;
