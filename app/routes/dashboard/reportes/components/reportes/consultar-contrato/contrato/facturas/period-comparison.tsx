import { TrendingDown, TrendingUp } from 'lucide-react';

import { memo, useMemo } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import type { DetalleFacturas } from '~/types/reportes';

import { formatCurrency } from './billing-dashboard';

interface PeriodComparisonProps {
  facturas: Array<
    DetalleFacturas & { consumoPeriodo: number; costoPorKwh: number }
  >;
  selectedPeriods: [string, string];
  onPeriodsChange: (periods: [string, string]) => void;
}

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

const PeriodComparison = memo(function PeriodComparison({
  facturas,
  selectedPeriods,
  onPeriodsChange
}: PeriodComparisonProps) {
  const periodoOptions = useMemo(() => {
    return facturas.map(f => {
      const { mes, ano } = extraerAnoMes(f.periodo);
      return {
        value: f.periodo,
        label: `${getNombreMes(mes)} ${ano}`
      };
    });
  }, [facturas]);

  const comparison = useMemo(() => {
    if (!selectedPeriods[0] || !selectedPeriods[1]) return null;

    const periodo1 = facturas.find(f => f.periodo === selectedPeriods[0]);
    const periodo2 = facturas.find(f => f.periodo === selectedPeriods[1]);

    if (!periodo1 || !periodo2) return null;

    const calcularDiferencia = (val1: number, val2: number) => {
      const diferencia = val2 - val1;
      const porcentaje = val1 > 0 ? (diferencia / val1) * 100 : 0;
      return { diferencia, porcentaje };
    };

    return {
      periodo1,
      periodo2,
      consumo: calcularDiferencia(
        periodo1.consumoPeriodo,
        periodo2.consumoPeriodo
      ),
      valorNeto: calcularDiferencia(periodo1.valorNeto!, periodo2.valorNeto!),
      iva: calcularDiferencia(periodo1.iva!, periodo2.iva!),
      valorTotal: calcularDiferencia(
        periodo1.valorTotal!,
        periodo2.valorTotal!
      ),
      costoPorKwh: calcularDiferencia(
        periodo1.costoPorKwh,
        periodo2.costoPorKwh
      )
    };
  }, [facturas, selectedPeriods]);

  return (
    <Card className="border bg-background">
      <CardHeader>
        <CardTitle className="text-base">Comparación de Periodos</CardTitle>
        <CardDescription>
          Selecciona dos periodos para comparar métricas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selectores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Periodo 1</Label>
              <Select
                value={selectedPeriods[0]}
                onValueChange={value =>
                  onPeriodsChange([value, selectedPeriods[1]])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona periodo" />
                </SelectTrigger>
                <SelectContent>
                  {periodoOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Periodo 2</Label>
              <Select
                value={selectedPeriods[1]}
                onValueChange={value =>
                  onPeriodsChange([selectedPeriods[0], value])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona periodo" />
                </SelectTrigger>
                <SelectContent>
                  {periodoOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resultados de comparación */}
          {comparison && (
            <div className="mt-6 space-y-4">
              {/* Consumo */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Consumo (kWh)</span>
                  {comparison.consumo.porcentaje !== 0 && (
                    <div className="flex items-center gap-1">
                      {comparison.consumo.porcentaje > 0 ? (
                        <TrendingUp className="h-4 w-4 text-rose-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-emerald-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${comparison.consumo.porcentaje > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                      >
                        {comparison.consumo.porcentaje > 0 ? '+' : ''}
                        {comparison.consumo.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    {comparison.periodo1.consumoPeriodo.toLocaleString('es-CL')}
                  </span>
                  <span>→</span>
                  <span>
                    {comparison.periodo2.consumoPeriodo.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>

              {/* Valor Total */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Valor Total</span>
                  {comparison.valorTotal.porcentaje !== 0 && (
                    <div className="flex items-center gap-1">
                      {comparison.valorTotal.porcentaje > 0 ? (
                        <TrendingUp className="h-4 w-4 text-rose-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-emerald-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${comparison.valorTotal.porcentaje > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                      >
                        {comparison.valorTotal.porcentaje > 0 ? '+' : ''}
                        {comparison.valorTotal.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{formatCurrency(comparison.periodo1.valorTotal!)}</span>
                  <span>→</span>
                  <span>{formatCurrency(comparison.periodo2.valorTotal!)}</span>
                </div>
              </div>

              {/* Costo por kWh */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Costo por kWh</span>
                  {comparison.costoPorKwh.porcentaje !== 0 && (
                    <div className="flex items-center gap-1">
                      {comparison.costoPorKwh.porcentaje > 0 ? (
                        <TrendingUp className="h-4 w-4 text-rose-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-emerald-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${comparison.costoPorKwh.porcentaje > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                      >
                        {comparison.costoPorKwh.porcentaje > 0 ? '+' : ''}
                        {comparison.costoPorKwh.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>${comparison.periodo1.costoPorKwh.toFixed(0)}</span>
                  <span>→</span>
                  <span>${comparison.periodo2.costoPorKwh.toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}

          {!comparison && (
            <div className="text-center py-8 text-slate-500 text-sm">
              Selecciona dos periodos para comparar
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default PeriodComparison;
