import {
  Activity,
  DollarSign,
  Receipt,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';

import { memo, useMemo } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import type { DetalleFacturas } from '~/types/reportes';

import { calcularEstadoFactura, formatCurrency } from './billing-dashboard';

interface BillingKPIsProps {
  facturas: Array<
    DetalleFacturas & { consumoPeriodo: number; costoPorKwh: number }
  >;
}

const BillingKPIs = memo(function BillingKPIs({ facturas }: BillingKPIsProps) {
  const kpis = useMemo(() => {
    if (facturas.length === 0) {
      return {
        facturacionPromedio: 0,
        ultimaFactura: null,
        variacionUltima: 0,
        gastoAcumuladoAnual: 0,
        costoPromedioKwh: 0,
        tendenciaCosto: 'stable' as const
      };
    }

    // Facturación promedio
    const facturacionPromedio =
      facturas.reduce((sum, f) => sum + (f.valorTotal || 0), 0) /
      facturas.length;

    // Última factura
    const ultimaFactura = facturas[facturas.length - 1];
    const penultimaFactura =
      facturas.length > 1 ? facturas[facturas.length - 2] : null;

    // Variación última factura
    const variacionUltima = penultimaFactura
      ? ((ultimaFactura.valorTotal! - penultimaFactura.valorTotal!) /
          penultimaFactura.valorTotal!) *
        100
      : 0;

    // Gasto acumulado año actual
    const anoActual = new Date().getFullYear().toString();
    const gastoAcumuladoAnual = facturas
      .filter(f => {
        const ano = f.periodo.substring(2, 6);
        return ano === anoActual;
      })
      .reduce((sum, f) => sum + (f.valorTotal || 0), 0);

    // Costo promedio por m³
    const costoPromedioKwh =
      facturas.reduce((sum, f) => sum + (f.costoPorKwh || 0), 0) /
      facturas.length;

    // Tendencia del costo (últimos 6 meses)
    const ultimos6 = facturas.slice(-6);
    if (ultimos6.length >= 3) {
      const primerosCostos = ultimos6.slice(0, 3);
      const ultimosCostos = ultimos6.slice(-3);

      const promedioPrimeros =
        primerosCostos.reduce((sum, f) => sum + (f.costoPorKwh || 0), 0) / 3;
      const promedioUltimos =
        ultimosCostos.reduce((sum, f) => sum + (f.costoPorKwh || 0), 0) / 3;

      const diferencia = promedioUltimos - promedioPrimeros;
      const porcentajeCambio = Math.abs(diferencia / promedioPrimeros) * 100;

      if (porcentajeCambio > 5) {
        return {
          facturacionPromedio,
          ultimaFactura,
          variacionUltima,
          gastoAcumuladoAnual,
          costoPromedioKwh,
          tendenciaCosto:
            diferencia > 0 ? ('increasing' as const) : ('decreasing' as const)
        };
      }
    }

    return {
      facturacionPromedio,
      ultimaFactura,
      variacionUltima,
      gastoAcumuladoAnual,
      costoPromedioKwh,
      tendenciaCosto: 'stable' as const
    };
  }, [facturas]);

  const estadoUltimaFactura = kpis.ultimaFactura
    ? calcularEstadoFactura(kpis.ultimaFactura.fechaVencimiento)
    : null;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Facturación Promedio */}
      <Card className="border bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Facturación Promedio
              </p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {formatCurrency(kpis.facturacionPromedio)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {kpis.variacionUltima !== 0 && (
                  <>
                    {kpis.variacionUltima > 0 ? (
                      <TrendingUp className="h-3 w-3 text-rose-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-emerald-600" />
                    )}
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      {kpis.variacionUltima > 0 ? '+' : ''}
                      {kpis.variacionUltima.toFixed(1)}% vs anterior
                    </span>
                  </>
                )}
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Última Factura */}
      <Card className="border bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Última Factura
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {kpis.ultimaFactura
                  ? formatCurrency(kpis.ultimaFactura.valorTotal!)
                  : '$0'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {estadoUltimaFactura && (
                  <Badge
                    variant={
                      estadoUltimaFactura.estado === 'vencida'
                        ? 'destructive'
                        : 'default'
                    }
                    className="text-xs h-4 px-1.5"
                  >
                    {estadoUltimaFactura.estado === 'vencida'
                      ? `Vencida ${estadoUltimaFactura.diasVencido} días`
                      : `${estadoUltimaFactura.diasRestantes} días`}
                  </Badge>
                )}
              </div>
            </div>
            <Receipt className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Gasto Acumulado Anual */}
      <Card className="border bg-linear-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                Total {new Date().getFullYear()}
              </p>
              <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">
                {formatCurrency(kpis.gastoAcumuladoAnual)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  acumulado del año
                </p>
              </div>
            </div>
            <Activity className="h-8 w-8 text-violet-600 dark:text-violet-400 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Costo Promedio por m³ */}
      <Card className="border bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Costo Promedio/m³
              </p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                ${kpis.costoPromedioKwh.toFixed(0)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Badge
                  variant={
                    kpis.tendenciaCosto === 'increasing'
                      ? 'destructive'
                      : kpis.tendenciaCosto === 'decreasing'
                        ? 'default'
                        : 'secondary'
                  }
                  className="text-xs h-4 px-1.5"
                >
                  {kpis.tendenciaCosto === 'increasing'
                    ? 'Subiendo'
                    : kpis.tendenciaCosto === 'decreasing'
                      ? 'Bajando'
                      : 'Estable'}
                </Badge>
              </div>
            </div>
            <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default BillingKPIs;
