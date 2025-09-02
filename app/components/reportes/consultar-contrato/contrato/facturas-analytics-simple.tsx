import {
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
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
  const [timeRange, setTimeRange] = useState<'6m' | '1a' | '2a' | '5a' | 'todo'>('todo');
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

    const hoy = new Date();

    // Procesar facturas con manejo correcto de fechas
    const facturasProcesadas = detalleFacturas.map(factura => {
      let fechaEmision;
      let fechaVencimiento;
      let fechaCorta;
      let fechaCompleta;

      // Manejar fecha de emisión
      if (factura.fechaEmision && typeof factura.fechaEmision === 'string' && factura.fechaEmision.includes('/')) {
        const [datePart] = factura.fechaEmision.split(' ');
        const [day, month, year] = datePart.split('/');
        fechaEmision = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        fechaEmision = new Date(factura.fechaEmision);
      }

      // Manejar fecha de vencimiento
      if (factura.fechaVencimiento && typeof factura.fechaVencimiento === 'string' && factura.fechaVencimiento.includes('/')) {
        const [datePart] = factura.fechaVencimiento.split(' ');
        const [day, month, year] = datePart.split('/');
        fechaVencimiento = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
        precioKwh: factura.consumoPeriodo > 0 ? (factura.valorNeto || 0) / factura.consumoPeriodo : 0
      };
    }).sort((a, b) => a.fecha - b.fecha); // Ordenar por fecha

    // Filtrar por rango de tiempo
    const filteredFacturas = filterByTimeRange(facturasProcesadas, timeRange);

    const totalFacturado = filteredFacturas.reduce((sum, f) => sum + f.valorTotal, 0);
    const promedioFactura = filteredFacturas.length > 0 ? totalFacturado / filteredFacturas.length : 0;

    // Tendencia simple (usar datos filtrados)
    const ultimas2 = filteredFacturas.slice(-2);
    const anteriores2 = filteredFacturas.slice(-4, -2);
    
    let tendenciaFacturacion: 'up' | 'down' | 'stable' = 'stable';
    if (ultimas2.length > 0 && anteriores2.length > 0) {
      const promedioUltimas = ultimas2.reduce((sum, f) => sum + f.valorTotal, 0) / ultimas2.length;
      const promedioAnteriores = anteriores2.reduce((sum, f) => sum + f.valorTotal, 0) / anteriores2.length;
      
      if (promedioUltimas > promedioAnteriores * 1.1) tendenciaFacturacion = 'up';
      else if (promedioUltimas < promedioAnteriores * 0.9) tendenciaFacturacion = 'down';
    }

    return {
      totalFacturado,
      promedioFactura,
      tendenciaFacturacion,
      facturasProcesadas,
      filteredFacturas
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
    }
  };

  if (detalleFacturas.length === 0) {
    return (
      <Card className='border bg-white dark:bg-slate-900'>
        <CardContent className='pt-6 text-center'>
          <div className='text-slate-500'>No hay datos de facturas disponibles</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Filtros de tiempo */}
      <Card className='border bg-white dark:bg-slate-900'>
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
        <Card className='border bg-white dark:bg-slate-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Total Facturado</p>
                <p className='text-2xl font-bold'>${analyticsData.totalFacturado.toLocaleString('es-CL')}</p>
                <p className='text-xs text-muted-foreground'>{analyticsData.filteredFacturas.length} facturas</p>
              </div>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card className='border bg-white dark:bg-slate-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Promedio</p>
                <p className='text-2xl font-bold'>${analyticsData.promedioFactura.toLocaleString('es-CL')}</p>
                <p className='text-xs text-muted-foreground'>por factura</p>
              </div>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card className='border bg-white dark:bg-slate-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Total Períodos</p>
                <p className='text-2xl font-bold'>{analyticsData.filteredFacturas.length}</p>
                <p className='text-xs text-muted-foreground'>facturados</p>
              </div>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card className='border bg-white dark:bg-slate-900'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium'>Tendencia</p>
                <Badge variant={
                  analyticsData.tendenciaFacturacion === 'up' ? 'destructive' :
                  analyticsData.tendenciaFacturacion === 'down' ? 'default' : 'secondary'
                }>
                  {analyticsData.tendenciaFacturacion === 'up' ? 'Al alza' :
                   analyticsData.tendenciaFacturacion === 'down' ? 'A la baja' : 'Estable'}
                </Badge>
              </div>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos simples */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Composición de Facturación (Neto + IVA) */}
        <Card className='border bg-white dark:bg-slate-900'>
          <CardHeader>
            <CardTitle className='text-base'>Composición de Facturación</CardTitle>
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

        {/* Consumo por Período */}
        <Card className='border bg-white dark:bg-slate-900'>
          <CardHeader>
            <CardTitle className='text-base'>Consumo por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='aspect-[4/3]'>
              <LineChart data={analyticsData.filteredFacturas}>
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
                  formatter={(value) => [
                    `${Number(value).toLocaleString('es-CL')} kWh`,
                    'Consumo'
                  ]}
                />
                <Line
                  dataKey='consumo'
                  stroke='#7c3aed'
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#7c3aed' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>


      <Separator />

      {/* Tabla de datos */}
      <Card className='border bg-white dark:bg-slate-900'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <CardTitle className='text-base'>
            Historial de Facturas ({detalleFacturas.length})
          </CardTitle>
          <ExportButton
            data={detalleFacturas}
            columns={facturasColumns}
            filename={`facturas_contrato_${contratoId}`}
            size='sm'
          />
        </CardHeader>
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
      </Card>
    </div>
  );
});

export default FacturasAnalyticsSimple;