import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Info,
  RotateCw,
  TrendingUp
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { DetalleFacturas, DetalleLecturas } from '~/types/reportes';
import BillingEvolutionChart from './billing-evolution-chart';
import BillingKPIs from './billing-kpis';
import CostAnalysisChart from './cost-analysis-chart';
import CostDistribution from './cost-distribution';
import InvoicesTable from './invoices-table';
import PaymentTimeline from './payment-timeline';
import PeriodComparison from './period-comparison';

interface BillingDashboardProps {
  detalleFacturas: DetalleFacturas[];
  detalleLecturas: DetalleLecturas[];
  contratoId?: number;
}

// Función para formatear moneda chilena
export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

// Función para calcular costo por kWh
export const calcularCostoPorKwh = (
  valorTotal: number,
  consumo: number
): number => {
  if (consumo === 0) return 0;
  return valorTotal / consumo;
};

// Función para calcular estado de factura
export const calcularEstadoFactura = (fechaVencimiento: string) => {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferenciaDias = Math.ceil(
    (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diferenciaDias < 0) {
    return {
      estado: 'vencida' as const,
      diasVencido: Math.abs(diferenciaDias),
      color: 'red'
    };
  } else if (diferenciaDias <= 7) {
    return {
      estado: 'pendiente' as const,
      diasRestantes: diferenciaDias,
      color: 'orange'
    };
  } else if (diferenciaDias <= 15) {
    return {
      estado: 'pendiente' as const,
      diasRestantes: diferenciaDias,
      color: 'yellow'
    };
  } else {
    return {
      estado: 'pendiente' as const,
      diasRestantes: diferenciaDias,
      color: 'green'
    };
  }
};

const BillingDashboard = memo(function BillingDashboard({
  detalleFacturas,
  detalleLecturas,
  contratoId: _contratoId
}: BillingDashboardProps) {
  const [activeTab, setActiveTab] = useState('analisis');
  const [selectedPeriods, setSelectedPeriods] = useState<[string, string]>([
    '',
    ''
  ]);

  // Procesar facturas válidas (eliminar duplicados y facturas anuladas)
  const facturasValidas = useMemo(() => {
    // Agrupar por periodo y quedarse solo con la factura válida
    const facturasPorPeriodo = new Map<string, DetalleFacturas>();

    detalleFacturas.forEach(factura => {
      const existe = facturasPorPeriodo.get(factura.periodo);

      // Si no existe o la nueva tiene valor mayor, la guardamos
      if (!existe || (factura.valorTotal || 0) > (existe.valorTotal || 0)) {
        facturasPorPeriodo.set(factura.periodo, factura);
      }
    });

    // Filtrar facturas con valor > 0 y ordenar por periodo
    return Array.from(facturasPorPeriodo.values())
      .filter(f => (f.valorTotal || 0) > 0)
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [detalleFacturas]);

  // Correlacionar facturas con lecturas para tener consumo
  const facturasConConsumo = useMemo(() => {
    const lecturasMap = new Map(
      detalleLecturas.map(l => [l.periodo, l.consumoPeriodo || 0])
    );

    return facturasValidas.map(factura => ({
      ...factura,
      consumoPeriodo:
        factura.consumoPeriodo || lecturasMap.get(factura.periodo) || 0,
      costoPorKwh: calcularCostoPorKwh(
        factura.valorTotal || 0,
        factura.consumoPeriodo || lecturasMap.get(factura.periodo) || 0
      )
    }));
  }, [facturasValidas, detalleLecturas]);

  // Detectar alertas
  const alertas = useMemo(() => {
    const alerts: Array<{
      tipo: 'vencimiento' | 'vencida' | 'aumento' | 'info';
      mensaje: string;
    }> = [];

    // Verificar facturas próximas a vencer
    const facturasProximasVencer = facturasConConsumo.filter(f => {
      const estado = calcularEstadoFactura(f.fechaVencimiento);
      return estado.estado === 'pendiente' && estado.diasRestantes! <= 7;
    });

    if (facturasProximasVencer.length > 0) {
      alerts.push({
        tipo: 'vencimiento',
        mensaje: `Tienes ${facturasProximasVencer.length} factura(s) próxima(s) a vencer en los próximos 7 días`
      });
    }

    // Verificar facturas vencidas
    const facturasVencidas = facturasConConsumo.filter(f => {
      const estado = calcularEstadoFactura(f.fechaVencimiento);
      return estado.estado === 'vencida';
    });

    if (facturasVencidas.length > 0) {
      alerts.push({
        tipo: 'vencida',
        mensaje: `Tienes ${facturasVencidas.length} factura(s) vencida(s)`
      });
    }

    // Verificar aumentos significativos
    if (facturasConConsumo.length >= 2) {
      const promedio =
        facturasConConsumo.reduce((sum, f) => sum + (f.valorTotal || 0), 0) /
        facturasConConsumo.length;
      const ultimaFactura = facturasConConsumo[facturasConConsumo.length - 1];

      if (ultimaFactura.valorTotal! > promedio * 1.3) {
        alerts.push({
          tipo: 'aumento',
          mensaje: `La última factura es un 30% mayor al promedio histórico`
        });
      }
    }

    return alerts;
  }, [facturasConConsumo]);

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'Periodo',
      'Nro Factura',
      'Fecha Emisión',
      'Fecha Vencimiento',
      'Consumo kWh',
      'Valor Neto',
      'IVA',
      'Valor Total',
      'Costo por kWh',
      'Tarifa'
    ];

    const rows = facturasConConsumo.map(f => [
      f.periodo,
      f.nroFactura,
      new Date(f.fechaEmision).toLocaleDateString('es-CL'),
      new Date(f.fechaVencimiento).toLocaleDateString('es-CL'),
      f.consumoPeriodo?.toString() || '0',
      f.valorNeto?.toString() || '0',
      f.iva?.toString() || '0',
      f.valorTotal?.toString() || '0',
      f.costoPorKwh?.toFixed(2) || '0',
      f.tarifa
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `facturas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Dashboard de Facturación
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Gestión financiera y administrativa de facturas eléctricas
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RotateCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      <Separator />

      {/* KPIs */}
      <BillingKPIs facturas={facturasConConsumo} />

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta, index) => (
            <Alert
              key={index}
              variant={
                alerta.tipo === 'vencida' || alerta.tipo === 'aumento'
                  ? 'destructive'
                  : 'default'
              }
            >
              {alerta.tipo === 'vencida' || alerta.tipo === 'aumento' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <AlertTitle>
                {alerta.tipo === 'vencida'
                  ? 'Facturas Vencidas'
                  : alerta.tipo === 'vencimiento'
                    ? 'Facturas por Vencer'
                    : alerta.tipo === 'aumento'
                      ? 'Aumento Significativo'
                      : 'Información'}
              </AlertTitle>
              <AlertDescription>{alerta.mensaje}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Tabs principales */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger value="analisis" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Análisis Financiero
          </TabsTrigger>
          <TabsTrigger value="desglose" className="gap-2">
            <FileText className="h-4 w-4" />
            Desglose de Costos
          </TabsTrigger>
          <TabsTrigger value="facturas" className="gap-2">
            <Calendar className="h-4 w-4" />
            Facturas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Análisis Financiero */}
        <TabsContent value="analisis" className="space-y-4">
          <BillingEvolutionChart facturas={facturasConConsumo} />
        </TabsContent>

        {/* Tab: Desglose de Costos */}
        <TabsContent value="desglose" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <CostAnalysisChart facturas={facturasConConsumo} />
            <CostDistribution facturas={facturasConConsumo} />
          </div>
          <PeriodComparison
            facturas={facturasConConsumo}
            selectedPeriods={selectedPeriods}
            onPeriodsChange={setSelectedPeriods}
          />
        </TabsContent>

        {/* Tab: Facturas */}
        <TabsContent value="facturas" className="space-y-4">
          <Card className="p-4">
            <PaymentTimeline facturas={facturasConConsumo} />
          </Card>
          <InvoicesTable facturas={facturasConConsumo} />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Última actualización: {new Date().toLocaleString('es-CL')} • Tarifa:{' '}
        {facturasValidas[0]?.tarifa || 'N/A'}
      </div>
    </div>
  );
});

export default BillingDashboard;
