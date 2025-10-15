import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { TooltipProvider } from '~/components/ui/tooltip';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Separator } from '~/components/ui/separator';
import type { ExportColumn } from '~/hooks/shared/use-export-data';
import type { DetalleFacturas } from '~/types/reportes';

import { facturasTableColumns } from './columns-facturas';

interface FacturasAnalyticsSimpleProps {
  detalleFacturas: DetalleFacturas[];
  contratoId?: number;
}

const FacturasAnalyticsSimple = memo(function FacturasAnalyticsSimple({
  detalleFacturas,
  contratoId
}: FacturasAnalyticsSimpleProps) {
  const [timeRange, setTimeRange] = useState<
    '6m' | '1a' | '2a' | '5a' | 'todo'
  >('todo');
  const [showDataTable, setShowDataTable] = useState(false);
  // Columnas para exportación
  const facturasColumns = useMemo(
    (): ExportColumn[] => [
      { key: 'periodo', header: 'Período' },
      { key: 'nroFactura', header: 'Nro. Factura' },
      { key: 'tarifa', header: 'Tarifa' },
      { key: 'fechaEmision', header: 'Fecha Emisión' },
      { key: 'fechaVencimiento', header: 'Fecha Vencimiento' },
      {
        key: 'valorNeto',
        header: 'Valor Neto',
        formatter: (value: number) => `$${value?.toLocaleString('es-CL')}`
      },
      {
        key: 'iva',
        header: 'IVA',
        formatter: (value: number) => `$${value?.toLocaleString('es-CL')}`
      },
      {
        key: 'valorTotal',
        header: 'Valor Total',
        formatter: (value: number) => `$${value?.toLocaleString('es-CL')}`
      },
      { key: 'consumoPeriodo', header: 'Consumo Período' }
    ],
    []
  );

  // Función para filtrar datos por rango de tiempo
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

    return facturas.filter(factura => factura.fecha >= cutoffDate.getTime());
  };

  // Función para calcular proyecciones de facturación futuras
  const calculateBillingPredictions = (data: any[], months: number = 6) => {
    if (data.length < 2) return [];

    // Calcular tendencias para valor total y consumo usando regresión lineal
    const n = data.length;
    let sumX = 0,
      sumYTotal = 0,
      sumXYTotal = 0,
      sumX2 = 0;
    let sumYConsumo = 0,
      sumXYConsumo = 0;

    data.forEach((item, index) => {
      const x = index;
      sumX += x;
      sumYTotal += item.valorTotal;
      sumYConsumo += item.consumo;
      sumXYTotal += x * item.valorTotal;
      sumXYConsumo += x * item.consumo;
      sumX2 += x * x;
    });

    const slopeTotal =
      (n * sumXYTotal - sumX * sumYTotal) / (n * sumX2 - sumX * sumX);
    const interceptTotal = (sumYTotal - slopeTotal * sumX) / n;

    const slopeConsumo =
      (n * sumXYConsumo - sumX * sumYConsumo) / (n * sumX2 - sumX * sumX);
    const interceptConsumo = (sumYConsumo - slopeConsumo * sumX) / n;

    // Generar predicciones futuras basadas en el último registro real
    const predictions = [];
    const lastRecordedDate = new Date(data[data.length - 1].fecha);

    for (let i = 1; i <= months; i++) {
      // Proyectar desde el último mes con factura registrada
      const futureDate = new Date(lastRecordedDate);
      futureDate.setMonth(futureDate.getMonth() + i);

      // Buscar facturas históricas del mismo mes para ajustar predicción
      const sameMonthData = data.filter(item => {
        const itemDate = new Date(item.fecha);
        return (
          itemDate.getMonth() === futureDate.getMonth() &&
          itemDate.getFullYear() !== futureDate.getFullYear()
        );
      });

      let predictedTotal = Math.max(
        0,
        interceptTotal + slopeTotal * (n + i - 1)
      );
      let predictedConsumo = Math.max(
        0,
        interceptConsumo + slopeConsumo * (n + i - 1)
      );

      // Ajustar con promedio histórico del mismo mes si existe
      if (sameMonthData.length > 0) {
        const sameMonthTotalAvg =
          sameMonthData.reduce((sum, item) => sum + item.valorTotal, 0) /
          sameMonthData.length;
        const sameMonthConsumoAvg =
          sameMonthData.reduce((sum, item) => sum + item.consumo, 0) /
          sameMonthData.length;

        // Ponderar: 70% tendencia lineal + 30% promedio histórico del mes
        predictedTotal = predictedTotal * 0.7 + sameMonthTotalAvg * 0.3;
        predictedConsumo = predictedConsumo * 0.7 + sameMonthConsumoAvg * 0.3;
      }

      const predictedNeto = predictedTotal * 0.84; // Aproximación IVA 19%
      const predictedIva = predictedTotal - predictedNeto;

      predictions.push({
        periodo: `Proyección ${futureDate.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })}`,
        fechaCorta: `${futureDate.toLocaleDateString('es-CL', { month: 'short' })}`,
        fechaCompleta: futureDate.toLocaleDateString('es-CL'),
        fecha: futureDate.getTime(),
        valorTotal: Math.round(predictedTotal),
        valorNeto: Math.round(predictedNeto),
        iva: Math.round(predictedIva),
        consumo: Math.round(predictedConsumo),
        consumoNormalizado: predictedConsumo / 1000,
        isPrediction: true
      });
    }

    return predictions;
  };

  // Procesamiento de datos simplificado
  const analyticsData = useMemo(() => {
    if (detalleFacturas.length === 0) {
      return {
        totalFacturado: 0,
        promedioFactura: 0,
        tendenciaFacturacion: 'stable' as const,
        facturasProcesadas: [],
        filteredFacturas: []
      };
    }

    // Procesar facturas con manejo correcto de fechas
    const facturasProcesadas = detalleFacturas
      .map(factura => {
        let fechaEmision;
        let fechaVencimiento;
        let fechaCorta;
        let fechaCompleta;

        // Manejar fecha de emisión
        if (
          factura.fechaEmision &&
          typeof factura.fechaEmision === 'string' &&
          factura.fechaEmision.includes('/')
        ) {
          const [datePart] = factura.fechaEmision.split(' ');
          const [day, month, year] = datePart.split('/');
          fechaEmision = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
        } else {
          fechaEmision = new Date(factura.fechaEmision);
        }

        // Manejar fecha de vencimiento
        if (
          factura.fechaVencimiento &&
          typeof factura.fechaVencimiento === 'string' &&
          factura.fechaVencimiento.includes('/')
        ) {
          const [datePart] = factura.fechaVencimiento.split(' ');
          const [day, month, year] = datePart.split('/');
          fechaVencimiento = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
        } else {
          fechaVencimiento = new Date(factura.fechaVencimiento);
        }

        // Verificar si las fechas son válidas
        if (isNaN(fechaEmision.getTime())) {
          fechaEmision = new Date();
          fechaCorta = factura.periodo;
          fechaCompleta = factura.periodo;
        } else {
          fechaCorta = fechaEmision.toLocaleDateString('es-CL', {
            month: 'short',
            year: '2-digit'
          });
          fechaCompleta = fechaEmision.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }

        if (isNaN(fechaVencimiento.getTime())) {
          fechaVencimiento = new Date();
        }

        return {
          periodo: factura.periodo,
          nroFactura: factura.nroFactura,
          fechaCorta,
          fechaCompleta,
          fecha: fechaEmision.getTime(), // Para ordenamiento
          valorTotal: factura.valorTotal || 0,
          valorNeto: factura.valorNeto || 0,
          iva: factura.iva || 0,
          consumo: factura.consumoPeriodo || 0,
          consumoNormalizado: (factura.consumoPeriodo || 0) / 1000, // Normalizado para que se vea bien en el gráfico
          precioKwh:
            factura.consumoPeriodo > 0
              ? (factura.valorNeto || 0) / factura.consumoPeriodo
              : 0
        };
      })
      .sort((a, b) => a.fecha - b.fecha); // Ordenar por fecha

    // Filtrar por rango de tiempo
    const filteredFacturas = filterByTimeRange(facturasProcesadas, timeRange);

    // Calcular predicciones basadas en TODOS los datos (independiente del filtro)
    const billingPredictions = calculateBillingPredictions(
      facturasProcesadas,
      6
    );
    const dataWithBillingPredictions = [
      ...filteredFacturas,
      ...billingPredictions
    ];

    const totalFacturado = filteredFacturas.reduce(
      (sum, f) => sum + f.valorTotal,
      0
    );
    const promedioFactura =
      filteredFacturas.length > 0
        ? totalFacturado / filteredFacturas.length
        : 0;

    // Tendencia simple (usar datos filtrados)
    const ultimas2 = filteredFacturas.slice(-2);
    const anteriores2 = filteredFacturas.slice(-4, -2);

    let tendenciaFacturacion: 'up' | 'down' | 'stable' = 'stable';
    if (ultimas2.length > 0 && anteriores2.length > 0) {
      const promedioUltimas =
        ultimas2.reduce((sum, f) => sum + f.valorTotal, 0) / ultimas2.length;
      const promedioAnteriores =
        anteriores2.reduce((sum, f) => sum + f.valorTotal, 0) /
        anteriores2.length;

      if (promedioUltimas > promedioAnteriores * 1.1)
        tendenciaFacturacion = 'up';
      else if (promedioUltimas < promedioAnteriores * 0.9)
        tendenciaFacturacion = 'down';
    }

    return {
      totalFacturado,
      promedioFactura,
      tendenciaFacturacion,
      facturasProcesadas,
      filteredFacturas,
      dataWithBillingPredictions,
      billingPredictions
    };
  }, [detalleFacturas, timeRange]);

  const chartConfig = {
    valorTotal: {
      label: 'Valor Total',
      color: '#059669' // verde esmeralda
    },
    valorNeto: {
      label: 'Valor Neto',
      color: '#0891b2' // cian
    },
    iva: {
      label: 'IVA',
      color: '#dc2626' // rojo
    },
    consumo: {
      label: 'Consumo (kWh)',
      color: '#7c3aed' // violeta
    },
    consumoNormalizado: {
      label: 'Consumo Normalizado',
      color: '#7c3aed' // violeta
    }
  };

  if (detalleFacturas.length === 0) {
    return (
      <Card className='border bg-background'>
        <CardContent className='pt-6 text-center'>
          <div className='text-slate-500'>
            No hay datos de facturas disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className='space-y-6'>
        {/* Filtros de tiempo */}
        <Card className='border bg-background'>
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
          <Card className='border bg-background'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Total Facturado</p>
                  <p className='text-2xl font-bold'>
                    ${analyticsData.totalFacturado.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {analyticsData.filteredFacturas.length} facturas
                  </p>
                </div>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-background'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Promedio</p>
                  <p className='text-2xl font-bold'>
                    ${analyticsData.promedioFactura.toLocaleString('es-CL')}
                  </p>
                  <p className='text-xs text-muted-foreground'>por factura</p>
                </div>
                <FileText className='h-4 w-4 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-background'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Total Períodos</p>
                  <p className='text-2xl font-bold'>
                    {analyticsData.filteredFacturas.length}
                  </p>
                  <p className='text-xs text-muted-foreground'>facturados</p>
                </div>
                <FileText className='h-4 w-4 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-background'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Tendencia</p>
                  <Badge
                    variant={
                      analyticsData.tendenciaFacturacion === 'up'
                        ? 'destructive'
                        : analyticsData.tendenciaFacturacion === 'down'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {analyticsData.tendenciaFacturacion === 'up'
                      ? 'Al alza'
                      : analyticsData.tendenciaFacturacion === 'down'
                        ? 'A la baja'
                        : 'Estable'}
                  </Badge>
                </div>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de composición */}
        <div className='grid gap-6 lg:grid-cols-1'>
          {/* Composición de Facturación (Neto + IVA) */}
          <Card className='border bg-background'>
            <CardHeader>
              <CardTitle className='text-base'>
                Composición de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className='aspect-[4/3]'>
                <BarChart data={analyticsData.filteredFacturas}>
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
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString('es-CL')}`,
                      name === 'valorNeto' ? 'Valor Neto' : 'IVA'
                    ]}
                  />
                  <Bar
                    dataKey='valorNeto'
                    fill='#0891b2'
                    stackId='factura'
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey='iva'
                    fill='#dc2626'
                    stackId='factura'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabla de datos colapsable */}
        <Card className='border bg-background'>
          <CardHeader
            className='flex flex-row items-center justify-between space-y-0 pb-4 cursor-pointer'
            onClick={() => setShowDataTable(!showDataTable)}
          >
            <CardTitle className='text-base flex items-center gap-2'>
              Historial de Facturas ({detalleFacturas.length})
              {showDataTable ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </CardTitle>
            <ExportButton
              data={detalleFacturas}
              columns={facturasColumns}
              filename={`facturas_contrato_${contratoId}`}
              size='sm'
            />
          </CardHeader>
          {showDataTable && (
            <CardContent>
              <div className='overflow-x-auto'>
                <DataTable
                  columns={facturasTableColumns}
                  data={detalleFacturas}
                  showSearch={false}
                  defaultPageSize={10}
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
});

export default FacturasAnalyticsSimple;
