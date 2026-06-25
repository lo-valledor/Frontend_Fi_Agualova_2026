import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Download,
  RotateCw,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { DetalleLecturas } from '~/types/reportes';
import ConsumptionDetailsTable from './consumption-details-table';
import ConsumptionTrendChart from './consumption-trend-chart';
import OverconsumptionAnalysis from './overconsumption-analysis';

interface EnergyConsumptionDashboardProps {
  detalleLecturas: DetalleLecturas[];
  contratoId?: number;
}

const EnergyConsumptionDashboard = memo(function EnergyConsumptionDashboard({
  detalleLecturas,
  contratoId: _contratoId
}: EnergyConsumptionDashboardProps) {
  const [activeTab, setActiveTab] = useState('tendencia');
  const [showOnlyOverconsumption, setShowOnlyOverconsumption] = useState(false);

  // Calcular KPIs y estadísticas
  const dashboardStats = useMemo(() => {
    // Filtrar lecturas válidas (con consumo no null)
    const lecturasValidas = detalleLecturas.filter(
      l => l.consumoPeriodo != null && l.consumoPeriodo > 0
    );

    if (lecturasValidas.length === 0) {
      return {
        consumoPromedio: 0,
        consumoUltimoPeriodo: 0,
        consumoPeriodoAnterior: 0,
        variacionPorcentaje: 0,
        tendencia: 'stable' as const,
        totalAcumuladoAnual: 0,
        alertasSobreconsumo: 0,
        lecturasConSobreconsumo: [],
        lecturasFiltered: []
      };
    }

    // Ordenar por periodo
    const lecturasOrdenadas = [...lecturasValidas].sort((a, b) =>
      a.periodo.localeCompare(b.periodo)
    );

    // Consumo promedio
    const consumoPromedio =
      lecturasOrdenadas.reduce((sum, l) => sum + (l.consumoPeriodo || 0), 0) /
      lecturasOrdenadas.length;

    // Último periodo y anterior
    const ultimoPeriodo = lecturasOrdenadas[lecturasOrdenadas.length - 1];
    const periodoAnterior = lecturasOrdenadas[lecturasOrdenadas.length - 2];
    const consumoUltimoPeriodo = ultimoPeriodo?.consumoPeriodo || 0;
    const consumoPeriodoAnterior = periodoAnterior?.consumoPeriodo || 0;

    // Variación porcentual
    const variacionPorcentaje =
      consumoPeriodoAnterior > 0
        ? ((consumoUltimoPeriodo - consumoPeriodoAnterior) /
            consumoPeriodoAnterior) *
          100
        : 0;

    // Tendencia (últimos 3 meses)
    const ultimos3Periodos = lecturasOrdenadas.slice(-3);
    let tendencia: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (ultimos3Periodos.length >= 3) {
      const primerConsumo = ultimos3Periodos[0].consumoPeriodo || 0;
      const ultimoConsumo =
        ultimos3Periodos[ultimos3Periodos.length - 1].consumoPeriodo || 0;
      const diferencia = ultimoConsumo - primerConsumo;
      const porcentajeCambio = Math.abs(diferencia / primerConsumo) * 100;

      if (porcentajeCambio > 5) {
        tendencia = diferencia > 0 ? 'increasing' : 'decreasing';
      }
    }

    // Total acumulado año actual
    const anoActual = new Date().getFullYear();
    const totalAcumuladoAnual = lecturasOrdenadas
      .filter(l => {
        const ano = l.periodo.substring(2, 6);
        return ano === anoActual.toString();
      })
      .reduce((sum, l) => sum + (l.consumoPeriodo || 0), 0);

    // Alertas de sobreconsumo
    const lecturasConSobreconsumo = lecturasOrdenadas.filter(
      l => l.sobreconsumo && l.sobreconsumo > 0
    );
    const alertasSobreconsumo = lecturasConSobreconsumo.length;

    // Filtrar según toggle
    const lecturasFiltered = showOnlyOverconsumption
      ? lecturasConSobreconsumo
      : lecturasOrdenadas;

    return {
      consumoPromedio,
      consumoUltimoPeriodo,
      consumoPeriodoAnterior,
      variacionPorcentaje,
      tendencia,
      totalAcumuladoAnual,
      alertasSobreconsumo,
      lecturasConSobreconsumo,
      lecturasFiltered
    };
  }, [detalleLecturas, showOnlyOverconsumption]);

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'Periodo',
      'Fecha Lectura',
      'Lectura Anterior',
      'Lectura Actual',
      'Consumo (m³)',
      'Energía Base (m³)',
      'Sobreconsumo (m³)',
      'Estado'
    ];

    const rows = dashboardStats.lecturasFiltered.map(l => [
      l.periodo,
      new Date(l.fechaLectura).toLocaleDateString('es-CL'),
      l.lecturaAnterior || '0',
      l.lecturaActual || '0',
      l.consumoPeriodo || '0',
      l.energiaBase || '0',
      l.sobreconsumo || '0',
      l.sobreconsumo && l.sobreconsumo > 0 ? 'Alerta' : 'Normal'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consumo-electrico-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Dashboard de Consumo Eléctrico
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Análisis detallado del consumo energético
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

      {/* KPIs Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Consumo Promedio Mensual */}
        <Card className="border bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Consumo Promedio
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {dashboardStats.consumoPromedio.toLocaleString('es-CL', {
                    maximumFractionDigits: 0
                  })}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    m³ / mes
                  </p>
                  {dashboardStats.consumoUltimoPeriodo >
                  dashboardStats.consumoPromedio ? (
                    <Badge variant="destructive" className="text-xs h-4 px-1.5">
                      Sobre media
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs h-4 px-1.5">
                      Bajo media
                    </Badge>
                  )}
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Consumo Último Periodo */}
        <Card className="border bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Último Periodo
                </p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {dashboardStats.consumoUltimoPeriodo.toLocaleString('es-CL')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {dashboardStats.variacionPorcentaje !== 0 && (
                    <>
                      {dashboardStats.variacionPorcentaje > 0 ? (
                        <TrendingUp className="h-3 w-3 text-rose-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-emerald-600" />
                      )}
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        {dashboardStats.variacionPorcentaje > 0 ? '+' : ''}
                        {dashboardStats.variacionPorcentaje.toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Total Acumulado Anual */}
        <Card className="border bg-linear-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  Total {new Date().getFullYear()}
                </p>
                <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">
                  {dashboardStats.totalAcumuladoAnual.toLocaleString('es-CL')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-xs text-violet-600 dark:text-violet-400">
                    m³ acumulado
                  </p>
                  <Badge
                    variant={
                      dashboardStats.tendencia === 'increasing'
                        ? 'destructive'
                        : dashboardStats.tendencia === 'decreasing'
                          ? 'default'
                          : 'secondary'
                    }
                    className="text-xs h-4 px-1.5"
                  >
                    {dashboardStats.tendencia === 'increasing'
                      ? 'Subiendo'
                      : dashboardStats.tendencia === 'decreasing'
                        ? 'Bajando'
                        : 'Estable'}
                  </Badge>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-violet-600 dark:text-violet-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Sobreconsumo */}
        <Card className="border bg-linear-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
                  Alertas Sobreconsumo
                </p>
                <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                  {dashboardStats.alertasSobreconsumo}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    periodos con exceso
                  </p>
                  {dashboardStats.alertasSobreconsumo > 0 && (
                    <Badge variant="destructive" className="text-xs h-4 px-1.5">
                      Activo
                    </Badge>
                  )}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Filtros y Estadísticas */}
      <Card className="border bg-background">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base font-medium">
              Filtros y Configuración
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {dashboardStats.lecturasFiltered.length} registros
              </Badge>
              <Button
                variant={showOnlyOverconsumption ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setShowOnlyOverconsumption(!showOnlyOverconsumption)
                }
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Solo Sobreconsumoss
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs con visualizaciones */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger value="tendencia" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendencia
          </TabsTrigger>
          <TabsTrigger value="analisis" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="detalles" className="gap-2">
            <Activity className="h-4 w-4" />
            Detalles
          </TabsTrigger>
        </TabsList>

        {/* Tab: Tendencia */}
        <TabsContent value="tendencia" className="space-y-4">
          <ConsumptionTrendChart
            detalleLecturas={dashboardStats.lecturasFiltered}
            consumoPromedio={dashboardStats.consumoPromedio}
          />
        </TabsContent>

        {/* Tab: Análisis de Sobreconsumo */}
        <TabsContent value="analisis" className="space-y-4">
          <OverconsumptionAnalysis
            detalleLecturas={dashboardStats.lecturasConSobreconsumo}
          />
        </TabsContent>

        {/* Tab: Detalles */}
        <TabsContent value="detalles" className="space-y-4">
          <ConsumptionDetailsTable
            detalleLecturas={dashboardStats.lecturasFiltered}
          />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Última actualización: {new Date().toLocaleString('es-CL')}
      </div>
    </div>
  );
});

export default EnergyConsumptionDashboard;
