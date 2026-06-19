import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  PieChart,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { memo, useMemo, useRef, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';

import { ExportButton } from '~/components/shared/export-button';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Separator } from '~/components/ui/separator';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { TooltipProvider } from '~/components/ui/tooltip';
import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { type PDFSection, useExportPDF } from '~/hooks/shared/use-export-pdf';
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeChart, setActiveChart] = useState<
    'composition' | 'trends' | 'comparison'
  >('composition');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { exportToPDF } = useExportPDF();

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
      { key: 'consumoPeriodo', header: 'Consumo Período (kWh)' }
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

    const predictions = [];
    const lastRecordedDate = new Date(data[data.length - 1].fecha);

    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(lastRecordedDate);
      futureDate.setMonth(futureDate.getMonth() + i);

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

      if (sameMonthData.length > 0) {
        const sameMonthTotalAvg =
          sameMonthData.reduce((sum, item) => sum + item.valorTotal, 0) /
          sameMonthData.length;
        const sameMonthConsumoAvg =
          sameMonthData.reduce((sum, item) => sum + item.consumo, 0) /
          sameMonthData.length;

        predictedTotal = predictedTotal * 0.7 + sameMonthTotalAvg * 0.3;
        predictedConsumo = predictedConsumo * 0.7 + sameMonthConsumoAvg * 0.3;
      }

      const predictedNeto = predictedTotal * 0.84;
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

  // Procesamiento de datos mejorado
  const analyticsData = useMemo(() => {
    if (detalleFacturas.length === 0) {
      return {
        totalFacturado: 0,
        promedioFactura: 0,
        tendenciaFacturacion: 'stable' as const,
        facturasProcesadas: [],
        filteredFacturas: [],
        promedioConsumo: 0,
        totalConsumo: 0,
        precioPromedioKwh: 0,
        maxFactura: 0,
        minFactura: 0,
        dataWithBillingPredictions: [],
        billingPredictions: [],
        variacionPromedio: 0
      };
    }

    const facturasProcesadas = detalleFacturas
      .map(factura => {
        let fechaEmision;
        let fechaVencimiento;
        let fechaCorta;
        let fechaCompleta;

        if (
          factura.fechaEmision &&
          typeof factura.fechaEmision === 'string' &&
          factura.fechaEmision.includes('/')
        ) {
          const [datePart] = factura.fechaEmision.split(' ');
          const [day, month, year] = datePart.split('/');
          fechaEmision = new Date(
            Number.parseInt(year),
            Number.parseInt(month) - 1,
            Number.parseInt(day)
          );
        } else {
          fechaEmision = new Date(factura.fechaEmision);
        }

        if (
          factura.fechaVencimiento &&
          typeof factura.fechaVencimiento === 'string' &&
          factura.fechaVencimiento.includes('/')
        ) {
          const [datePart] = factura.fechaVencimiento.split(' ');
          const [day, month, year] = datePart.split('/');
          fechaVencimiento = new Date(
            Number.parseInt(year),
            Number.parseInt(month) - 1,
            Number.parseInt(day)
          );
        } else {
          fechaVencimiento = new Date(factura.fechaVencimiento);
        }

        if (Number.isNaN(fechaEmision.getTime())) {
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

        if (Number.isNaN(fechaVencimiento.getTime())) {
          fechaVencimiento = new Date();
        }

        return {
          periodo: factura.periodo,
          nroFactura: factura.nroFactura,
          fechaCorta,
          fechaCompleta,
          fecha: fechaEmision.getTime(),
          valorTotal: factura.valorTotal || 0,
          valorNeto: factura.valorNeto || 0,
          iva: factura.iva || 0,
          consumo: factura.consumoPeriodo || 0,
          consumoNormalizado: (factura.consumoPeriodo || 0) / 1000,
          precioKwh:
            factura.consumoPeriodo > 0
              ? (factura.valorNeto || 0) / factura.consumoPeriodo
              : 0
        };
      })
      .sort((a, b) => a.fecha - b.fecha);

    const filteredFacturas = filterByTimeRange(facturasProcesadas, timeRange);

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

    const totalConsumo = filteredFacturas.reduce(
      (sum, f) => sum + f.consumo,
      0
    );
    const promedioConsumo =
      filteredFacturas.length > 0 ? totalConsumo / filteredFacturas.length : 0;

    const precioPromedioKwh =
      totalConsumo > 0 ? totalFacturado / totalConsumo : 0;

    const valoresFacturas = filteredFacturas.map(f => f.valorTotal);
    const maxFactura =
      valoresFacturas.length > 0 ? Math.max(...valoresFacturas) : 0;
    const minFactura =
      valoresFacturas.length > 0 ? Math.min(...valoresFacturas) : 0;

    // Calcular variación promedio entre períodos
    let variacionPromedio = 0;
    if (filteredFacturas.length > 1) {
      const variaciones = [];
      for (let i = 1; i < filteredFacturas.length; i++) {
        const variacion =
          ((filteredFacturas[i].valorTotal -
            filteredFacturas[i - 1].valorTotal) /
            filteredFacturas[i - 1].valorTotal) *
          100;
        variaciones.push(variacion);
      }
      variacionPromedio =
        variaciones.reduce((sum, v) => sum + v, 0) / variaciones.length;
    }

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
      billingPredictions,
      promedioConsumo,
      totalConsumo,
      precioPromedioKwh,
      maxFactura,
      minFactura,
      variacionPromedio
    };
  }, [detalleFacturas, timeRange]);

  const chartConfig = {
    valorTotal: {
      label: 'Valor Total',
      color: '#059669'
    },
    valorNeto: {
      label: 'Valor Neto',
      color: '#0891b2'
    },
    iva: {
      label: 'IVA',
      color: '#dc2626'
    },
    consumo: {
      label: 'Consumo (kWh)',
      color: '#7c3aed'
    },
    precioKwh: {
      label: 'Precio/kWh',
      color: '#f59e0b'
    }
  };

  // Table setup with react-table
  const table = useReactTable({
    data: detalleFacturas,
    columns: facturasTableColumns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  // Virtualization setup
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50,
    overscan: 10
  });

  // Función para exportar a PDF
  const handlePDFExport = async () => {
    const sections: PDFSection[] = [
      // KPIs
      {
        title: 'Indicadores Principales',
        type: 'kpis',
        kpis: [
          {
            label: 'Total Facturado',
            value: `$${analyticsData.totalFacturado.toLocaleString('es-CL')}`
          },
          {
            label: 'Promedio por Factura',
            value: `$${Math.round(analyticsData.promedioFactura).toLocaleString('es-CL')}`
          },
          {
            label: 'Total Facturas',
            value: analyticsData.filteredFacturas.length
          },
          {
            label: 'Consumo Total',
            value: `${Math.round(analyticsData.totalConsumo).toLocaleString('es-CL')} kWh`
          },
          {
            label: 'Precio Promedio/kWh',
            value: `$${analyticsData.precioPromedioKwh.toFixed(2)}`
          },
          {
            label: 'Variación Promedio',
            value: `${analyticsData.variacionPromedio.toFixed(1)}%`
          }
        ]
      },
      // Tabla de facturas
      {
        title: 'Detalle de Facturas',
        type: 'table',
        data: analyticsData.filteredFacturas,
        columns: [
          { key: 'periodo', header: 'Período', width: 25 },
          { key: 'nroFactura', header: 'N° Factura', width: 25 },
          {
            key: 'valorNeto',
            header: 'Valor Neto',
            align: 'right',
            formatter: (val: number) => `$${val.toLocaleString('es-CL')}`
          },
          {
            key: 'iva',
            header: 'IVA',
            align: 'right',
            formatter: (val: number) => `$${val.toLocaleString('es-CL')}`
          },
          {
            key: 'valorTotal',
            header: 'Total',
            align: 'right',
            formatter: (val: number) => `$${val.toLocaleString('es-CL')}`
          },
          {
            key: 'consumo',
            header: 'Consumo',
            align: 'right',
            formatter: (val: number) => `${val.toLocaleString('es-CL')} kWh`
          }
        ]
      }
    ];

    await exportToPDF(sections, {
      title: `Análisis de Facturas - Contrato ${contratoId}`,
      subtitle: `Período: ${timeRange === 'todo' ? 'Todo el historial' : timeRange}`,
      filename: `facturas_contrato_${contratoId}`,
      orientation: 'landscape',
      companyInfo: {
        name: 'Sistema de Gestión Agualova',
        address: 'Reporte generado automáticamente',
        phone: ''
      }
    });
  };

  if (detalleFacturas.length === 0) {
    return (
      <Card className="border bg-background">
        <CardContent className="pt-6 text-center">
          <div className="text-slate-500">
            No hay datos de facturas disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filtros de tiempo y exportación */}
        <Card className="border bg-background">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={timeRange === '6m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('6m')}
                >
                  <Calendar className="h-3 w-3 mr-1" />6 meses
                </Button>
                <Button
                  variant={timeRange === '1a' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('1a')}
                >
                  1 año
                </Button>
                <Button
                  variant={timeRange === '2a' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('2a')}
                >
                  2 años
                </Button>
                <Button
                  variant={timeRange === '5a' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('5a')}
                >
                  5 años
                </Button>
                <Button
                  variant={timeRange === 'todo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('todo')}
                >
                  Todo
                </Button>
              </div>
              <ExportButton
                data={detalleFacturas}
                columns={facturasColumns}
                filename={`facturas_contrato_${contratoId}`}
                size="sm"
                enablePDF={true}
                onPDFExport={handlePDFExport}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPIs mejorados en grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="border bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Total Facturado
                  </p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                    $
                    {Math.round(analyticsData.totalFacturado).toLocaleString(
                      'es-CL'
                    )}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {analyticsData.filteredFacturas.length} facturas
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Promedio Factura
                  </p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    $
                    {Math.round(analyticsData.promedioFactura).toLocaleString(
                      'es-CL'
                    )}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    por período
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Consumo Total
                  </p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {Math.round(analyticsData.totalConsumo).toLocaleString(
                      'es-CL'
                    )}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    kWh
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Precio/kWh
                  </p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                    ${analyticsData.precioPromedioKwh.toFixed(2)}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    promedio
                  </p>
                </div>
                <PieChart className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-linear-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
                    Factura Máxima
                  </p>
                  <p className="text-xl font-bold text-rose-900 dark:text-rose-100">
                    $
                    {Math.round(analyticsData.maxFactura).toLocaleString(
                      'es-CL'
                    )}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    peak
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-rose-600 dark:text-rose-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Tendencia
                  </p>
                  <Badge
                    variant={
                      analyticsData.tendenciaFacturacion === 'up'
                        ? 'destructive'
                        : analyticsData.tendenciaFacturacion === 'down'
                          ? 'default'
                          : 'secondary'
                    }
                    className="mt-2"
                  >
                    {analyticsData.tendenciaFacturacion === 'up' ? (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Al alza
                      </>
                    ) : analyticsData.tendenciaFacturacion === 'down' ? (
                      <>
                        <TrendingDown className="h-3 w-3 mr-1" />A la baja
                      </>
                    ) : (
                      'Estable'
                    )}
                  </Badge>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {analyticsData.variacionPromedio > 0 ? '+' : ''}
                    {analyticsData.variacionPromedio.toFixed(1)}%
                  </p>
                </div>
                <FileText className="h-8 w-8 text-slate-600 dark:text-slate-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos con tabs */}
        <Card className="border bg-background">
          <CardHeader>
            <CardTitle className="text-base">
              Análisis Visual de Facturación
            </CardTitle>
            <CardDescription>
              Visualiza tendencias y patrones en tus facturas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeChart}
              onValueChange={v => setActiveChart(v as any)}
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="composition">Composición</TabsTrigger>
                <TabsTrigger value="trends">Evolución Temporal</TabsTrigger>
                <TabsTrigger value="comparison">Precio/kWh</TabsTrigger>
              </TabsList>

              <TabsContent value="composition" className="mt-0">
                <ChartContainer
                  config={chartConfig}
                  className="h-[350px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.filteredFacturas}>
                      <XAxis
                        dataKey="fechaCorta"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
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
                        dataKey="valorNeto"
                        fill="#0891b2"
                        stackId="factura"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar
                        dataKey="iva"
                        fill="#dc2626"
                        stackId="factura"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="trends" className="mt-0">
                <ChartContainer
                  config={chartConfig}
                  className="h-[350px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.filteredFacturas}>
                      <XAxis
                        dataKey="fechaCorta"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={value => [
                          `$${Number(value).toLocaleString('es-CL')}`,
                          'Valor Total'
                        ]}
                      />
                      <defs>
                        <linearGradient
                          id="colorValor"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#059669"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#059669"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="valorTotal"
                        stroke="#059669"
                        strokeWidth={2}
                        fill="url(#colorValor)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="comparison" className="mt-0">
                <ChartContainer
                  config={chartConfig}
                  className="h-[350px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.filteredFacturas}>
                      <XAxis
                        dataKey="fechaCorta"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={value => [
                          `$${Number(value).toFixed(2)}`,
                          'Precio por kWh'
                        ]}
                      />
                      <Bar
                        dataKey="precioKwh"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="precioKwh"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ fill: '#dc2626', r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Separator />

        {/* Tabla de datos colapsable */}
        <Card className="border bg-background">
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-4 cursor-pointer"
            onClick={() => setShowDataTable(!showDataTable)}
          >
            <CardTitle className="text-base flex items-center gap-2">
              Historial Detallado de Facturas ({detalleFacturas.length})
              {showDataTable ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {showDataTable && (
            <CardContent>
              <div
                ref={tableContainerRef}
                className="relative rounded-md border overflow-auto"
                style={{ height: '500px' }}
              >
                <table className="w-full table-fixed caption-bottom text-sm">
                  <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70 shadow-xs">
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow
                        key={headerGroup.id}
                        className="hover:bg-transparent"
                      >
                        {headerGroup.headers.map(header => {
                          const columnDef = header.column.columnDef;
                          const width = columnDef.minSize || 120;
                          return (
                            <TableHead
                              key={header.id}
                              className="h-[50px] px-3 text-xs font-medium border-b border-border"
                              style={{
                                width: `${width}px`,
                                minWidth: `${width}px`,
                                maxWidth: `${columnDef.maxSize || width}px`
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      position: 'relative'
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                      const row = rows[virtualRow.index];
                      return (
                        <TableRow
                          key={row.id}
                          data-index={virtualRow.index}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '50px',
                            transform: `translateY(${virtualRow.start}px)`,
                            display: 'table'
                          }}
                          className="border-b hover:bg-muted"
                        >
                          {row.getVisibleCells().map(cell => {
                            const columnDef = cell.column.columnDef;
                            const width = columnDef.minSize || 120;
                            return (
                              <TableCell
                                key={cell.id}
                                className="h-[50px] px-3 py-1 text-sm"
                                style={{
                                  width: `${width}px`,
                                  minWidth: `${width}px`,
                                  maxWidth: `${columnDef.maxSize || width}px`
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </table>
                {rows.length === 0 && (
                  <div className="h-20 flex items-center justify-center text-sm text-muted-foreground">
                    No se encontraron facturas.
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
});

export default FacturasAnalyticsSimple;
